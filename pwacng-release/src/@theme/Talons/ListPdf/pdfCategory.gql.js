import { gql } from '@apollo/client';

const PdfCategoryQuery = gql`
    query listPdfCategory {
        listPdfCategory {
            category_id
            name
            count
        }
    }
`;
export default PdfCategoryQuery;
