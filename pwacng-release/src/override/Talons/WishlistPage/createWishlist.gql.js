import { gql } from '@apollo/client';

export const CREATE_WISHLIST = gql`
    mutation createWishlist($input: CreateWishlistInput!) {
        createWishlist(input: $input) {
            wishlist {
                wishlist_id
                name
                customer_id
            }
        }
    }
`;

export const STORE_CONFIG_QUERY = gql`
    query storeConfig {
        storeConfig {
            wishlist_limit
            store_code
        }
    }
`;

export default {
    createWishlistMutation: CREATE_WISHLIST,
    getStoreConfig: STORE_CONFIG_QUERY
};
