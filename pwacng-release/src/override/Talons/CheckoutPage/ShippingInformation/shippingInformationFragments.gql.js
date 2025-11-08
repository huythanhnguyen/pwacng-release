import { gql } from '@apollo/client';

export const ShippingInformationFragment = gql`
    fragment ShippingInformationFragment on Cart {
        id
        email
        shipping_addresses {
            customer_address_id
            is_new_administrative
            city
            country {
                code
                label
            }
            firstname
            street
            telephone
            city_code
            district
            district_code
            ward
            ward_code
        }
        delivery_date {
            date
            time_interval_id
            comment
            from
            to
        }
        vat_address {
            customer_vat_id
            company_name
            company_vat_number
            company_address
        }
    }
`;
