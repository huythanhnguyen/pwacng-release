import {useQuery} from "@apollo/client";
import {GET_WARDS_QUERY} from "./ward.gql";
import {useIntl} from "react-intl";
import {useCallback} from "react";

const UseWard = props => {
    const {
        address,
        setAddress,
        setAddressLabel,
        addressLabel
    } = props;

    const { data, error, loading } = useQuery(GET_WARDS_QUERY, {
        variables: {
            cityCode: address.city
        },
        skip: !address.city
    });

    const { formatMessage } = useIntl();

    let formattedWardsData = [{ label: formatMessage({
            id: 'global.ward',
            defaultMessage: 'Ward'
        }), value: '' }];

    if (!loading && !error && data) {
        const { wards } = data;

        const updatedWards = [
            {
                id: '',
                name: formatMessage({
                    id: 'global.ward',
                    defaultMessage: 'Ward'
                }),
                ward_code: ''
            },
            ...wards
        ]

        formattedWardsData = updatedWards && updatedWards.map(ward => ({
            // If a country is missing the full english name just show the abbreviation.
            label: ward.name,
            value: ward.ward_code
        }));
    }

    const handleChange = useCallback((ward) => {
        setAddress({
            ...address,
            ward: ward.value
        });

        if (addressLabel) {
            setAddressLabel({
                ...addressLabel,
                ward: ward.label
            })
        }
    }, [address]);

    return {
        loading,
        wards: formattedWardsData,
        handleChange
    }
}

export default UseWard
