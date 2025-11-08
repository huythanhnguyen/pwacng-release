import { gql } from '@apollo/client';
import {ProductFragment} from "../../../override/Components/Product/productFragment.gql";

const ADD_SINGLE_PRODUCT_TO_LIST_QUICK_ORDER_MUTATION = gql`
    mutation addSingleProductToListQuickOrder (
        $sku: String!,
        $qty: Float!
    ) {
        addSingleProductToListQuickOrder (
            input: {
                sku: $sku,
                qty: $qty
            }
        ) {
            messages {
                success
                message
            }
            quick_order {
                id
                items {
                    item_id
                    sku
                    qty
                }
            }
        }
    }
`

const ADD_MULTIPLE_PRODUCTS_TO_LIST_QUICK_ORDER_MUTATION = gql`
    mutation addMultipleProductsToListQuickOrder (
        $skus: String!
    ) {
        addMultipleProductsToListQuickOrder (
            input: {
                skus: $skus
            }
        ) {
            messages {
                success
                message
            }
            quick_order {
                id
                items {
                    item_id
                    sku
                    qty
                }
            }
        }
    }
`

const GET_QUICK_ORDER = gql`
    query getQuickOrder {
        getQuickOrder {
            id
            items {
                qty
                item_id
                comment
                product {
                    ...ProductFragment
                }
            }
        }
    }
    ${ProductFragment}
`

const GET_STORE_CONFIG = gql`
    query getStoreConfigForCartPage {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            commentMaxLength
            product_url_suffix
        }
    }
`;

const UPDATE_ITEM_QUICK_ORDER_MUTATION = gql`
    mutation updateItemQuickOrder (
        $itemId: String!,
        $qty: Float!
    ) {
        updateItemQuickOrder (
            input: {
                item_id: $itemId,
                qty: $qty
            }
        ) {
            success
            message
        }
    }
`

const REMOVE_ITEM_QUICK_ORDER = gql`
    mutation removeItemQuickOrder($itemId: String!) {
        removeItemQuickOrder(
            input: {
                item_id: $itemId
            }
        ) {
            success
            message
        }
    }
`

const REMOVE_ALL_QUICK_ORDER = gql`
    mutation removeQuickOrder {
        removeQuickOrder {
            success
            message
        }
    }
`

const ADD_ALL_ITEM_TO_CART = gql`
    mutation addAllItemQuickOrderToCart {
        addAllItemQuickOrderToCart {
            success
            message
        }
    }
`

const ADD_CSV_FILE_TO_LIST_QUICK_ORDER_MUTATION = gql`
    mutation ($base64_encoded_data: String!) {
        addProductsByFileToListQuickOrder(
            input: {
                base64_encoded_data: $base64_encoded_data
            }
        ) {
            messages {
                success
                message
            }
            quick_order {
                id
                items {
                    item_id
                    sku
                    qty
                }
            }
        }
    }
`

export const GET_AUTOCOMPLETE_RESULTS = gql`
    query getAutocompleteResults($inputText: String!, $asmUid: String, $pageSize: Int!) {
        # Limit results to first three.
        products(search: $inputText, asm_uid: $asmUid, currentPage: 1, pageSize: $pageSize) {
            items {
                art_no
                id
                uid
                sku
                name
                unit_ecom
                mm_product_type
                stock_status
                small_image {
                    url
                }
                canonical_url
                url_key
                url_suffix
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
        }
    }
`;

const UPDATE_ITEM_COMMENT_QUICK_ORDER = gql`
    mutation updateItemCommentQuickOrder (
        $itemId: String!
        $comment: String
    ) {
        updateItemCommentQuickOrder (
            input: {
                item_id: $itemId
                comment: $comment
            }
        ) {
            success
            message
        }
    }
`

export default {
    addSingleProduct: ADD_SINGLE_PRODUCT_TO_LIST_QUICK_ORDER_MUTATION,
    addMultipleProduct: ADD_MULTIPLE_PRODUCTS_TO_LIST_QUICK_ORDER_MUTATION,
    getQuickOrder: GET_QUICK_ORDER,
    getStoreConfig: GET_STORE_CONFIG,
    updateItemQuickOrder: UPDATE_ITEM_QUICK_ORDER_MUTATION,
    removeItemQuickOrder: REMOVE_ITEM_QUICK_ORDER,
    removeAllQuickOrder: REMOVE_ALL_QUICK_ORDER,
    addAllItemToCart: ADD_ALL_ITEM_TO_CART,
    addCsvFileProduct: ADD_CSV_FILE_TO_LIST_QUICK_ORDER_MUTATION,
    getAutocompleteResults: GET_AUTOCOMPLETE_RESULTS,
    updateItemCommentQuickOrder: UPDATE_ITEM_COMMENT_QUICK_ORDER
}
