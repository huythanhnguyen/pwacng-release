import React, {useCallback, useEffect, useState} from "react";
import BrowserPersistence from '@magento/peregrine/lib/util/simplePersistence';
const DRAWER_NAME = 'storeLocation';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import {useLazyQuery} from "@apollo/client";
import {GET_LOCATION_USER_QUERY, GET_STORE_INFORMATION_QUERY, GET_STORE_VIEW_QUERY} from "./storeLocation.gql";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useIntl} from "react-intl";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const UseStoreLocation = props => {
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const storage = new BrowserPersistence();
    const [ storeLocationLabel, setStoreLocationLabel ] = useState({
        address: '',
        city: '',
        ward: ''
    });
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    const [ fetchStoreView, { data: storeViewData, loading: storeViewLoading, error: storeViewError } ] = useLazyQuery(GET_STORE_VIEW_QUERY);

    const [fetchStoreInformation,
        {
            data: storeInformation,
            loading: storeInformationLoading,
            error: storeInformationError
        }] = useLazyQuery(GET_STORE_INFORMATION_QUERY);

    const handleOpen = useCallback(() => {
        toggleDrawer(DRAWER_NAME);
    }, [toggleDrawer]);

    const handleClose = useCallback(() => {
        sessionStorage.removeItem('customerAddressData');
        closeDrawer('storeLocation');
    }, [closeDrawer]);

    const store = storage.getItem('store');

    useEffect(async () => {
        if (!store) {
            const result = await fetchStoreInformation({
                variables: {
                    storeViewCode: storage.getItem('store_view_code') ? storage.getItem('store_view_code') : process.env.STORE_VIEW_CODE
                }
            });

            if (result) {
                storage.setItem('store', result.data)
            }
        }
    }, []);

    const handleSubmitLocation = useCallback(async (values) => {
        if (values && storeLocationLabel) {
            const customerAddress = `${values.address ? `${values.address}` : ''} ${storeLocationLabel.ward ? `, ${storeLocationLabel.ward}` : ''} ${storeLocationLabel.city ? `, ${storeLocationLabel.city}`: ''}`;

            const result = await fetchStoreView({
                variables: {
                    ...values,
                    street: values.address,
                    language: storage.getItem('language').code,
                    website: 'b2c'
                }
            });

            if (result?.data?.storeView?.store_view_code) {
                storage.setItem('isAddressChanged', true)

                const sortedStores = result && [...result.data.storeView.store_view_code].sort((a, b) => Number(a.distance) - Number(b.distance));

                const resultStoreInformation =  await fetchStoreInformation({
                    variables: {
                        storeViewCode: sortedStores[0].store_view_code
                    }
                });

                if (resultStoreInformation.data.storeInformation && result.data.storeView.store_view_code !== storage.getItem('store_view_code')) {
                    sessionStorage.setItem('customerAddressData', JSON.stringify({
                        address: values.address,
                        city_code: values.city,
                        ward_code: values.ward,
                        address_details: customerAddress
                    }));
                    toggleDrawer('storeInformation');
                } else {
                    storage.setItem('customer_address', {
                        address: values.address,
                        city_code: values.city,
                        ward_code: values.ward,
                        address_details: customerAddress
                    });
                    closeDrawer('storeLocation');
                }
            } else {
                if (result?.data?.storeView?.message) {
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: result.data.storeView.message,
                        dismissable: true,
                        timeout: 7000
                    });
                } else {
                    storage.setItem('customer_address', {
                        address: values.address,
                        city_code: values.city,
                        ward_code: values.ward,
                        address_details: customerAddress
                    });
                }
            }
        }
    }, [toggleDrawer, handleClose, storeLocationLabel]);

    return {
        handleOpen,
        handleClose,
        fetchStoreView,
        handleSubmitLocation,
        storeInformation,
        storeViewData,
        storeLocationLabel,
        setStoreLocationLabel,
        isLoading: storeViewLoading || storeInformationLoading
    }
}

export default UseStoreLocation
