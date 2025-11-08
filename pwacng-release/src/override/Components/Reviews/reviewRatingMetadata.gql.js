import { gql } from '@apollo/client';

const GET_REVIEW_RATING_METADATA = gql`
    query productReviewRatingsMetadata {
        productReviewRatingsMetadata {
            items {
                id
                name
                values {
                    value_id
                    value
                }
           }
        }
    }
`;

export default GET_REVIEW_RATING_METADATA;
