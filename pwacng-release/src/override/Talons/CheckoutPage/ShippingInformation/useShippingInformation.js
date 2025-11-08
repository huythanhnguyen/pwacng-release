import {useCallback, useEffect, useMemo, useState, useRef, useContext} from 'react';
import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/shippingInformation.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import VAT_OPERATIONS from '@magenest/theme/Talons/IncludeVat/includeVat.gql';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { MOCKED_ADDRESS } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/ShippingMethods/useShippingForm';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import { GET_CUSTOMER_INFORMATION } from '@magento/venia-ui/lib/components/AccountInformationPage/accountInformationPage.gql';
import {useLocation} from "react-router-dom";
import { availableRoutes } from '@magento/venia-ui/lib/components/Routes/routes';
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import { GET_ROUTE_DATA } from '@magento/peregrine/lib/talons/Header/storeSwitcher.gql';
import {GET_STORE_INFORMATION_QUERY} from "../../../../@theme/Talons/StoreLocation/storeLocation.gql";
import {CHECK_PRICE_CHANGE_QUERY} from "../../CartPage/cartPage.gql";
import {WRITE_LOG_CLIENT} from "../../App/log.gql";

export const useShippingInformation = props => {
    const {
        setCheckoutStep,
        CHECKOUT_STEP,
        storeViewData,
        handleCloseChangeStore
    } = props;

    const [writeLogClient] = useMutation(WRITE_LOG_CLIENT);
    const storage = new BrowserPersistence();
    const { pathname, search: searchParams } = useLocation();
    const [ isExportVat, setIsExportVat ] = useState(false);
    const operations = mergeOperations(DEFAULT_OPERATIONS, VAT_OPERATIONS, props.operations);
    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();
    const [ showModalPriceChange, setShowModalPriceChange ] = useState(false);

    const [hasUpdate, setHasUpdate] = useState(false);
    const hasLoadedData = useRef(false);

    const {
        getShippingInformationQuery,
        getVatInformation
    } = operations;

    const [fetchStoreInformation] = useLazyQuery(GET_STORE_INFORMATION_QUERY, {
        fetchPolicy: 'no-cache'
    });

    const {
        data: shippingInformationData,
        loading: getShippingInformationLoading
    } = useQuery(getShippingInformationQuery, {
        skip: !cartId,
        variables: {
            cartId
        },
        fetchPolicy: 'cache-and-network'
    });

    const { data: accountInformationData, error: loadDataError } = useQuery(
        GET_CUSTOMER_INFORMATION,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const { data: vatInformationData, loading: vatInformationLoading, error: vatInformationError } = useQuery(getVatInformation, {
        fetchPolicy: 'cache-and-network',
        skip: !isSignedIn
    });

    const { data: checkPriceChangeData, loading: checkPriceChangeLoading, error: checkPriceChangeError } = useQuery(CHECK_PRICE_CHANGE_QUERY, {
        variables: {
            cartId
        },
        skip: !cartId,
        fetchPolicy: 'no-cache'
    });

    const fetchRouteData = useAwaitQuery(GET_ROUTE_DATA);

    const internalRoutes = useMemo(() => {
        return availableRoutes.map(path => {
            if (path?.exact && path?.pattern) {
                return path.pattern;
            }
        });
    }, [availableRoutes]);

    const [ vatCompany, setVatCompany ] = useState({
        company_name : shippingInformationData?.cart?.vat_address?.company_name || '',
        company_vat_number: shippingInformationData?.cart?.vat_address?.company_vat_number || '',
        company_address: shippingInformationData?.cart?.vat_address?.company_address || ''
    });

    useEffect(() => {
        if (!!checkPriceChangeData?.CheckPriceChange?.is_price_change) {
            setShowModalPriceChange(true);
        } else {
            setShowModalPriceChange(false);
        }
    }, [checkPriceChangeData]);

    useEffect(() => {
        if (shippingInformationData?.cart?.vat_address) {
            setVatCompany({
                company_name : shippingInformationData?.cart?.vat_address?.company_name || '',
                company_vat_number: shippingInformationData?.cart?.vat_address?.company_vat_number || '',
                company_address: shippingInformationData?.cart?.vat_address?.company_address || ''
            })
        }
    }, [shippingInformationData]);

    const shippingData = useMemo(() => {
        if (!shippingInformationData?.cart?.shipping_addresses || shippingInformationData.cart.shipping_addresses.length === 0) return null;
        let filteredData;
        if (shippingInformationData) {
            try {
                const { cart } = shippingInformationData;
                const { email, shipping_addresses: shippingAddresses } = cart;
                if (shippingAddresses.length) {
                    const primaryAddress = { ...shippingAddresses[0] };
                    if (primaryAddress) {
                        for (const field in MOCKED_ADDRESS) {
                            if (primaryAddress[field] === MOCKED_ADDRESS[field]) {
                                primaryAddress[field] = '';
                            }

                            if (
                                field === 'street' &&
                                primaryAddress[field][0] === MOCKED_ADDRESS[field][0]
                            ) {
                                primaryAddress[field] = [''];
                            }
                        }

                        filteredData = {
                            email,
                            ...primaryAddress
                        };
                    }
                }
            } catch (e) {
                writeLogClient({
                    variables: {
                        message: `checkoutData error: shippingInformationData - ${shippingInformationData}`
                    }
                });
            }
        }

        return filteredData;
    }, [shippingInformationData]);

    const shippingDataReady = useMemo(() => {
        return (!!shippingInformationData?.cart?.shipping_addresses)
    }, [shippingInformationData]);

    // Simple heuristic to check shipping data existed prior to this render.
    // On first submission, when we have data, we should tell the checkout page
    // so that we set the next step correctly.

    const doneEditing = !!shippingData?.city_code;

    const [, { dispatch }] = useEventingContext();

    useEffect(() => {
        let updateTimer;
        if (shippingData !== undefined) {
            if (hasLoadedData.current) {
                setHasUpdate(true);
                updateTimer = setTimeout(() => {
                    setHasUpdate(false);
                }, 2000);
            } else {
                hasLoadedData.current = true;
            }
        }

        return () => {
            if (updateTimer) {
                clearTimeout(updateTimer);
            }
        };
    }, [hasLoadedData, shippingData]);

    const handleEditShipping = useCallback(() => {
        setCheckoutStep(CHECKOUT_STEP.SHIPPING_ADDRESS);
    }, [setCheckoutStep]);

    useEffect(() => {
        if (doneEditing && hasUpdate) {
            dispatch({
                type: 'CHECKOUT_SHIPPING_INFORMATION_UPDATED',
                payload: {
                    cart_id: cartId
                }
            });
        }
    }, [cartId, doneEditing, dispatch, hasUpdate]);

    const getPathname = useCallback(
        async storeCode => {
            if (pathname === '' || pathname === '/') return '';
            let newPath = '';
            if (internalRoutes?.includes(pathname)) {
                newPath = pathname;
            } else {
                const { data: routeData } = await fetchRouteData({
                    fetchPolicy: 'no-cache',
                    variables: {
                        url: pathname
                    },
                    context: { headers: { store: storeCode } }
                });
                if (routeData.route) {
                    newPath = routeData.route.relative_url;
                }
            }
            return newPath.startsWith('/') ? newPath.substr(1) : newPath;
        },
        [pathname, fetchRouteData, internalRoutes]
    );

    const handleSwitchStore = useCallback(async (storeCode) => {
        if (!storeCode) return;

        if (storeCode === storage.getItem('store_view_code')) {
            storage.setItem('customer_address', shippingData ? {
                city_code: shippingData.city_code || '',
                ward_code: shippingData.ward_code || '',
                address: shippingData.street?.join(', ') || '',
                address_details: `${shippingData.street?.join(', ') || ''}, ${shippingData.ward}, ${shippingData.city}`
            } : '');
            storage.setItem('isAddressChanged', true);

            window.location.reload();
            // handleCloseChangeStore();
        } else {
            const resultStoreInformation =  await fetchStoreInformation({
                variables: {
                    storeViewCode: storeCode
                }
            });

            storage.setItem('customer_address', shippingData ? {
                city_code: shippingData.city_code || '',
                ward_code: shippingData.ward_code || '',
                address: shippingData.street?.join(', ') || '',
                address_details: `${shippingData.street?.join(', ') || ''}, ${shippingData.ward}, ${shippingData.city}`
            } : '');
            storage.setItem('store_view_code', storeCode);
            storage.setItem('store', resultStoreInformation.data);
            storage.setItem('isAddressChanged', true);

            const pathName = await getPathname(storeCode);

            const newPath = pathName ? `/${pathName}${searchParams}` : '';

            if (process.env.USE_STORE_CODE_IN_URL === 'true') {
                globalThis.location.assign(`/${storeCode}${newPath || ''}`);
            } else {
                globalThis.location.assign(`${newPath || '/'}`);
            }
        }
    }, [shippingData])

    return {
        doneEditing,
        handleEditShipping,
        hasUpdate,
        isLoading: getShippingInformationLoading,
        isReady: shippingDataReady,
        isSignedIn,
        shippingData,
        vatInformation: vatInformationData?.vatInformation,
        isExportVat,
        setIsExportVat,
        vatCompany,
        setVatCompany,
        handleSwitchStore,
        customerData: accountInformationData?.customer || [],
        deliveryDateInformation: shippingInformationData?.cart?.delivery_date || {},
        showModalPriceChange,
        setShowModalPriceChange
    };
};
