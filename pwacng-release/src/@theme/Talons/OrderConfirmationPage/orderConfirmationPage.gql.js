import { gql } from '@apollo/client';

export const CANCEL_ORDER_MUTATION = gql`
    mutation cancelOrder (
        $input: CancelOrderInput!
    ) {
        cancelOrder (
            input: $input
        ) {
            error
            order {
                status
            }
        }
    }
`

export const REORDER_GUEST_MUTATION = gql`
    mutation reorderGuest (
        $input: ReOrderGuestInput!
    ) {
        reorderGuest (
            input: $input
        ) {
            cart {
                id
            }
        }
    }
`

export const PAYMENT_RESULT_QUERY = gql`
    query paymentResult ($input: PaymentResultInput) {
        paymentResult (
            input: $input
        ) {
            order_id
            status
        }
    }
`

export const GUEST_EMAIL_QUERY = gql`
    query guestEmailOrder ($order_number: String!) {
        guestEmailOrder (
            order_number: $order_number
        ) {
            email
        }
    }
`
