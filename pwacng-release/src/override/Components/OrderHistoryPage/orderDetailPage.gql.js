import { gql } from '@apollo/client';

const CustomerOrdersFragment = gql`
    fragment CustomerOrdersFragment on CustomerOrders {
        items {
            id
            number
            order_date
            customer_no
            is_sync_ccod
            shipping_code
            delivery_code
            delivery_status
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
            invoices {
                id
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
        page_info {
            current_page
            total_pages
        }
        total_count
    }
`;

export const GET_ORDER_DETAIL = gql`
    query GetCustomerOrders(
        $filter: CustomerOrdersFilterInput
        $pageSize: Int!
    ) {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            id
            firstname
            email
            custom_attributes(attributeCodes: ["company_user_phone_number"]) {
                code
                ... on AttributeValue {
                    value
                }
            }
            orders(filter: $filter, pageSize: $pageSize) {
                ...CustomerOrdersFragment
            }
        }
    }
    ${CustomerOrdersFragment}
`;

export const GET_DELIVERY_DETAIL = gql`
    query getDeliveryTracking(
        $order_id: Int!
        $email: String!
    ) {
        getDeliveryTracking(order_id: $order_id, email: $email) {
            tracking_link
            history {
                time
                status
                code
            }
        }
    }
`;

export default {
    getCustomerOrdersQuery: GET_ORDER_DETAIL,
    getDeliveryDetailQuery: GET_DELIVERY_DETAIL
};
