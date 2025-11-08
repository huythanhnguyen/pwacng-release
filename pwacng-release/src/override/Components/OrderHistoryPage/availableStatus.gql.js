import { gql } from '@apollo/client';

export const GET_AVAILABLE_STATUS = gql`
    query {
        availableStatus {
            status
            label
        }
    }
`;

export default {
    getAvailableStatusQuery: GET_AVAILABLE_STATUS
};
