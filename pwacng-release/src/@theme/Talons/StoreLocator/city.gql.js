import { gql } from '@apollo/client';

export const GET_CITIES_BY_SOURCE_TYPE_QUERY = gql`
    query GetCitiesBySourceType($sourceType: Int!) {
        listCityBySourceType(source_type: $sourceType) {
            province_code
            name
        }
    }
`;
