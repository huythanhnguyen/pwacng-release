import { gql } from '@apollo/client';
import { ProductFragment } from '../../Components/Product/productFragment.gql';

export const GET_PAGE_SIZE = gql`
    query getPageSize {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            grid_per_page
        }
    }
`;

export const GET_PRODUCT_FILTERS_BY_SEARCH = gql`
    query getProductFiltersBySearch($search: String!) {
        products(search: $search) {
            aggregations {
                label
                count
                attribute_code
                options {
                    label
                    value
                }
                position
            }
        }
    }
`;

export const GET_SEARCH_TERM_DATA = gql`
    query getSearchTermData($search: String) {
        searchTerm(Search: $search) {
            query_text
            redirect
            popularity
        }
    }
`;

export const PRODUCT_SEARCH = gql`
    query ProductSearch(
        $currentPage: Int = 1
        $inputText: String!
        $pageSize: Int = 24
        $filters: ProductAttributeFilterInput!
        $sort: ProductAttributeSortInput
        $asmUid: String
        $phoneNumber: String
    ) {
        products(
            currentPage: $currentPage
            pageSize: $pageSize
            search: $inputText
            filter: $filters
            sort: $sort
            asm_uid: $asmUid
            phone_number: $phoneNumber
        ) {
            items {
                ...ProductFragment
                tracking_url
            }
            is_use_smart_search
            cdp_filter {
                label
                count
                attribute_code
                options {
                   label
                   value
                }
                position
            }
            aggregations {
                label
                count
                attribute_code
                options {
                    label
                    value
                }
                position
            }
            page_info {
                total_pages
            }
            total_count
        }
    }
    ${ProductFragment}
`;

export const GET_FILTER_INPUTS = gql`
    query GetFilterInputsForSearch {
        __type(name: "ProductAttributeFilterInput") {
            inputFields {
                name
                type {
                    name
                }
            }
        }
    }
`;

export const GET_SEARCH_AVAILABLE_SORT_METHODS = gql`
    query getSearchAvailableSortMethods($search: String!) {
        products(search: $search) {
            sort_fields {
                options {
                    label
                    value
                }
            }
        }
    }
`;

export default {
    getFilterInputsQuery: GET_FILTER_INPUTS,
    getPageSize: GET_PAGE_SIZE,
    getSearchTermData: GET_SEARCH_TERM_DATA,
    getProductFiltersBySearchQuery: GET_PRODUCT_FILTERS_BY_SEARCH,
    getSearchAvailableSortMethods: GET_SEARCH_AVAILABLE_SORT_METHODS,
    productSearchQuery: PRODUCT_SEARCH
};
