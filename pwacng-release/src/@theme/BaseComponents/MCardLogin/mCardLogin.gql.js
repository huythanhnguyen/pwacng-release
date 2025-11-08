import { gql } from '@apollo/client';
import {CheckoutPageFragment} from "@magento/peregrine/lib/talons/CheckoutPage/checkoutPageFragments.gql";

export const GENERATE_LOGIN_MCARD_INFO = gql`
    mutation generateLoginMcardInfo(
        $hash: String,
        $token: String,
        $store: String!,
        $custNo: String!,
        $phone: String!
        $custNoMM: String!,
        $custName: String!
    ) {
        generateLoginMcardInfo(input: {
            hash: $hash,
            token: $token,
            store: $store,
            cust_no: $custNo,
            phone: $phone,
            cust_no_mm: $custNoMM,
            cust_name: $custName
        }) {
            customer_token
            store_view_code
        }
    }
`;

export const CREATE_CUSTOMER_FORM_MCART_MUTATION = gql`
    mutation createCustomerFromMcard (
        $input: CustomerCreateInput!
    ) {
        createCustomerFromMcard(input: $input) {
            customer_token
            customer {
                email
                firstname
            }
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
    generateLoginMCardInfo: GENERATE_LOGIN_MCARD_INFO,
    getStoreConfigQuery: GET_STORE_CONFIG_DATA,
    createCartMutation: CREATE_CART,
    mergeCartsMutation: MERGE_CARTS,
    getCustomerQuery: GET_CUSTOMER,
    createCustomerFromMCard: CREATE_CUSTOMER_FORM_MCART_MUTATION
}
