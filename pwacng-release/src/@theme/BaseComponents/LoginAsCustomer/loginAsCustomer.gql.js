import { gql } from '@apollo/client';
import {CheckoutPageFragment} from "@magento/peregrine/lib/talons/CheckoutPage/checkoutPageFragments.gql";
export const GENERATE_CUSTOMER_TOKEN_BY_SECRET = gql`
    mutation generateCustomerTokenBySecret ($input: GenerateCustomerTokenBySecretInput!) {
        generateCustomerTokenBySecret (input: $input) {
            customer_token
        }
    }
`

export const GET_STORE_CONFIG_DATA = gql`
    query GetStoreConfigData {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            minimum_password_length
            customer_access_token_lifetime
        }
    }
`;

export const CREATE_CART = gql`
    mutation CreateCartAfterSignIn {
        cartId: createEmptyCart
    }
`;

export const MERGE_CARTS = gql`
    mutation MergeCartsAfterSignIn(
        $sourceCartId: String!
        $destinationCartId: String!
    ) {
        mergeCarts(
            source_cart_id: $sourceCartId
            destination_cart_id: $destinationCartId
        ) {
            id
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            items {
                uid
            }
            ...CheckoutPageFragment
        }
    }
    ${CheckoutPageFragment}
`;

export const GET_CUSTOMER = gql`
    query GetCustomerAfterSignIn {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            customer_uid
            email
            firstname
            custom_attributes(attributeCodes: ["company_user_phone_number"]) {
                code
                ... on AttributeValue {
                    value
                }
            }
            is_subscribed
        }
    }
`;

export default {
    generateCustomerTokenBySecret: GENERATE_CUSTOMER_TOKEN_BY_SECRET,
    getStoreConfigQuery: GET_STORE_CONFIG_DATA,
    createCartMutation: CREATE_CART,
    mergeCartsMutation: MERGE_CARTS,
    getCustomerQuery: GET_CUSTOMER,
}
