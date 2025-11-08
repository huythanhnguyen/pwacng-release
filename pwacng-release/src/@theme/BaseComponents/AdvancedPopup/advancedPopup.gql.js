import { gql } from '@apollo/client';

export const GET_POPUP = gql`
    query GET_POPUP(
        $category_uid: String!
        $link_popup: String!
    ) {
        getPopup(
            category_uid: $category_uid,
            link_popup: $link_popup
        ) {
            html_content
            css_style
            number_x
       }
    }
`;

export default GET_POPUP;
