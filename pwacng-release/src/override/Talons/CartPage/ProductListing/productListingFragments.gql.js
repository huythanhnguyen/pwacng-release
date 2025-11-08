import { gql } from '@apollo/client';

export const ProductListingFragment = gql`
    fragment ProductListingFragment on Cart {
        id
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        items {
            comment
            uid
            id
            have_same_promotion
            have_great_deal
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            product {
                id
                uid
                art_no
                name
                ecom_name
                is_alcohol
                mm_product_type
                sku
                url_key
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
                small_image {
                    url
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
                            code
                            value_index
                        }
                        # eslint-disable-next-line @graphql-eslint/require-id-when-available
                        product {
                            uid
                            stock_status
                            small_image {
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
                    value
                }
                total_item_discount {
                    value
                }
            }
            quantity
            errors {
                code
                message
            }
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            ... on ConfigurableCartItem {
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                configurable_options {
                    id
                    configurable_product_option_uid
                    option_label
                    configurable_product_option_value_uid
                    value_label
                    value_id
                }
            }
        }
    }
`;
