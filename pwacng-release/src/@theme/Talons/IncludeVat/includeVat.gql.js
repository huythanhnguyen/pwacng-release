import { gql } from '@apollo/client';

const SET_VAT_INFORMATION_ON_CART = gql`
    mutation setVatInformationOnCart (
        $input: SetVatInformationOnCartInput!
    ) {
        setVatInformationOnCart (
            input: $input
        ) {
            cart {
                vat_address {
                    customer_vat_id
                    company_name
                    company_vat_number
                    company_address
                }
            }
        }
    }
`

const GET_VAT_INFORMATION = gql`
    query vatInformation {
        vatInformation {
            customer_vat_id
            company_name
            company_vat_number
            company_address
        }
    }
`

const SET_CALL_BEFORE_DELIVERY_ON_CART = gql`
    mutation setCallBeforeDeliveryOnCart (
        $input: SetCallBeforeDeliveryOnCartInput!
    ) {
        setCallBeforeDeliveryOnCart (
            input: $input
        ) {
            cart {
                is_call_before_delivery
            }
        }
    }
`

export default {
    setVatInformation: SET_VAT_INFORMATION_ON_CART,
    getVatInformation: GET_VAT_INFORMATION,
    setCallBeforeDelivery: SET_CALL_BEFORE_DELIVERY_ON_CART
}
