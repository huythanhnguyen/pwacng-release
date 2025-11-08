import { gql } from '@apollo/client';

export const SET_CUSTOMER_NO_ON_CART = gql`
    mutation setCustomerNoOnCart (
        $input: SetCustomerNoOnCartInput!
    ) {
        setCustomerNoOnCart (
            input: $input
        ) {
            cart {
                customer_no
            }
        }
    }
`
