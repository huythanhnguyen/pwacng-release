import gql from 'graphql-tag';

export const GET_SEARCH_NEWS = gql`
    query searchNews ($search: String, $date: String, $categoryId: String, $currentPage: Int!, $pageSize: Int!) {
        searchNews (
            search: $search
            date: $date
            categoryId: $categoryId
            currentPage: $currentPage
            pageSize: $pageSize
        ) {
            items {
                id
                title
                url_key
                content
                short_content
                image
                source_edition
                image_thumb
                tags
                meta_title
                meta_keywords
                meta_description
                publish_date
                is_active
                views
            }
            page_info {
                current_page
                page_size
                total_pages
            }
        }
    }
`

export default {
    getSearchNews: GET_SEARCH_NEWS
}
