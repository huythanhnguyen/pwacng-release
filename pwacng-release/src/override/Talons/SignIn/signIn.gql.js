import { gql } from '@apollo/client';
import { CheckoutPageFragment } from '@magento/peregrine/lib/talons/CheckoutPage/checkoutPageFragments.gql';
import { GET_STORE_CONFIG_DATA } from '../CreateAccount/createAccount.gql';

export const GET_CUSTOMER = gql`
    query GetCustomerAfterSignIn {
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

export const SIGN_IN = gql`
    mutation SignIn($email: String!, $password: String!) {
        generateCustomerTokenV2(email: $email, password: $password) {
            token
            location_user {
                region_id
                city
                city_code
                district
                district_code
                ward
                ward_code
                address
                store_view_code
            }
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

export default {
    createCartMutation: CREATE_CART,
    getCustomerQuery: GET_CUSTOMER,
    mergeCartsMutation: MERGE_CARTS,
    signInMutation: SIGN_IN,
    getStoreConfigQuery: GET_STORE_CONFIG_DATA
};
