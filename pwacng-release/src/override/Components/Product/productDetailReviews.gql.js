import { gql } from '@apollo/client';

const PRODUCT_DETAIL_REVIEWS = gql`
    query products(
        $sku: String!,
        $pageSize: Int!,
        $currentPage: Int!
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
                reviews (pageSize:  $pageSize, currentPage: $currentPage) {
                    items {
                        average_rating
                        summary
                        text
                        created_at
                        nickname
                    }
                    page_info {
                        total_pages
                        current_page
                    }
                }
            }
        }
    }
`;
export default PRODUCT_DETAIL_REVIEWS;
