import { gql } from '@apollo/client';

import { DiscountSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/discountSummary.gql';
import { GiftCardSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/queries/giftCardSummary';
import { GiftOptionsSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/queries/giftOptionsSummary';
import { ShippingSummaryFragment } from './shippingSummary.gql';
import { TaxSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/taxSummary.gql';

export const GrandTotalFragment = gql`
    fragment GrandTotalFragment on CartPrices {
        grand_total {
            currency
            value
        }
    }
`;

export const PriceSummaryFragment = gql`
    fragment PriceSummaryFragment on Cart {
        id
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        items {
            uid
            quantity
        }
        ...ShippingSummaryFragment
        prices {
            ...TaxSummaryFragment
            ...DiscountSummaryFragment
            ...GrandTotalFragment
            subtotal_with_discount_excluding_tax {
                currency
                value
            }
            subtotal_excluding_tax {
                currency
                value
            }
            subtotal_including_tax {
                currency
                value
            }
        }
        ...GiftCardSummaryFragment
        ...GiftOptionsSummaryFragment
    }
    ${DiscountSummaryFragment}
    ${GiftCardSummaryFragment}
    ${GiftOptionsSummaryFragment}
    ${GrandTotalFragment}
    ${ShippingSummaryFragment}
    ${TaxSummaryFragment}
`;
