import { gql } from '@apollo/client';

export const GET_DISTRICTS_QUERY = gql`
    query GetDistricts($cityCode: String!) {
        districts(city_code: $cityCode) {
            id
            name
            district_code
        }
    }
`;
