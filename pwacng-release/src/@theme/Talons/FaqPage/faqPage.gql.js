import { gql } from '@apollo/client';

export const GET_FAQS_QUERY = gql`
    query getFaqs ($storeView: String!, $identifier: String) {
        faqs (store_view_code: $storeView, identifier: $identifier) {
            category_id
            is_active
            name
            icon
            url_key
            content_html_page_header
            content_html_page_footer
            faqs {
                id
                is_active
                question
                answer
            }
        }
    }
`
