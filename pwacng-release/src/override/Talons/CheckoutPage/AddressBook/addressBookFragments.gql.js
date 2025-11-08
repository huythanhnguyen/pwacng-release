import { gql } from '@apollo/client';

export const CustomerAddressFragment = gql`
    fragment CustomerAddressFragment on CustomerAddress {
        id
        city
        country_code
        default_shipping
        is_new_administrative
        firstname
        postcode
        region {
            region
            region_code
            region_id
        }
        street
        telephone
        custom_attributes {
            attribute_code
            value
        }
    }
`;

export const AddressBookFragment = gql`
    fragment AddressBookFragment on Customer {
        id
        addresses {
            id
            ...CustomerAddressFragment
        }
    }
    ${CustomerAddressFragment}
`;
