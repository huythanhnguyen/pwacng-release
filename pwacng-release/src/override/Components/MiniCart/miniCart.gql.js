import { gql } from '@apollo/client';
import { MiniCartFragment } from '@magento/peregrine/lib/talons/MiniCart/miniCartFragments.gql';
import { GrandTotalFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/priceSummaryFragments.gql.js';
import { DiscountSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/discountSummary.gql';
import { ShippingSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/shippingSummary.gql';
import { TaxSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/taxSummary.gql';

/**
 * @deprecated - Moved to @magento/peregrine/lib/talons/MiniCart/miniCartFragments.gql
 */
export { MiniCartFragment };

export const MINI_CART_QUERY = gql`
    query MiniCartQuery($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...MiniCartFragment
        }
    }
    ${MiniCartFragment}
`;

export const REMOVE_ITEM_MUTATION = gql`
    mutation RemoveItemForMiniCart($cartId: String!, $itemId: ID!) {
        removeItemFromCart(
            input: { cart_id: $cartId, cart_item_uid: $itemId }
        ) {
            cart {
                id
                total_quantity
                # If this mutation causes "free" to become available we need to know.
                available_payment_methods {
                    code
                    title
                }
                items {
                    uid
                    prices {
                        total_item_discount {
                            value
                        }
                        row_total {
                            value
                        }
                    }
                    product {
                        id
                        uid
                    }
                    prices {
                        price {
                            currency
                            value
                        }
                        row_total {
                            value
                        }
                        total_item_discount {
                            value
                        }
                    }
                    quantity
                    errors {
                        code
                        message
                    }
                }
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                ...ShippingSummaryFragment
                prices {
                    ...TaxSummaryFragment
                    ...DiscountSummaryFragment
                    ...GrandTotalFragment
                    subtotal_excluding_tax {
                        currency
                        value
                    }
                    subtotal_including_tax {
                        currency
                        value
                    }
                    totals_tax {
                        value
                        currency
                    }
                }
            }
        }
    }
    ${DiscountSummaryFragment}
    ${GrandTotalFragment}
    ${ShippingSummaryFragment}
    ${TaxSummaryFragment}
`;

export default {
    miniCartQuery: MINI_CART_QUERY,
    removeItemMutation: REMOVE_ITEM_MUTATION
};
