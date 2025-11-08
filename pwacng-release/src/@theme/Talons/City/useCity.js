import { useQuery } from '@apollo/client';
import { GET_CITIES_QUERY } from './city.gql'
import {useIntl} from "react-intl";
import {useCallback} from "react";

const UseCity = props => {
    const {
        setAddress,
        setAddressLabel
    } = props;

    const { data, error, loading } = useQuery(GET_CITIES_QUERY, {
        variables: {
            countryId: "VN"
        }
    });

    const { formatMessage } = useIntl();

    let formattedCountriesData = [{ label: formatMessage({
            id: 'global.city',
            defaultMessage: 'City'
    }), value: '' }];

    if (!loading && !error) {
        const { cities } = data;
        const updatedCities = [
            {
                id: '',
                name: formatMessage({
                    id: 'global.city',
                    defaultMessage: 'City'
                }),
                city_code: ''
            },
            ...cities
        ]
        formattedCountriesData = updatedCities && updatedCities.map(city => ({
            // If a country is missing the full english name just show the abbreviation.
            label: city.name,
            value: city.city_code
        }));
    }

    const handleChange = useCallback((city) => {
        setAddress({
            city: city.value,
            ward: ''
        });

        if (setAddressLabel) {
            setAddressLabel({
                city: city.label,
                ward: ''
            })
        }
    }, [setAddress]);

    return {
        loading,
        cities: formattedCountriesData,
        handleChange
    }
}

export default UseCity
