import { gql } from '@apollo/client';

export const UPDATE_COMMENT_ON_CART_ITEM = gql`
    mutation updateCommentOnCartItem (
        $cartId: String!,
        $cartItemUid: ID!,
        $comment: String!
    ) {
        updateCommentOnCartItem (
            input: {
                cart_id: $cartId,
                cart_item_uid: $cartItemUid,
                comment: $comment
            }
        ) {
            cart {
               id
               items {
                 uid
                 comment
               }
            }
        }
    }
`

export const REMOVE_COMMENT_ON_CART_ITEM = gql`
    mutation removeCommentFromCartItem (
        $cartId: String!,
        $cartItemUid: ID!
    ) {
        removeCommentFromCartItem (
            input: {
                cart_id: $cartId,
                cart_item_uid: $cartItemUid
            }
        ) {
            cart {
                id
                items {
                    uid
                    comment
                }
            }
        }
    }
`

export default  {
    updateCommentOnCartItem: UPDATE_COMMENT_ON_CART_ITEM,
    removeCommentOnCartItem: REMOVE_COMMENT_ON_CART_ITEM
}
