import { gql } from '@apollo/client';
import { CheckoutPageFragment } from '@magento/peregrine/lib/talons/CheckoutPage/checkoutPageFragments.gql';
import { ItemsReviewFragment } from './ItemsReview/itemsReviewFragments.gql';
import { OrderConfirmationPageFragment } from './OrderConfirmationPage/orderConfirmationPageFragments.gql';

export const CREATE_CART = gql`
    # This mutation will return a masked cart id. If a bearer token is provided for
    # a logged in user it will return the cart id for that user.
    mutation createCart {
        cartId: createEmptyCart
    }
`;

export const PLACE_ORDER = gql`
    mutation placeOrder($cartId: String!) {
        placeOrder(input: { cart_id: $cartId }) {
            orderV2 {
                id
                number
                status
                payment_methods {
                    name
                    type
                    pay_url
                }
            }
            errors {
                message
                code
            }
        }
    }
`;

// A query to fetch order details _right_ before we submit, so that we can pass
// data to the order confirmation page.
export const GET_ORDER_DETAILS = gql`
    query getOrderDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...OrderConfirmationPageFragment
        }
    }
    ${OrderConfirmationPageFragment}
`;

export const GET_CHECKOUT_DETAILS = gql`
    query getCheckoutDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...CheckoutPageFragment
            ...ItemsReviewFragment
            prices {
                grand_total {
                    value
                    currency
                }
                subtotal_excluding_tax {
                    currency
                    value
                }
                discounts {
                    amount {
                        currency
                        value
                    }
                    label
                }
            }
        }
    }
    ${CheckoutPageFragment}
    ${ItemsReviewFragment}
`;

export default {
    createCartMutation: CREATE_CART,
    getCheckoutDetailsQuery: GET_CHECKOUT_DETAILS,
    getOrderDetailsQuery: GET_ORDER_DETAILS,
    placeOrderMutation: PLACE_ORDER
};
