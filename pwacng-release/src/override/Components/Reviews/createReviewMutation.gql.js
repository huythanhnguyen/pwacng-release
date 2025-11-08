import { gql } from '@apollo/client';

const CREATE_REVIEW_MUTATION = gql`
    mutation CreateProductReview(
        $sku: String!,
        $nickname: String!,
        $summary: String!,
        $text: String!,
        $ratings: [ProductReviewRatingInput!]!
    ) {
        createProductReview(
            input: {
                sku: $sku
                nickname: $nickname
                summary: $summary
                text: $text
                ratings: $ratings
            }
        ) {
            review {
                product {
                    uid
                    rating_summary
                    review_count
                    __typename
                }
                nickname
                summary
                text
                average_rating
                ratings_breakdown {
                    name
                    value
                    __typename
                }
                created_at
                __typename
            }
        }
    }
`;
export default CREATE_REVIEW_MUTATION;
