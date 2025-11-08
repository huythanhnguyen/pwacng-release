import { useQuery, useLazyQuery } from '@apollo/client';
import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import { ADDRESS_DEFAULT_QUERY, GET_CUSTOMER_ADDRESSES } from '@magenest/theme/Talons/StoreSwitcher/deliveryAddressDefault.gql';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useHistory, useLocation} from "react-router-dom";
import {
    GET_STORE_INFORMATION_QUERY,
    GET_STORE_VIEW_QUERY,
    GET_WARD_AND_CITY
} from "@magenest/theme/Talons/StoreLocation/storeLocation.gql";
const DRAWER_NAME = 'storeSwitcher';

const storage = new BrowserPersistence();

const mapAvailableOptions = (config, stores) => {
    const { store_code: configCode } = config;

    return stores.reduce((map, store) => {
        const {
            default_display_currency_code: currency,
            locale,
            secure_base_media_url,
            store_code: storeCode,
            store_group_code: storeGroupCode,
            store_group_name: storeGroupName,
            store_name: storeName,
            store_sort_order: sortOrder
        } = store;

        const isCurrent = storeCode === configCode;
        const option = {
            currency,
            isCurrent,
            locale,
            secure_base_media_url,
            sortOrder,
            storeCode,
            storeGroupCode,
            storeGroupName,
            storeName
        };

        return map.set(storeCode, option);
    }, new Map());
};

/**
 * The useStoreSwitcher talon complements the StoreSwitcher component.
 *
 * @param {Array<Object>} [props.availableRoutes] - Hardcoded app routes.
 * @param {Object} [props.operations] - GraphQL operations to be run by the hook.
 *
 * @returns {Map}    talonProps.availableStores - Details about the available store views.
 * @returns {String}    talonProps.currentStoreName - Name of the current store view.
 * @returns {Boolean}   talonProps.storeMenuIsOpen - Whether the menu that this trigger toggles is open or not.
 * @returns {Ref}       talonProps.storeMenuRef - A React ref to the menu that this trigger toggles.
 * @returns {Ref}       talonProps.storeMenuTriggerRef - A React ref to the trigger element itself.
 * @returns {Function}  talonProps.handleTriggerClick - A function for handling when the trigger is clicked.
 * @returns {Function}  talonProps.handleSwitchStore - A function for handling when the menu item is clicked.
 */

