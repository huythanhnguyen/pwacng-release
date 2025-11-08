import { gql } from '@apollo/client';
import { ProductFragment } from 'src/override/Components/Product/productFragment.gql';

export const GET_PRODUCTS_BY_SKU = gql`
    query getProductsBySku($skus: [String], $pageSize: Int!) {
        products(filter: { sku: { in: $skus } }, pageSize: $pageSize, sort_sku_by_input: true) {
            items {
                ...ProductFragment
            }
            total_count
            filters {
                name
                filter_items_count
                request_var
                filter_items {
                    label
                    value_string
                }
            }
        }
    }
    ${ProductFragment}
`;
