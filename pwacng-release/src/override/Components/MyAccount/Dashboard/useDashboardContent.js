import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';

export const useDashboardContent = props => {
    const {
        queries: { getCustomerInformationQuery }
    } = props;

    const [{ isSignedIn }] = useUserContext();

    const { data: accountInformationData, error: loadDataError } = useQuery(
        getCustomerInformationQuery,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const initialValues = useMemo(() => {
        if (accountInformationData) {
            return { customer: accountInformationData.customer };
        }
    }, [accountInformationData]);


    return {
        initialValues,
        loadDataError
    };
};
