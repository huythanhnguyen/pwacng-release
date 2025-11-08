import { gql } from '@apollo/client';

export const GET_SUGGEST_CATEGORY = gql`
    query getSuggestCategory($id: Int!) {
        category(id: $id) {
            uid
            suggestion_category {
                for_customer {
                    id
                    uid
                    name
                    url_image
                    url_key
                }
                for_guest {
                    id
                    uid
                    name
                    url_image
                    url_key
                }
            }
        }
    }
`;

export default GET_SUGGEST_CATEGORY;
