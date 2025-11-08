import { gql } from '@apollo/client';

export const CustomerAddressBookAddressFragment = gql`
    fragment CustomerAddressBookAddressFragment on CustomerAddress {
        __typename
        id
        firstname
        telephone
        default_shipping
        is_new_administrative
        country_code
        city
        street
        custom_attributes {
            attribute_code
            value
        }
    }
`;
