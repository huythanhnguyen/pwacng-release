import { gql } from '@apollo/client';
import { ProductFragment } from '../../Components/Product/productFragment.gql';

export const GET_CUSTOMER_WISHLIST = gql`
    query GetCustomerWishlist {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            wishlists {
                id
                name
                items_count
                sharing_code
            }
        }
    }
`;

export const UPDATE_WISHLIST = gql`
    mutation UpdateWishlist(
        $name: String!
        $wishlistId: ID!
    ) {
        updateWishlist(
            name: $name
            wishlistId: $wishlistId
        ) {
            name
            wishlistId
            status
        }
    }
`;

export const DELETE_WISHLIST = gql`
    mutation DeleteWishlist(
        $wishlistId: ID!
    ) {
        deleteWishlist(wishlistId: $wishlistId) {
            status
        }
    }
`;

const RELATED_UPSELL_PRODUCTS = gql`
    query Products ($skus: [String!]!) {
        products(filter: { sku: {in: $skus} }) {
            items {
                uid
                related_products {
                    ...ProductFragment
                }
            }
        }
    }
    ${ProductFragment}
`;

export default {
    getCustomerWishlistQuery: GET_CUSTOMER_WISHLIST,
    updateWishlistMutation: UPDATE_WISHLIST,
    deleteWishlistMutation: DELETE_WISHLIST,
    getRelatedProduct: RELATED_UPSELL_PRODUCTS
};
