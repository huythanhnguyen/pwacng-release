import { gql } from '@apollo/client';

export const GET_AUTOCOMPLETE_RESULTS = gql`
    query getAutocompleteResults($inputText: String!, $asmUid: String, $pageSize: Int!) {
        # Limit results to first three.
        products(search: $inputText, asm_uid: $asmUid, currentPage: 1, pageSize: $pageSize) {
            is_sku_redirect
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
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            items {
                art_no
                id
                uid
                sku
                name
                ecom_name
                categories {
                    uid
                    breadcrumbs {
                        category_uid
                    }
                    name
                }
                unit_ecom
                is_alcohol
                mm_product_type
                stock_status
                small_image {
                    url
                }
                canonical_url
                url_key
                url_suffix
                price {
                    regularPrice {
                        amount {
                            value
                            currency
                        }
                    }
                }
                price_range {
                    maximum_price {
                        final_price {
                            currency
                            value
                        }
                        regular_price {
                            currency
                            value
                        }
                        discount {
                            amount_off
                        }
                    }
                }
            }
            page_info {
                total_pages
            }
            total_count
        }
    }
`;

const GET_SEARCH_SUGGESTIONS_QUERY = gql`
    query getSearchSuggestions($q: String!, $asmUid: String) {
        getSearchSuggestions(q: $q, asm_uid: $asmUid) {
            suggestions {
                type
                title
            }
        }
    }
`

export const GET_SEARCH_CONFIG_QUERY = gql`
    query storeConfig {
        storeConfig {
            historyAutocomplete
            popularTermAutocomplete
            productAutocomplete
            categoryAutocomplete,
            store_code
        }
    }
`

const GET_CMS_BLOCK_CONTENT = gql`
    query getCmsBlockContent {
        getCmsBlockContent {
            categoryBlock
            customBlock
        }
    }
`

export default {
    getAutocompleteResults: GET_AUTOCOMPLETE_RESULTS,
    getSearchSuggestions: GET_SEARCH_SUGGESTIONS_QUERY,
    getSearchConfig: GET_SEARCH_CONFIG_QUERY,
    getCmsBlockContent: GET_CMS_BLOCK_CONTENT
}