export const useStoreSwitcher = (props = {}) => {
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;
    const [{ isSignedIn }] = useUserContext();
    const { data, loading, error } = useQuery(ADDRESS_DEFAULT_QUERY, {
        fetchPolicy: 'cache-and-network'
    });
    const isAddressChanged = storage.getItem('isAddressChanged');
    const [ customerAddress, setCustomerAddress ] = useState(storage.getItem('customer_address')?.address_details || '');
    const storeViewCode = storage.getItem('store_view_code');
    const isShowStore = storage.getItem('is_show_store');
    const location = useLocation();
    const history = useHistory();

    // Clear the value of checkout address form (guest) when exiting the checkout page
    sessionStorage.removeItem('checkout_address')

    const { data: wardAndCityData } = useQuery(GET_WARD_AND_CITY, {
        variables: {
            ward: storage.getItem('customer_address')?.ward_code || '',
            city: storage.getItem('customer_address')?.city_code || ''
        },
        fetchPolicy: 'cache-and-network',
        skip: !storage.getItem('customer_address')
    });

    const [ fetchStoreView ] = useLazyQuery(GET_STORE_VIEW_QUERY);
    const [ fetchStoreInformation ] = useLazyQuery(GET_STORE_INFORMATION_QUERY);

    useEffect(() => {
        if (!storeViewCode) {
            storage.setItem('store_view_code', process.env.STORE_VIEW_CODE ? process.env.STORE_VIEW_CODE : '');
        }
    }, [storeViewCode]);

    useEffect(() => {
        const addressStorage = storage.getItem('customer_address');
        if (wardAndCityData?.getWardAndCity && addressStorage) {
            const addressDetail = `${addressStorage.address}, ${wardAndCityData.getWardAndCity.ward_name}, ${wardAndCityData.getWardAndCity.city_name}`;
            setCustomerAddress(addressDetail || '')
            addressStorage.address_details = addressDetail;
            storage.setItem('customer_address', addressStorage);
        }
    }, [wardAndCityData])

    const {
        data: customerAddressDefaultData,
        loading: customerAddressDefaultLoading,
        error: customerAddressDefaultError,
    } = useQuery(GET_CUSTOMER_ADDRESSES, {
        variables: {
            currentPage: 1,
            pageSize: 1
        },
        fetchPolicy: 'network-only', // Use network-only to fetch fresh data
        skip: !isSignedIn
    });

    useEffect(() => {
        const processDefaultAddress = async () => {
            if (!isAddressChanged && !customerAddressDefaultLoading) {
                if (isSignedIn && customerAddressDefaultData?.customer?.addressesV2?.addresses[0]?.default_shipping) {
                    const customerAddressDefault = customerAddressDefaultData?.customer?.addressesV2?.addresses[0]?.default_shipping ? customerAddressDefaultData.customer.addressesV2.addresses[0] : null;
                    const ward = customerAddressDefault?.custom_attributes?.find(item => item.attribute_code === 'ward')?.value || '';
                    const street = customerAddressDefault?.street?.join(', ');
                    const city = customerAddressDefault?.city;
                    const ward_code = customerAddressDefault?.custom_attributes?.find(item => item.attribute_code === 'ward_code')?.value || '';
                    const city_code = customerAddressDefault?.custom_attributes?.find(item => item.attribute_code === 'city_code')?.value || '';
                    const addressDefaultLogged = customerAddressDefault?.is_new_administrative ? `${street ? `${street}` : ''}${ward ? `, ${ward}` : ''}${city ? `, ${city}` : ''}` : '';

                    storage.setItem('customer_address', addressDefaultLogged ? {
                        city_code: city_code,
                        ward_code: ward_code,
                        address: customerAddressDefault?.street.join(', '),
                        address_details: addressDefaultLogged
                    } : '');

                    setCustomerAddress(addressDefaultLogged ? addressDefaultLogged : '');

                    /* const result = await fetchStoreView({
                        variables: {
                            address: addressDefaultLogged,
                            city: city_code,
                            ward: ward_code,
                            street: street,
                            language: storage.getItem('language')?.code || 'vi',
                            website: 'b2c'
                        }
                    });

                    if (result?.data?.storeView?.store_view_code) {
                        const sortedStores = result && [...result.data.storeView.store_view_code].sort((a, b) => Number(a.distance) - Number(b.distance));

                        if (storage.getItem('store_view_code') !== sortedStores[0].store_view_code) {
                            const resultStoreInformation =  await fetchStoreInformation({
                                variables: {
                                    storeViewCode: sortedStores[0].store_view_code
                                }
                            });

                            if (resultStoreInformation.data.storeInformation) {
                                storage.setItem('store_view_code', sortedStores[0].store_view_code);
                                storage.setItem('store', resultStoreInformation.data);
                                history.go(0);
                            }
                        }
                    }*/
                } else {
                    const customerAddressUpdate = data?.addressDefault
                        ? `${data.addressDefault.address ? data.addressDefault.address : ''}${data.addressDefault.ward_name ? `, ${data.addressDefault.ward_name}` : ''}${data.addressDefault.city_name ? `, ${data.addressDefault.city_name}` : ''}`
                        : '';

                    storage.setItem('customer_address', (data?.addressDefault && !!customerAddressUpdate) ? {
                        ...data?.addressDefault,
                        address_details: customerAddressUpdate
                    } : '');
                    setCustomerAddress(customerAddressUpdate || '');

                    if (storage.getItem('store_view_code').slice(0, -2) !== process.env.STORE_VIEW_CODE.slice(0, -2)) {
                        storage.setItem('store_view_code', `${process.env.STORE_VIEW_CODE.slice(0, -2)}${storage.getItem('language')?.code || 'vi'}`);
                        storage.setItem('store', '');
                        history.go(0);
                    }
                }
            }
        }

        processDefaultAddress();
    }, [customerAddressDefaultData, customerAddressDefaultLoading, isAddressChanged, data, history]);

    useEffect(() => {
        const onLoad = () => {
            if (
                !isShowStore &&
                (typeof isSignedIn !== 'undefined') &&
                location.pathname !== '/mcard' &&
                !location.pathname.includes('/mcard/')
            ) {
                const openDrawer = () => {
                    toggleDrawer(DRAWER_NAME);
                    storage.setItem('is_show_store', true);
                };

                if (isSignedIn && (typeof customerAddressDefaultData !== 'undefined')) {
                    if (customerAddressDefaultData?.customer?.addressesV2?.addresses[0]?.default_shipping) {
                        storage.setItem('is_show_store', true);
                    } else {
                        setTimeout(openDrawer, 2000);
                    }
                } else if (!isSignedIn) {
                    setTimeout(openDrawer, 2000);
                }
            }
        };

        if (document.readyState === 'complete') {
            onLoad();
        } else {
            window.addEventListener('load', onLoad);
        }

        return () => {
            window.removeEventListener('load', onLoad);
        };
    }, [isShowStore, isSignedIn, customerAddressDefaultData, location]);

    const handleTriggerClick = useCallback(() => {
        toggleDrawer(DRAWER_NAME);
    }, [toggleDrawer]);

    const handleClose = useCallback(() => {
        closeDrawer(DRAWER_NAME);
    }, [closeDrawer])

    return {
        customerAddress,
        handleTriggerClick,
        isOpen,
        handleClose
    };
};
