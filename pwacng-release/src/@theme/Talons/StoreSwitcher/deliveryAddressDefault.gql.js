import { gql } from '@apollo/client';
import {CustomerAddressBookAddressFragment} from "../../../override/Talons/AddressBookPage/addressBookFragments.gql";

export const ADDRESS_DEFAULT_QUERY = gql`
    query getAddressDefault {
        addressDefault {
            city_code
            city_name
            ward_code
            ward_name
            address
        }
    }
`

export const GET_CUSTOMER_ADDRESSES = gql`
    query GetCustomerAddressesForAddressBook (
        $currentPage: Int!
        $pageSize: Int!
    ) {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        customer {
            addressesV2 (
                currentPage: $currentPage
                pageSize: $pageSize
            ) {
                addresses {
                    id
                    ...CustomerAddressBookAddressFragment
                }
            }
        }
    }
    ${CustomerAddressBookAddressFragment}
`;
