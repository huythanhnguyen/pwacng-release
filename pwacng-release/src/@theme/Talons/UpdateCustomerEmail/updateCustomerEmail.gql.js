import { gql } from '@apollo/client';

export const CREATE_CUSTOMER_FORM_MCART_MUTATION = gql`
    mutation createCustomerFromMcard (
        $input: CustomerCreateInput!
    ) {
        createCustomerFromMcard(input: $input) {
            customer_token
            customer {
                email
                firstname
            }
        }
    }
`

export default {
    createCustomerFromMCard: CREATE_CUSTOMER_FORM_MCART_MUTATION
}
