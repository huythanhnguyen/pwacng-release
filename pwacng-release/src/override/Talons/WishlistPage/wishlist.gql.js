import { gql } from '@apollo/client';

import { WishlistPageFragment } from '@magento/peregrine/lib/talons/WishlistPage/wishlistFragment.gql';
import { WishlistItemFragment } from './wishlistItemFragments.gql';

export const GET_CUSTOMER_WISHLIST = gql`
    query GetCustomerWishlist {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            wishlists {
                id
                ...WishlistPageFragment
            }
        }
    }
    ${WishlistPageFragment}
`;

export const GET_CUSTOMER_WISHLIST_ITEMS = gql`
    query getCustomerWishlist($id: ID!, $currentPage: Int) {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            wishlist_v2(id: $id) {
                id
                items_v2(pageSize: 5, currentPage: $currentPage) {
                    items {
                        id
                        ...WishlistItemFragment
                    }
                    page_info {
                        page_size
                        current_page
                        total_pages
                    }
                }
            }
        }
    }
    ${WishlistItemFragment}
`;

export default {
    getCustomerWishlistQuery: GET_CUSTOMER_WISHLIST,
    getCustomerWishlistItems: GET_CUSTOMER_WISHLIST_ITEMS
};
