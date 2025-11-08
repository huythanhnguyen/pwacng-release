import { gql } from '@apollo/client';
import { PriceSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/priceSummaryFragments.gql';

export const AvailablePaymentMethodsFragment = gql`
    fragment AvailablePaymentMethodsFragment on Cart {
        id
        available_payment_methods {
            code
            title
        }
    }
`;

export const GET_PAYMENT_INFORMATION = gql`
    query getPaymentInformation($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            selected_payment_method {
                code
            }
            shipping_addresses {
                is_new_administrative
                city
                country {
                    code
                    label
                }
                firstname
                postcode
                region {
                    code
                    label
                    region_id
                }
                street
                telephone
                city_code
                district
                district_code
                ward
                ward_code
            }
            ...AvailablePaymentMethodsFragment
        }
    }
    ${AvailablePaymentMethodsFragment}
`;

export const GET_PAYMENT_NONCE = gql`
    query getPaymentNonce($cartId: String!) {
        cart(cart_id: $cartId) @client {
            id
            paymentNonce
        }
    }
`;

export const SET_BILLING_ADDRESS = gql`
    mutation setBillingAddress(
        $cartId: String!
        $firstname: String!
        $lastname: String!
        $street: [String]!
        $city: String!
        $cityCode: String!
        $wardCode: String!
        $countryCode: String!
        $telephone: String!
    ) {
        setBillingAddressOnCart(
            input: {
                cart_id: $cartId
                billing_address: {
                    address: {
                        firstname: $firstname
                        lastname: $lastname
                        street: $street
                        city: $city
                        city_code: $cityCode
                        ward_code: $wardCode
                        country_code: $countryCode
                        telephone: $telephone
                        save_in_address_book: false
                    }
                }
            }
        ) {
            cart {
                id
                billing_address {
                    firstname
                    country {
                        code
                    }
                    street
                    city
                    region {
                        code
                    }
                    postcode
                    telephone
                }
                ...PriceSummaryFragment
                ...AvailablePaymentMethodsFragment
            }
        }
    }
    ${PriceSummaryFragment}
    ${AvailablePaymentMethodsFragment}
`;

// Sets the provided payment method object on the cart.
export const SET_FREE_PAYMENT_METHOD_ON_CART = gql`
    mutation setPaymentMethodOnCart($cartId: String!) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: { code: "free" } }
        ) {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;

export default {
    getPaymentNonceQuery: GET_PAYMENT_NONCE,
    getPaymentInformationQuery: GET_PAYMENT_INFORMATION,
    setBillingAddressMutation: SET_BILLING_ADDRESS,
    setFreePaymentMethodMutation: SET_FREE_PAYMENT_METHOD_ON_CART
};
