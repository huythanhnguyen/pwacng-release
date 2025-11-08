import { gql } from '@apollo/client';

const GET_POPULAR_KEYWORDS_QUERY = gql`
    query getPopularKeywords {
        getPopularKeywords {
            items {
               name
               image_full_path
               url
               url_pwa
           }
           total_count
           version
           history_max
        }
    }
`;

export default GET_POPULAR_KEYWORDS_QUERY;
