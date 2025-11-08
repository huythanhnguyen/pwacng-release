import gql from 'graphql-tag';

export const GET_BLOG_CATEGORY = gql`
    query blogCategory {
        blogCategory {
            categories {
                id
                name
                url_key
                meta_title
                meta_keywords
                meta_description
                blog_count
            }
        }
    }
`

export const GET_ARCHIVED_BLOG = gql`
    query archivedBlog {
        archivedBlog {
            archived_blogs {
                name
                date
                blog_count
            }
        }
    }
`

export default {
    getBlogCategory: GET_BLOG_CATEGORY,
    getArchivedBlog: GET_ARCHIVED_BLOG
}
