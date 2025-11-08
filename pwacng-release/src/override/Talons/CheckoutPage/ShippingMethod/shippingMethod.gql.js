import { gql } from '@apollo/client';

import { PriceSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/priceSummaryFragments.gql';
import { ShippingInformationFragment } from '../ShippingInformation/shippingInformationFragments.gql';
import { ItemsReviewFragment } from '../ItemsReview/itemsReviewFragments.gql';

import {
    AvailableShippingMethodsCheckoutFragment,
    SelectedShippingMethodCheckoutFragment
} from '@magento/peregrine/lib/talons/CheckoutPage/ShippingMethod/shippingMethodFragments.gql';

export const GET_SELECTED_AND_AVAILABLE_SHIPPING_METHODS = gql`
    query getSelectedAndAvailableShippingMethods($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...AvailableShippingMethodsCheckoutFragment
            ...SelectedShippingMethodCheckoutFragment
            # We include the following fragments to avoid extra requeries
            # after this mutation completes. This all comes down to not
            # having ids for shipping address objects. With ids we could
            # merge results.
            ...ShippingInformationFragment
            ...ItemsReviewFragment
            prices {
                grand_total {
                    value
                    currency
                }
                subtotal_excluding_tax {
                    value
                    currency
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
    ${AvailableShippingMethodsCheckoutFragment}
    ${SelectedShippingMethodCheckoutFragment}
    ${ShippingInformationFragment}
    ${ItemsReviewFragment}
`;

export const SET_SHIPPING_METHOD = gql`
    mutation SetShippingMethod(
        $cartId: String!
        $shippingMethod: ShippingMethodInput!
        $deliveryDate: DeliveryDateInput!
    ) {
        setShippingMethodsOnCart(
            input: { cart_id: $cartId, shipping_methods: [$shippingMethod], delivery_date: $deliveryDate }
        ) {
            cart {
                id
                # If this mutation causes "free" to become available we need to know.
                available_payment_methods {
                    code
                    title
                }
                ...SelectedShippingMethodCheckoutFragment
                ...PriceSummaryFragment
                # We include the following fragments to avoid extra requeries
                # after this mutation completes. This all comes down to not
                # having ids for shipping address objects. With ids we could
                # merge results.
                ...ShippingInformationFragment
                ...AvailableShippingMethodsCheckoutFragment
            }
        }
    }
    ${AvailableShippingMethodsCheckoutFragment}
    ${SelectedShippingMethodCheckoutFragment}
    ${PriceSummaryFragment}
    ${ShippingInformationFragment}
`;

export default {
    setShippingMethodMutation: SET_SHIPPING_METHOD,
    getSelectedAndAvailableShippingMethodsQuery: GET_SELECTED_AND_AVAILABLE_SHIPPING_METHODS
};
