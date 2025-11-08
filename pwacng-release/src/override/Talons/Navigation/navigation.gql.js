import { gql } from '@apollo/client';

export const GET_CUSTOMER = gql`
    query GetCustomerForLeftNav {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            customer_uid
            email
            firstname
            is_subscribed
            custom_attributes(attributeCodes: ["company_user_phone_number"]) {
                code
                ... on AttributeValue {
                    value
                }
            }
        }
    }
`;

const GET_ROOT_CATEGORY_ID = gql`
    query getRootCategoryId {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            root_category_uid
        }
    }
`;

export default {
    getCustomerQuery: GET_CUSTOMER,
    getRootCategoryId: GET_ROOT_CATEGORY_ID
};
