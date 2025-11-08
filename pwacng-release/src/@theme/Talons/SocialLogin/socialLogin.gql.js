import gql from 'graphql-tag';
import {CheckoutPageFragment} from "@magento/peregrine/lib/talons/CheckoutPage/checkoutPageFragments.gql";

export const SOCIAL_LOGIN_MUTATION = gql`
    mutation SocialLogin (
        $provider: String!
        $token: String!
    ) {
        socialLogin(
            input: {
                provider: $provider
                token: $token
            }
        ) {
            token
            customer {
                id
                email
                firstname
                lastname
            }
        }
    }
`

export const SOCIAL_CREATE_MUTATION = gql`
    mutation SocialLogin (
        $provider: String!,
        $user_info: CustomerSocialLoginInfo!,
        $custom_attributes: [AttributeValueInput!]
    ) {
        socialLogin(
            input: {
                provider: $provider,
                user_info: $user_info,
                custom_attributes: $custom_attributes
            }
        ) {
            token
            customer {
                email
                firstname
                lastname
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
            email
            firstname
            lastname
            is_subscribed
        }
    }
`;

export default  {
    socialLoginMutation: SOCIAL_LOGIN_MUTATION,
    socialCreateMutation: SOCIAL_CREATE_MUTATION,
    getStoreConfigQuery: GET_STORE_CONFIG_DATA,
    createCartMutation: CREATE_CART,
    mergeCartsMutation: MERGE_CARTS,
    getCustomerQuery: GET_CUSTOMER,
}
