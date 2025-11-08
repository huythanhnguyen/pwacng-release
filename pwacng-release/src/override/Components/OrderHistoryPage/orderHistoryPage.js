import React, {useMemo, useEffect, useState, useCallback} from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {
    Search as SearchIcon,
    AlertCircle as AlertCircleIcon,
    ArrowRight as SubmitIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from 'react-feather';
import { shape, string } from 'prop-types';
import { Form } from 'informed';

import { useToasts } from '@magento/peregrine/lib/Toasts';
import OrderHistoryContextProvider from '@magento/peregrine/lib/talons/OrderHistoryPage/orderHistoryContext';
import { useOrderHistoryPage } from '@magento/peregrine/lib/talons/OrderHistoryPage/useOrderHistoryPage';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import Icon from '@magento/venia-ui/lib/components/Icon';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import TextInput from '@magento/venia-ui/lib/components/TextInput';

import datePickerClasses from 'react-datepicker/dist/react-datepicker.module.css';
import accountClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderHistoryPage.module.scss';
import OrderRow from './orderRow';
import ResetButton from '@magento/venia-ui/lib/components/OrderHistoryPage/resetButton';
import MyAccountLayout from "../MyAccount/myAccountLayout";
import DatePicker from 'react-datepicker/dist/react-datepicker';
import Select from "../Select/select";
import Field from "@magento/venia-ui/lib/components/Field";
import {useLocation} from "react-router-dom";

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const OrderHistoryPage = props => {
    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const defaultStatus = query.get('status');

    const [isOpenSidebar, setIsOpenSidebar] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [filterStatus, setFilterStatus] = useState(defaultStatus || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const talonProps = useOrderHistoryPage({ currentPage, startDate, endDate, filterStatus });
    const {
        errorMessage,
        handleReset,
        handleSubmit,
        isBackgroundLoading,
        isLoadingWithoutData,
        orders,
        pageInfo,
        searchText,
        availableStatusData,
        availableStatusError,
        availableStatusLoading
    } = talonProps;

    const [totalPages, setTotalPages] = useState(pageInfo?.totalPages || 0);
    useEffect(() => {
        if (pageInfo) {
            setTotalPages(pageInfo.totalPages);
        }
    }, [pageInfo]);

    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const PAGE_TITLE = formatMessage({
        id: 'global.orderManagement',
        defaultMessage: 'My purchase'
    });
    const SEARCH_PLACE_HOLDER = formatMessage({
        id: 'orderHistoryPage.search',
        defaultMessage: 'Enter order number'
    });
    const SEARCH_BUTTON = formatMessage({
        id: 'orderHistoryPage.searchButton',
        defaultMessage: 'Search'
    });

    const ordersCountMessage = formatMessage(
        {
            id: 'orderHistoryPage.ordersCount',
            defaultMessage: 'You have {count} orders in your history.'
        },
        { count: orders.length }
    );

    const classes = useStyle(datePickerClasses, defaultClasses, accountClasses, props.classes);

    const orderRows = useMemo(() => {
        return orders.map(order => {
            return <OrderRow key={order.id} order={order} />;
        });
    }, [orders]);

    const pagesToShow = useMemo(() => {
        const pages = [];
        const startPage = Math.max(1, currentPage - 1); // Bắt đầu từ 2 trang trước trang hiện tại
        const endPage = Math.min(totalPages - 1, currentPage + 1); // Kết thúc với 2 trang sau trang hiện tại

        if (currentPage === 1) {
            pages.push(1);
            if (totalPages > 2) pages.push(2);
            if (totalPages > 3) pages.push(3);
        }
        else if (currentPage === totalPages || currentPage === (totalPages - 1)) {
            if (totalPages > 3) pages.push(totalPages - 3);
            if (totalPages > 2) pages.push(totalPages - 2);
            if (totalPages > 1) pages.push(totalPages - 1);
        }
        else {
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    const paginationControls = useMemo(() => {
        return (
            <div className={classes.pagination}>
                <button className={classes.firstPage} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <Icon className={(currentPage === 1) ? classes.icon_disabled : classes.icon} size={20} src={ChevronLeftIcon} />
                </button>
                {pagesToShow.map(page => (
                    <button
                        key={page}
                        className={currentPage === page ? classes.activePage : ''}
                        onClick={() => handlePageChange(page)}
                    >
                        <span>{page}</span>
                    </button>
                ))}
                <button className={classes.lastPage} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <Icon className={(currentPage === totalPages) ? classes.icon_disabled : classes.icon} size={20} src={ChevronRightIcon} />
                </button>
            </div>
        );
    }, [currentPage, totalPages, pagesToShow]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const availableStatus = useMemo(() => {
        if (availableStatusData && availableStatusData?.availableStatus?.length) {
            const statusItems = availableStatusData.availableStatus.map(item => ({
                label: item.label,
                value: item.status
            }));
            statusItems.unshift({
                label: formatMessage({
                    id: 'global.status',
                    defaultMessage: 'Status'
                }),
                value: ""
            });
            return (
                <div className={classes.filterStatus}>
                    <Select
                        field={'status'}
                        data-cy="status"
                        initialValue={filterStatus}
                        items={statusItems}
                        onChange={(e) => {
                            setCurrentPage(1);
                            setFilterStatus(e.target.value);
                        }}
                    />
                </div>
            )
        } else {
            return null;
        }
    }, [availableStatusData, filterStatus, setFilterStatus]);

    const filterDate = (
        <div className={classes.filterDate}>
            <DatePicker
                selected={startDate}
                onChange={(date) => {
                    setCurrentPage(1);
                    setStartDate(date);
                    if (endDate && date > endDate) setEndDate(null);
                }}
                maxDate={new Date()}
                placeholderText={formatMessage({ id: 'global.date', defaultMessage: 'Date' })}
                dateFormat="dd/MM/yyyy"
            />
            <span className={classes.dateToLabel}>
                <FormattedMessage
                    id={'orderHistoryPage.dateTo'}
                    defaultMessage={'To'}
                />
            </span>
            <DatePicker
                selected={endDate}
                onChange={(date) => {
                    setCurrentPage(1);
                    setEndDate(date);
                }}
                minDate={startDate}
                maxDate={new Date()}
                placeholderText={formatMessage({ id: 'global.date', defaultMessage: 'Date' })}
                dateFormat="dd/MM/yyyy"
            />
        </div>
    );

    const handleFilterSubmit = useCallback((e) => {
        setCurrentPage(1);
        handleSubmit(e);
    }, [handleSubmit])

    const pageContents = useMemo(() => {
        if (isLoadingWithoutData) {
            return <LoadingIndicator />;
        } else if (!isBackgroundLoading && searchText && !orders.length) {
            return (
                <h3 className={classes.emptyHistoryMessage}>
                    <FormattedMessage
                        id={'orderHistoryPage.invalidOrderNumber'}
                        defaultMessage={`Order "{searchText}" was not found.`}
                        values={{
                            number: searchText,
                            searchText: searchText
                        }}
                    />
                </h3>
            );
        } else if (!isBackgroundLoading && !orders.length) {
            return (
                <h3 className={classes.emptyHistoryMessage}>
                    <FormattedMessage
                        id={'orderHistoryPage.emptyDataMessage'}
                        defaultMessage={"You don't have any orders yet."}
                    />
                </h3>
            );
        } else {
            return (
                <div className={classes.orderHistoryWrapper}>
                    <table
                        className={classes.orderHistoryTable}
                        data-cy="OrderHistoryPage-orderHistoryTable"
                        width="100%" border="0" cellSpacing="0" cellPadding="0"
                    >
                        <thead>
                        <tr>
                            <th>
                                <FormattedMessage
                                    id={'global.order'}
                                    defaultMessage={"Order"}
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id={'order.orderDate'}
                                    defaultMessage={"Order date"}
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id={'global.sendTo'}
                                    defaultMessage={"Send to"}
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id={'global.orderTotal'}
                                    defaultMessage={"Order Total"}
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id={'global.status'}
                                    defaultMessage={"Status"}
                                />
                            </th>
                            <th>
                                <FormattedMessage
                                    id={'global.action'}
                                    defaultMessage={"Actions"}
                                />
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            {orderRows}
                        </tbody>
                    </table>
                    {totalPages > 0 && paginationControls}
                </div>
            );
        }
    }, [
        classes.emptyHistoryMessage,
        classes.orderHistoryTable,
        isBackgroundLoading,
        isLoadingWithoutData,
        orderRows,
        orders.length,
        searchText,
        totalPages,
        paginationControls
    ]);

    const resetButtonElement = searchText ? (
        <ResetButton onReset={handleReset} />
    ) : null;

    useEffect(() => {
        if (errorMessage) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorMessage,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [addToast, errorMessage]);

    return (
        <OrderHistoryContextProvider>
            <MyAccountLayout currentPage={'orderManagement'} isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar}>
                <h2 className={classes.currentPageTitle}>
                    <button className={classes.backButton} onClick={() => setIsOpenSidebar(true)}>
                        <span>{'<'}</span>
                    </button>
                    <span>
                        {PAGE_TITLE}
                    </span>
                </h2>
                <div className={classes.root}>
                    <StoreTitle>{PAGE_TITLE}</StoreTitle>
                    <div className={classes.filterWrapper}>
                        <Form className={classes.filterRow} onSubmit={handleFilterSubmit}>
                            <div className={classes.search}>
                                <div className={classes.searchInput}>
                                    <TextInput
                                        after={resetButtonElement}
                                        field="search"
                                        id={classes.search}
                                        placeholder={SEARCH_PLACE_HOLDER}
                                    />
                                </div>
                                <Button
                                    disabled={
                                        isBackgroundLoading || isLoadingWithoutData
                                    }
                                    priority={'high'}
                                    type="submit"
                                    aria-label="submit"
                                >
                                    {SEARCH_BUTTON}
                                </Button>
                            </div>
                            <div className={classes.dateStatusFilter}>
                                {filterDate}
                                {availableStatus}
                            </div>
                        </Form>
                    </div>
                    {pageContents}
                </div>
            </MyAccountLayout>
        </OrderHistoryContextProvider>
    );
};

export default OrderHistoryPage;

OrderHistoryPage.propTypes = {
    classes: shape({
        root: string,
        heading: string,
        emptyHistoryMessage: string,
        orderHistoryWrapper: string,
        orderHistoryTable: string,
        search: string,
        searchInput: string,
        searchButton: string,
        submitIcon: string,
        loadMoreButton: string,
        paginationControls: string,
        activePage: string
    })
};
