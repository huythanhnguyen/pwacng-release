import { gql } from '@apollo/client';

import { CartTriggerFragment } from '@magento/peregrine/lib/talons/Header/cartTriggerFragments.gql';
import { MiniCartFragment } from '@magento/peregrine/lib/talons/MiniCart/miniCartFragments.gql';
import { WishlistPageFragment } from '@magento/peregrine/lib/talons/WishlistPage/wishlistFragment.gql';

export const ADD_WISHLIST_ITEM_TO_CART = gql`
    mutation AddWishlistItemToCart(
        $cartId: String!
        $cartItem: CartItemInput!
    ) {
        addProductsToCart(cartId: $cartId, cartItems: [$cartItem]) {
            cart {
                id
                ...CartTriggerFragment
                ...MiniCartFragment
            }
        }
    }
    ${CartTriggerFragment}
    ${MiniCartFragment}
`;

export const REMOVE_PRODUCTS_FROM_WISHLIST = gql`
    mutation RemoveProductsFromWishlist(
        $wishlistId: ID!
        $wishlistItemsId: [ID!]!
    ) {
        removeProductsFromWishlist(
            wishlistId: $wishlistId
            wishlistItemsIds: $wishlistItemsId
        ) {
            wishlist {
                id
                ...WishlistPageFragment
            }
        }
    }
    ${WishlistPageFragment}
`;

export const GET_WISHLIST_ID_BY_PRODUCT = gql`
    query GetWishlistIdByProduct(
        $sku: String!
    ) {
        getWishlistIdByProduct(
            sku: $sku
        ) {
            wishlist_id
            wishlist_item_id
        }
    }
`;

export default {
    addWishlistItemToCartMutation: ADD_WISHLIST_ITEM_TO_CART,
    removeProductsFromWishlistMutation: REMOVE_PRODUCTS_FROM_WISHLIST,
    getWishlistIdByProductQuery: GET_WISHLIST_ID_BY_PRODUCT
};
