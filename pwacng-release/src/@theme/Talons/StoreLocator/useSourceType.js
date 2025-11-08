import { useQuery } from '@apollo/client';
import { GET_SOURCE_TYPE_QUERY } from './sourceType.gql'
import {useIntl} from "react-intl";
import {useCallback} from "react";

const UseSourceType = props => {
    const {
        setAddress,
        setAddressLabel,
        setCityKey,
        setWardKey
    } = props;

    const { data, error, loading } = useQuery(GET_SOURCE_TYPE_QUERY, {});

    const { formatMessage } = useIntl();

    let formattedCountriesData = [{ label: formatMessage({
            id: 'global.sourceType',
            defaultMessage: 'Region'
    }), value: '' }];

    if (data && !loading && !error) {
        const sourceTypeData = data.listSourceType;
        const updatedSourceTypeData = [
            {
                id: '',
                name: formatMessage({
                    id: 'global.sourceType',
                    defaultMessage: 'Region'
                })
            },
            ...sourceTypeData
        ]
        formattedCountriesData = updatedSourceTypeData && updatedSourceTypeData.map(sourceType => ({
            // If a country is missing the full english name just show the abbreviation.
            label: sourceType.name,
            value: sourceType.id
        }));
    }

    const handleChange = useCallback((sourceType) => {
        setAddress({
            sourceType: sourceType.target.value,
            city: '',
            ward: ''
        });

        if (setAddressLabel) {
            setAddressLabel({
                sourceType: sourceType.target.selectedOptions[0].text,
                city: '',
                ward: ''
            })
        }

        setWardKey(prev => prev + 1);
        setCityKey(prev => prev + 1)
    }, [setAddress, setCityKey, setWardKey]);

    return {
        loading,
        sourceTypeData: formattedCountriesData,
        handleChange
    }
}

export default UseSourceType
