import { gql } from '@apollo/client';

export const GET_CONTACT_FIELDS = gql`
    query GetContactForm {
        contactForm {
            name
            required
            label
            options {
                value
                label
            }
        }
    }
`;

export const SUBMIT_CONTACT_FORM = gql`
mutation contactSubmit ($input: [ContactFieldInput]) {
    contactSubmit(input: $input){
        success
        message
    }
}
`;

export default {
    getContactFormQuery: GET_CONTACT_FIELDS,
    submitContactFormMutation: SUBMIT_CONTACT_FORM
};
