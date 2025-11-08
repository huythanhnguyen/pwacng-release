import { gql } from '@apollo/client';

export const GET_STORE_LOCATOR = gql`
    query GetStoreLocators (
        $store_source_type: Int,
        $store_city: Int
        $store_ward: Int
    ) {
        StoreLocators(
            store_source_type: $store_source_type
            store_city: $store_city
            store_ward: $store_ward
        ) {
            name
            street
            latitude
            longitude
            source_image_featured
        }
    }
`;

export default {
    getStoreLocatorQuery: GET_STORE_LOCATOR
};
