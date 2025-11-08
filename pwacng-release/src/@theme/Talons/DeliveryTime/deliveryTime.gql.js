import { gql } from '@apollo/client';

const GET_DELIVERY_DATE_CONFIGURATION = gql`
    query getDeliveryDateConfiguration {
        getDeliveryDateConfiguration {
            id
            enabled
            schedules {
                schedule_id
                value
                label
            }
        }
    }
`

const GET_DELIVERY_TIME_CONFIGURATION = gql`
    query getTimeInterval ($scheduleId: Int!, $date: String!) {
        getTimeInterval (schedule_id: $scheduleId, date: $date) {
            time_interval_id
            from
            to
            label
        }
    }
`

const GET_STORE_CONFIG_DELIVERY = gql`
    query getStoreConfigDelivery {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            commentMaxLength
        }
    }
`;

export default {
    getDeliveryDate: GET_DELIVERY_DATE_CONFIGURATION,
    getDeliveryTime: GET_DELIVERY_TIME_CONFIGURATION,
    getStoreConfigDelivery: GET_STORE_CONFIG_DELIVERY
}
