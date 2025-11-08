import { gql } from '@apollo/client';
export const WRITE_LOG_CLIENT = gql`
    mutation writeLogClient ($message: String) {
        writeLogClient (message: $message) {
            success
            message
        }
    }
`;

export default {
    writeLogClient: WRITE_LOG_CLIENT
}
