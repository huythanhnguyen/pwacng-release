import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import DEFAULT_OPERATIONS from './orderHistoryPage.gql';
import { GET_AVAILABLE_STATUS } from '../../Components/OrderHistoryPage/availableStatus.gql';

const PAGE_SIZE = 10;

export const useOrderHistoryPage = (props = {}) => {
    const { currentPage, startDate, endDate, filterStatus } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getCustomerOrdersQuery } = operations;

    const [
        ,
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();

    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [searchText, setSearchText] = useState('');

    const formatDate = (dateString) => {
        if (!dateString || dateString === '' || dateString === null) return '';
        const date = new Date(dateString).toLocaleDateString("en-GB");
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };
    const {
        data: orderData,
        error: getOrderError,
        loading: orderLoading
    } = useQuery(getCustomerOrdersQuery, {
        fetchPolicy: 'cache-and-network',
        variables: {
            filter: {
                number: {
                    match: searchText
                },
                createDateFrom: {
                    gteq: formatDate(startDate)
                },
                createDateTo: {
                    lteq: formatDate(endDate)
                },
                status: {
                    eq: filterStatus
                }
            },
            currentPage,
            pageSize
        }
    });

    // Get available Status
    const { data: availableStatusData, error: availableStatusError, loading: availableStatusLoading } = useQuery(GET_AVAILABLE_STATUS, {});

    const orders = orderData ? orderData.customer.orders.items : [];

    const isLoadingWithoutData = !orderData && orderLoading;
    const isBackgroundLoading = !!orderData && orderLoading;

    const pageInfo = useMemo(() => {
        if (orderData) {
            const { total_count } = orderData.customer.orders;

            return {
                current: pageSize < total_count ? pageSize : total_count,
                total: total_count,
                totalPages: Math.ceil(total_count / PAGE_SIZE),
            };
        }

        return null;
    }, [orderData, pageSize]);

    const derivedErrorMessage = useMemo(
        () => deriveErrorMessage([getOrderError]),
        [getOrderError]
    );

    const handleReset = useCallback(() => {
        setSearchText('');
    }, []);

    const handleSubmit = useCallback(({ search }) => {
        setSearchText(search);
    }, []);

    const loadMoreOrders = useMemo(() => {
        if (orderData) {
            const { page_info } = orderData.customer.orders;
            const { current_page, total_pages } = page_info;

            if (current_page < total_pages) {
                return () => setPageSize(current => current + PAGE_SIZE);
            }
        }

        return null;
    }, [orderData]);

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isBackgroundLoading);
    }, [isBackgroundLoading, setPageLoading]);

    return {
        errorMessage: derivedErrorMessage,
        handleReset,
        handleSubmit,
        isBackgroundLoading,
        isLoadingWithoutData,
        loadMoreOrders,
        orders,
        pageInfo,
        searchText,
        availableStatusData,
        availableStatusError,
        availableStatusLoading
    };
};
