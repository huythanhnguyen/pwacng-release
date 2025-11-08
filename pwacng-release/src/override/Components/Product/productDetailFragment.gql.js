import { gql } from '@apollo/client';

export const ProductDetailsFragment = gql`
    fragment ProductDetailsFragment on ProductInterface {
        __typename
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        categories {
            uid
            breadcrumbs {
                category_uid
            }
            name
        }
         main_category {
            uid
            id
            name
            breadcrumbs {
                category_uid
                category_level
                category_name
                category_url_key
                category_url_path
            }
        }
        description {
            html
        }
        short_description {
            html
        }
        id
        uid
        is_alcohol
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        media_gallery_entries {
            uid
            label
            position
            disabled
            file
            video_content {
                video_url
                video_title
            }
        }
        meta_description
        url_suffix
        name
        ecom_name
        mm_product_type
        unit_ecom
        mm_brand
        dnr_price {
            qty
            promo_label
            promo_type
            promo_amount
            promo_value
            event_id
            event_name
        }
        art_no
        price {
            regularPrice {
                amount {
                    currency
                    value
                }
            }
        }
        price_range {
            maximum_price {
                final_price {
                    currency
                    value
                }
                discount {
                    amount_off
                    percent_off
                }
            }
        }
        sku
        small_image {
            url
        }
        stock_status
        url_key
        canonical_url
        product_label {
            label_id
            label_description
            label_name
            label_status
            label_from_date
            label_to_date
            label_priority
            label_type
            stores
            customer_groups
            product_image {
                type
                url
                position
                display
                text
                text_color
                text_font
                text_size
                shape_type
                shape_color
                label_size
                label_size_mobile
                custom_css
                use_default
            }
            category_image {
                type
                url
                position
                display
                text
                text_color
                text_font
                text_size
                shape_type
                shape_color
                label_size
                label_size_mobile
                custom_css
            }
        }
        rating_summary
        review_count
        reviews {
            items {
                average_rating
                ratings_breakdown {
                    name
                    value
                }
            }
        }
        similar_products {
            uid
            sku
            name
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
            small_image {
                url
            }
            url_key
        }
        custom_attributes {
            selected_attribute_options {
                attribute_option {
                    uid
                    label
                    is_default
                }
            }
            entered_attribute_value {
                value
            }
            attribute_metadata {
                uid
                code
                label
                attribute_labels {
                    store_code
                    label
                }
                data_type
                is_system
                entity_type
                ui_input {
                    ui_input_type
                    is_html_allowed
                }
                ... on ProductAttributeMetadata {
                    used_in_components
                }
            }
        }
        additional_attributes {
            attribute_code
            label
            value
        }
        ... on ConfigurableProduct {
            # eslint-disable-next-line @graphql-eslint/require-id-when-available
            configurable_options {
                attribute_code
                attribute_id
                uid
                label
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                values {
                    uid
                    default_label
                    label
                    store_label
                    use_default_value
                    value_index
                    swatch_data {
                        ... on ImageSwatchData {
                            thumbnail
                        }
                        value
                    }
                }
            }
            variants {
                attributes {
                    code
                    value_index
                }
                # eslint-disable-next-line @graphql-eslint/require-id-when-available
                product {
                    uid
                    # eslint-disable-next-line @graphql-eslint/require-id-when-available
                    media_gallery_entries {
                        uid
                        disabled
                        file
                        label
                        position
                    }
                    sku
                    stock_status
                    price {
                        regularPrice {
                            amount {
                                currency
                                value
                            }
                        }
                    }
                    price_range {
                        maximum_price {
                            final_price {
                                currency
                                value
                            }
                            discount {
                                amount_off
                            }
                        }
                    }
                    custom_attributes {
                        selected_attribute_options {
                            attribute_option {
                                uid
                                label
                                is_default
                            }
                        }
                        entered_attribute_value {
                            value
                        }
                        attribute_metadata {
                            uid
                            code
                            label
                            attribute_labels {
                                store_code
                                label
                            }
                            data_type
                            is_system
                            entity_type
                            ui_input {
                                ui_input_type
                                is_html_allowed
                            }
                            ... on ProductAttributeMetadata {
                                used_in_components
                            }
                        }
                    }
                }
            }
        }
    }
`;
