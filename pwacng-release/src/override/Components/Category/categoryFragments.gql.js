import { gql } from '@apollo/client';
import { ProductFragment } from '../Product/productFragment.gql';

export const CategoryFragment = gql`
    # eslint-disable-next-line @graphql-eslint/require-id-when-available
    fragment CategoryFragment on CategoryTree {
        id
        uid
        meta_title
        meta_keywords
        meta_description
    }
`;

export const ProductsFragment = gql`
    fragment ProductsFragment on Products {
        items {
            ...ProductFragment
        }
        page_info {
            total_pages
        }
        total_count
    }
    ${ProductFragment}
`;
