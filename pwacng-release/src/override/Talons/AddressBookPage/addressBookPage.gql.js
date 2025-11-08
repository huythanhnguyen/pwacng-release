import { gql } from '@apollo/client';

import { CustomerAddressBookAddressFragment } from './addressBookFragments.gql';

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
                total_count
                total_pages
                addresses {
                    id
                    ...CustomerAddressBookAddressFragment
                }
            }
        }
        countries {
            id
            full_name_locale
        }
    }
    ${CustomerAddressBookAddressFragment}
`;

export const ADD_NEW_CUSTOMER_ADDRESS = gql`
    mutation AddNewCustomerAddressToAddressBook(
        $address: CustomerAddressInput!
    ) {
        createCustomerAddress(input: $address) {
            # We don't manually write to the cache to update the collection
            # after adding a new address so there's no need to query for a bunch
            # of address fields here. We use refetchQueries to refresh the list.
            id
        }
    }
`;

export const UPDATE_CUSTOMER_ADDRESS = gql`
    mutation UpdateCustomerAddressInAddressBook(
        $addressId: Int!
        $updated_address: CustomerAddressInput!
    ) {
        updateCustomerAddress(id: $addressId, input: $updated_address) {
            id
            ...CustomerAddressBookAddressFragment
        }
    }
    ${CustomerAddressBookAddressFragment}
`;

export const DELETE_CUSTOMER_ADDRESS = gql`
    mutation DeleteCustomerAddressFromAddressBook($addressId: Int!) {
        deleteCustomerAddress(id: $addressId)
    }
`;

export default {
    createCustomerAddressMutation: ADD_NEW_CUSTOMER_ADDRESS,
    deleteCustomerAddressMutation: DELETE_CUSTOMER_ADDRESS,
    getCustomerAddressesForAddressBookQuery: GET_CUSTOMER_ADDRESSES,
    updateCustomerAddressMutation: UPDATE_CUSTOMER_ADDRESS
};
