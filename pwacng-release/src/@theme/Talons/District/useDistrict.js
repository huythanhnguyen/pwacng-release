import {useQuery} from "@apollo/client";
import {GET_DISTRICTS_QUERY} from "./district.gql";
import {useIntl} from "react-intl";
import {useCallback} from "react";

const UseDistrict = props => {
    const {
        address,
        setAddress,
        setAddressLabel,
        addressLabel
    } = props;

    const { data, error, loading } = useQuery(GET_DISTRICTS_QUERY, {
        variables: {
            cityCode: address.city
        },
        skip: !address.city
    });

    const { formatMessage } = useIntl();

    let formattedDistrictsData = [{ label: formatMessage({
            id: 'global.district',
            defaultMessage: 'District'
        }), value: '' }];

    if (!loading && !error && data) {
        const { districts } = data;

        const updatedDistricts = [
            {
                id: '',
                name: formatMessage({
                    id: 'global.district',
                    defaultMessage: 'District'
                }),
                district_code: ''
            },
            ...districts
        ]

        formattedDistrictsData = updatedDistricts && updatedDistricts.map(district => ({
            // If a country is missing the full english name just show the abbreviation.
            label: district.name,
            value: district.district_code
        }));
    }

    const handleChange = useCallback((district) => {
        setAddress({
            ...address,
            district: district.target.value,
            ward: ''
        });

        if (addressLabel) {
            setAddressLabel({
                ...addressLabel,
                district: district.target.selectedOptions[0].text,
                ward: ''
            })
        }
    }, [address]);

    return {
        loading,
        districts: formattedDistrictsData,
        handleChange
    }
}

export default UseDistrict
