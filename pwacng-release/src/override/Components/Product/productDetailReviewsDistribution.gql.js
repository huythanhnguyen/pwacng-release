import { gql } from '@apollo/client';

const PRODUCT_DETAIL_REVIEWS_DISTRIBUTION = gql`
    query products(
        $sku: String!
    ) {
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
                name
                review_count
                rating_summary
                review_distribution {
                    level
                    count
                }
            }
        }
    }
`;
export default PRODUCT_DETAIL_REVIEWS_DISTRIBUTION;
