import { gql } from '@apollo/client';
import { ProductFragment } from '../../Components/Product/productFragment.gql';

export const GET_FLASHSALE_PRODUCTS = gql`
    query getFlashSaleProducts($pageSize: Int!) {
        getFlashSaleProducts(pageSize: $pageSize) {
            end_time
            items {
                ...ProductFragment
            }
            total_count
        }
    }
    ${ProductFragment}
`;

export default GET_FLASHSALE_PRODUCTS;
