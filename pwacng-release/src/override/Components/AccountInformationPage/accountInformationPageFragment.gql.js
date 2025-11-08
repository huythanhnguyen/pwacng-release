import { gql } from '@apollo/client';

export const AccountInformationPageFragment = gql`
    fragment AccountInformationPageFragment on Customer {
        id
        firstname
        email
        customer_no
        vat_address {
            customer_vat_id
            company_name
            company_vat_number
            company_address
        }
        custom_attributes(attributeCodes: ["company_user_phone_number"]) {
            code
            ... on AttributeValue {
                value
            }
        }
    }
`;
