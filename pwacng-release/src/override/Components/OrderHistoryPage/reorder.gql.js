import { gql } from '@apollo/client';

export const REORDER = gql`
    mutation reorder($orderNumber: String!){
        reorderItems(orderNumber: $orderNumber) {
            cart{
                id
                items {
                    product {
                        sku
                    }
                }
            }
        }
    }
`;

export default {
    getReorderQuery: REORDER
};
