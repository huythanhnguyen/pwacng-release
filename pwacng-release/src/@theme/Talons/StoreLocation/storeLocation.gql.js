import { gql } from '@apollo/client';

export const GET_STORE_VIEW_QUERY = gql`
    query GetStoreView ($street: String!, $city: String!, $ward: String!, $language: String!, $website: String!) {
        storeView(street: $street, city: $city, ward: $ward, language: $language, website: $website) {
            store_view_code {
                distance
                distance_text
                priority
                store_view_code
                source_name
            }
            message
            allow_selection
        }
    }
`;

export const GET_STORE_INFORMATION_QUERY = gql`
    query GetStoreInformationQuery ($storeViewCode: String!) {
        storeInformation(store_view_code: $storeViewCode) {
            source_code
            name
            address,
        }
    }
`;

export const GET_LOCATION_USER_QUERY = gql`
    query GetLocationUserQuery ($lat: String!, $long: String!, $language: String!, $website: String!) {
        locationUser(lat: $lat, long: $long, language: $language, website: $website) {
            region_id
            city
            city_code
            ward
            ward_code
            address
            store_view_code
        }
    }
`;

export const GET_SUGGEST_LOCATION = gql`
    query suggestLocation ($address: String!) {
        suggestLocation (address: $address) {
            address
            city
            city_code
            ward
            ward_code
        }
    }
`;

export const GET_WARD_AND_CITY = gql`
    query getWardAndCity ($ward: String!, $city: String!) {
        getWardAndCity (ward_code: $ward, city_code: $city) {
            city_name
            ward_name
        }
    }
`;

export const REMOVE_ITEM_NOT_VISIBLE_FROM_CART = gql`
    query removeItemNotVisibleFromCart($cartId: String!) {
        removeItemNotVisibleFromCart (cart_id: $cartId) {
            is_removed
            messages
        }
    }
`;
