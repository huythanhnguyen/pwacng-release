import { gql } from '@apollo/client';
import { DashboardContentFragment } from './dashboardContentFragment.gql.js';

export const GET_CUSTOMER_INFORMATION = gql`
    query GetCustomerInformation {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            ...DashboardContentFragment
        }
    }
    ${DashboardContentFragment}
`;

export default {
    queries: {
        getCustomerInformationQuery: GET_CUSTOMER_INFORMATION
    }
};
