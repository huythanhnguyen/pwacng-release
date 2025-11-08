import { gql } from '@apollo/client';
import { CartPageFragment } from '@magento/peregrine/lib/talons/CartPage/cartPageFragments.gql';
import { ProductFragment } from '../../Components/Product/productFragment.gql';

const GET_CART_DETAILS = gql`
    query GetCartDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...CartPageFragment
        }
    }
    ${CartPageFragment}
`;

const GET_CROSS_SELL_QUERY = gql`
    query Products ($skus: [String!]!) {
        products(filter: { sku: {in: $skus} }) {
            items {
                uid
                crosssell_products {
                    ...ProductFragment
                }
            }
        }
    }
    ${ProductFragment}
`

export const REMOVE_ALL_CART_ITEMS_MUTATION = gql`
    mutation removeAllItemsFromCart ($cartId: String!) {
        removeAllCartItems(
            input: {
                cart_id: $cartId
            }
        ) {
            success
        }
    }
`

export const CHECK_PRICE_CHANGE_QUERY = gql`
    query CheckPriceChange ($cartId: String!) {
        CheckPriceChange(cart_id: $cartId){
            is_price_change
        }
    }
`

export default {
    getCartDetailsQuery: GET_CART_DETAILS,
    getCrossSellQuery: GET_CROSS_SELL_QUERY,
    removeAllCartItemsMutation: REMOVE_ALL_CART_ITEMS_MUTATION,
    checkPriceChange: CHECK_PRICE_CHANGE_QUERY
};
