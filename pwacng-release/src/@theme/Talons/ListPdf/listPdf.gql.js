import { gql } from '@apollo/client';

export const LIST_PDF_QUERY = gql`
    query listPdf ($categoryId: String, $currentPage: Int!, $pageSize: Int!) {
        listPdf (
            category_id: $categoryId,
            currentPage: $currentPage,
            pageSize: $pageSize
        ) {
            items {
                id
                title
                description
                url_pdf
                url_banner
            }
            page_info {
                current_page
                page_size
                total_pages
            }
        }
    }
`
