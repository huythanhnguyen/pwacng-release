import { useQuery } from '@apollo/client';
import { GET_CITIES_BY_SOURCE_TYPE_QUERY } from './city.gql'
import {useIntl} from "react-intl";
import {useCallback} from "react";

const UseCity = props => {
    const {
        address,
        setAddress,
        setAddressLabel,
        addressLabel,
        setWardKey
    } = props;

    const { data, error, loading } = useQuery(GET_CITIES_BY_SOURCE_TYPE_QUERY, {
        variables: {
            sourceType: Number(address.sourceType)
        },

        skip: !address.sourceType
    });

    const { formatMessage } = useIntl();

    let formattedCountriesData = [{ label: formatMessage({
            id: 'global.city',
            defaultMessage: 'City'
    }), value: '' }];

    if (data && !loading && !error) {
        const cities = data.listCityBySourceType;
        const updatedCities = [
            {
                province_code: '',
                name: formatMessage({
                    id: 'global.city',
                    defaultMessage: 'City'
                })
            },
            ...cities
        ]
        formattedCountriesData = updatedCities && updatedCities.map(city => ({
            // If a country is missing the full english name just show the abbreviation.
            label: city.name,
            value: city.province_code
        }));
    }

    const handleChange = useCallback((city) => {
        setAddress({
            ...address,
            city: city.value,
            ward: ''
        });

        if (addressLabel) {
            setAddressLabel({
                ...addressLabel,
                city: city.label,
                ward: ''
            })
        }

        setWardKey(prev => prev + 1)
    }, [address, setWardKey]);

    return {
        loading,
        cities: formattedCountriesData,
        handleChange
    }
}

export default UseCity
