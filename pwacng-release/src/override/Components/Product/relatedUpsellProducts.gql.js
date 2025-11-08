import { gql } from '@apollo/client';
import { ProductFragment } from './productFragment.gql';

const RELATED_UPSELL_PRODUCTS = gql`
    query products($sku: String!) {
        products(
            filter: {
                sku: {
                    eq: $sku
                }
            }
        ) {
            items {
                sku
                __typename
                uid
                related_products {
                    ...ProductFragment
                }
                upsell_products {
                    ...ProductFragment
                }
            }
        }
    }
    ${ProductFragment}
`;
export default RELATED_UPSELL_PRODUCTS;
