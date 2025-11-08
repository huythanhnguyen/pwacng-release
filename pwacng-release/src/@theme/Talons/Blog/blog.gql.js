import gql from 'graphql-tag';

export const GET_BLOG_LIST = gql`
    query blogList ($sort: SortBlogInput, $currentPage: Int!, $pageSize: Int!) {
        blogList(
            sort: $sort,
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

export const GET_LAST_ARTICLE = gql`
    query blogList ($sort: SortBlogInput, $currentPage: Int!, $pageSize: Int!) {
        blogList(
            sort: $sort,
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
    getBlogList: GET_BLOG_LIST,
    getLastArticle: GET_LAST_ARTICLE
}
