import { gql } from '@apollo/client';

export const ProductFragment = gql`
    fragment ProductFragment on ProductInterface {
        id
        uid
        name
        ecom_name
        is_alcohol
        categories {
            uid
            breadcrumbs {
                category_uid
            }
            name
        }
        mm_product_type
        unit_ecom
        url_suffix
        dnr_price_search_page {
            event_id
            event_name
        }
        art_no
        price {
            regularPrice {
                amount {
                    value
                    currency
                }
            }
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
        sku
        small_image {
            url
        }
        rating_summary
        stock_status
        __typename
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
    }
`;
