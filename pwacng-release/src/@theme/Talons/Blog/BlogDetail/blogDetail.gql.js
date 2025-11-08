import gql from 'graphql-tag';

export const GET_BLOG_DETAIL = gql`
    query blogList ($urlKey: String!) {
        blogList(
            urlKey: $urlKey
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

const INCREASE_BLOG_VIEW_MUTATION = gql`
    mutation IncreaseBlogView (
        $urlKey: String!
    ) {
        increaseBlogView (
            input: {
                urlKey: $urlKey
            }
        ) {
            has_increase
        }
    }
`

export default {
    getBlogDetail: GET_BLOG_DETAIL,
    increaseBlogView: INCREASE_BLOG_VIEW_MUTATION
}
