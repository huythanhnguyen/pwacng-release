import { gql } from '@apollo/client';

const CustomerOrderFragment = gql`
    fragment CustomerOrderFragment on CustomerOrder {
        id
        number
        order_date
        customer_no
        is_sync_ccod
        shipping_code
        delivery_code
        delivery_status
        invoices {
            id
        }
        delivery_information {
            delivery_date
            delivery_from
            delivery_to
        }
        vat_information {
            company_address
            company_name
            company_vat_number
            customer_vat_id
        }
        items {
            id
            product_name
            product_sale_price {
                currency
                value
            }
            product_sku
            product_url_key
            selected_options {
                label
                value
            }
            quantity_ordered
            product {
                id
                uid
                unit_ecom
                ecom_name
                is_alcohol
                thumbnail {
                    url
                }
                canonical_url
                dnr_price {
                    qty
                    promo_label
                    promo_type
                    promo_amount
                    promo_value
                    event_id
                    event_name
                }
            }
        }
        promotion_message
        billing_address {
            firstname
            country_code
            city
            district
            ward
            street
            telephone
        }
        payment_methods {
            name
            type
            additional_data {
                name
                value
            }
        }
        shipments {
            id
            tracking {
                number
            }
        }
        shipping_address {
            firstname
            country_code
            city
            district
            ward
            street
            telephone
        }
        shipping_method
        status
        status_code
        state
        total {
            discounts {
                label
                amount {
                    currency
                    value
                }
            }
            grand_total {
                currency
                value
            }
            base_total_after_discount {
                currency
                value
            }
            subtotal {
                currency
                value
            }
            total_shipping {
                currency
                value
            }
            total_tax {
                currency
                value
            }
        }
    }
`;

export const GET_GUEST_ORDER = gql`
    query orderTracking(
        $order_number: String!
        $email: String!
    ) {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        orderTracking(order_number: $order_number, email: $email) {
            id
            email
            ...CustomerOrderFragment
        }
    }
    ${CustomerOrderFragment}
`;

export default {
    getCustomerOrderQuery: GET_GUEST_ORDER
};
