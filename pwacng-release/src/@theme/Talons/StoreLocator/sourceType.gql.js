import { gql } from '@apollo/client';

export const GET_SOURCE_TYPE_QUERY = gql`
    query GetSourceType {
        listSourceType {
            id
            name
        }
    }
`;
