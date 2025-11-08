import { gql } from '@apollo/client';
import { ItemsReviewFragment } from '../ItemsReview/itemsReviewFragments.gql';

export const OrderConfirmationPageFragment = gql`
    fragment OrderConfirmationPageFragment on Cart {
        id
        email
        total_quantity
        shipping_addresses {
            firstname
            street
            city
            city_code
            ward
            ward_code
            region {
                label
            }
            postcode
            country {
                label
            }
            telephone
            selected_shipping_method {
                amount {
                    value
                    currency
                }
                carrier_title
                method_title
            }
        }
        selected_payment_method {
            purchase_order_number
            title
        }
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
        ...ItemsReviewFragment
    }
    ${ItemsReviewFragment}
`;
