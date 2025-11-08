import { gql } from '@apollo/client';

export const ProductListFragment = gql`
    fragment ProductListFragment on Cart {
        id
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        items {
            uid
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            product {
                id
                uid
                name
                ecom_name
                is_alcohol
                mm_product_type
                sku
                url_key
                art_no
                canonical_url
                thumbnail {
                    url
                }
                dnr_price {
                    qty
                    promo_label
                    promo_type
                    promo_amount
                    promo_value
                    event_id
                    event_name
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
                price {
                    regularPrice {
                        amount {
                            value
                        }
                    }
                }
                stock_status
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                ... on ConfigurableProduct {
                    variants {
                        attributes {
                            uid
                        }
                        # eslint-disable-next-line @graphql-eslint/require-id-when-available
                        product {
                            uid
                            thumbnail {
                                url
                            }
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
                    currency
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
