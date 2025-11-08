import { gql } from '@apollo/client';

export const GET_WARDS_QUERY = gql`
    query GetWards($cityCode: String!) {
        wards(city_code: $cityCode) {
            id
            name
            ward_code
        }
    }
`;
