import { gql } from '@apollo/client';

import { CustomerAddressBookAddressFragment } from '../../../Talons/AddressBookPage/addressBookFragments.gql';

export const DashboardContentFragment = gql`
    fragment DashboardContentFragment on Customer {
        id
        firstname
        email
        loyalty_points
        custom_attributes(attributeCodes: ["company_user_phone_number"]) {
            code
            ... on AttributeValue {
                value
            }
        }
        addressesV2(
            currentPage: 1
            pageSize: 1
        ) {
            total_count
            total_pages
            addresses {
                id
                ...CustomerAddressBookAddressFragment
            }
        }
        orders(currentPage: 1, pageSize: 2, sort: { sort_field: CREATED_AT, sort_direction: DESC }) {
            items {
                id
                number
                order_date
                total {
                    grand_total {
                        value
                        currency
                    }
                }
                status
                status_code
                state
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
                        ecom_name
                        uid
                        unit_ecom
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
            }
            total_count
        }
    }
    ${CustomerAddressBookAddressFragment}
`;
