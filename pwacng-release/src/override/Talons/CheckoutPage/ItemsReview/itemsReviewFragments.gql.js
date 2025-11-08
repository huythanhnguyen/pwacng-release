import { gql } from '@apollo/client';

export const ItemsReviewFragment = gql`
    fragment ItemsReviewFragment on Cart {
        id
        total_quantity
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        items {
            uid
            comment
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            product {
                art_no
                uid
                sku
                ecom_name
                name
                is_alcohol
                id
                dnr_price {
                    qty
                    promo_label
                    promo_type
                    promo_amount
                    promo_value
                    event_id
                    event_name
                }
                thumbnail {
                    url
                }
                description {
                    html
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
            prices {
                price {
                    currency
                    value
                }
                row_total {
                    value
                }
                total_item_discount {
                    value
                }
            }
            quantity
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            ... on ConfigurableCartItem {
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                configurable_options {
                    configurable_product_option_uid
                    option_label
                    configurable_product_option_value_uid
                    value_label
                }
            }
        }
    }
`;
