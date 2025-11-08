import { gql } from '@apollo/client';

const GET_USER_AGENT_QUERY = gql`
    query getUserAgent {
        getUserAgent
    }
`;

export default GET_USER_AGENT_QUERY;
