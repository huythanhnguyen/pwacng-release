import { gql } from '@apollo/client';
import { ProductListFragment } from './ProductList/productListFragments.gql';

export const MiniCartFragment = gql`
    fragment MiniCartFragment on Cart {
        id
        total_quantity
        prices {
            discounts {
                amount {
                    currency
                    value
                }
                label
            }
            grand_total {
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
            subtotal_with_discount_excluding_tax {
                currency
                value
            }
        }
        ...ProductListFragment
    }
    ${ProductListFragment}
`;
