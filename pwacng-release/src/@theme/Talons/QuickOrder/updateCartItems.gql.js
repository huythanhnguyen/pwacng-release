import { gql } from '@apollo/client';

const ADD_ITEMS = gql`
    mutation AddItemsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
        addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
            cart {
                id
                prices {
                    discounts {
                        amount {
                            currency
                            value
                        }
                        label
                    }
                    grand_total {
                        currency
                        value
                    }
                    subtotal_excluding_tax {
                        currency
                        value
                    }
                    subtotal_including_tax {
                        currency
                        value
                    }
                    subtotal_with_discount_excluding_tax {
                        currency
                        value
                    }
                }
                total_quantity
                items {
                    uid
                    product {
                        id
                        uid
                    }
                    prices {
                        price {
                            currency
                            value
                        }
                        row_total {
                            currency
                            value
                        }
                        total_item_discount {
                            value
                        }
                    }
                    quantity
                }
            }
            user_errors {
                code
                message
            }
        }
    }
`;
export default {
    ADD_ITEMS
};
