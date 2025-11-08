import { gql } from '@apollo/client';

export const GET_CITIES_QUERY = gql`
    query GetCities($countryId: String!) {
        cities(country_id: $countryId, is_new_administrative: 1) {
            id
            name
            city_code
        }
    }
`;
