import React, {useCallback, useState, useEffect, useRef, useMemo} from 'react';
import {useLazyQuery, useMutation} from '@apollo/client';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/AddressForm/guestForm.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useToasts} from "@magento/peregrine";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useGuestForm = props => {
    const {
        isReady,
        afterSubmit,
        shippingData,
        setDoneGuestSubmit,
        setSelectedAddressId,
        setLoading
    } = props;

    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const [ formKey, setFormKey ] = useState(0);
    const [ dataInit, setDataInit ] = useState(false);
    const storage = new BrowserPersistence();
    const customerAddress = sessionStorage.getItem('checkout_address') ? JSON.parse(sessionStorage.getItem('checkout_address')) : storage.getItem('customer_address');
    const [ addressUpdated, setAddressUpdated ] = useState(false);
    const [ checkoutCity, setCheckoutCity ] = useState(customerAddress?.city_code || '');
    const [ checkoutWard, setCheckoutWard ] = useState(customerAddress?.ward_code || '');
    const [ checkoutStreet, setCheckoutStreet ] = useState(customerAddress?.address || '');
    useEffect(() => {
        if (addressUpdated) {
            if (checkoutStreet && checkoutWard && checkoutCity) {
                // Save the form value to fill when F5
                sessionStorage.setItem('checkout_address', JSON.stringify({
                    address: checkoutStreet,
                    city_code: checkoutCity,
                    ward_code: checkoutWard
                }));
            } else {
                sessionStorage.removeItem('checkout_address');
            }
        }
    }, [addressUpdated, checkoutCity, checkoutWard, checkoutStreet]);

    const [, { addToast }] = useToasts();

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { setGuestShippingMutation, getEmailAvailableQuery } = operations;

    const [runQuery, { data }] = useLazyQuery(getEmailAvailableQuery, {
        fetchPolicy: 'cache-and-network'
    });

    const [{ cartId }] = useCartContext();

    const [setGuestShipping, { error, loading }] = useMutation(
        setGuestShippingMutation
    );

    const initialValues = useMemo(() => ({
        ...shippingData,
        street: [customerAddress?.address || ''],
        city_code: customerAddress?.city_code || '',
        ward_code: customerAddress?.ward_code || '',
        country: 'VN'
    }), [shippingData, customerAddress]);

    // Simple heuristic to indicate form was submitted prior to this render
    const isUpdate = !!shippingData?.city;

    const [, { dispatch }] = useEventingContext();
    const dispatchEvent = useCallback(() => {
        if (!isUpdate) {
            dispatch({
                type: 'CHECKOUT_SHIPPING_INFORMATION_ADDED',
                payload: {
                    cart_id: cartId
                }
            });
        }
    }, [isUpdate, cartId, dispatch]);

    const handleValidateEmail = useCallback(
        email => {
            if (email && email.includes('@')) {
                runQuery({ variables: { email } });
            }
        },
        [runQuery]
    );

    useEffect(() => {
        setLoading(loading)
    }, [loading]);

    const handleSubmit = useCallback(
        async formValues => {
            const { city, email, ward, firstname, telephone, street } = formValues;
            try {
                if (city && email && ward && firstname && telephone && street) {
                    const result = await setGuestShipping({
                        variables: {
                            cartId,
                            email,
                            address: {
                                firstname,
                                lastname: '',
                                city: city,
                                street: street.filter(e => e),
                                country_code: 'VN',
                                telephone: telephone,
                                city_code: city,
                                ward_code: ward
                            }
                        }
                    });

                    setDoneGuestSubmit(true);

                    const shippingAddress = result?.data?.setShippingAddressesOnCart?.cart?.shipping_addresses?.[0];
                    if (shippingAddress) {
                        setSelectedAddressId({
                            street: shippingAddress.street?.join(', ') || '',
                            city: shippingAddress.city_code || '',
                            ward: shippingAddress.ward_code || '',
                            address_details: `${shippingAddress.street?.join(', ') || ''}, ${shippingAddress.ward || ''}, ${shippingAddress.city || ''}`
                        });
                    }

                    setFormKey(prev => prev + 1)
                    dispatchEvent();
                } else {
                    setSelectedAddressId({
                        street: '',
                        city: '',
                        ward: '',
                        address_details: ''
                    })
                }
            } catch (error) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
            if (afterSubmit) {
                afterSubmit();
            }
        },
        [afterSubmit, cartId, setGuestShipping, dispatchEvent, setDoneGuestSubmit, formApiRef, setSelectedAddressId, formKey]
    );

    useEffect(() => {
        if (isReady && initialValues && !dataInit) {
            setFormKey(prev => prev + 1)
            setSelectedAddressId({
                street: initialValues.street?.join(', ') || '',
                city: initialValues.city_code ? initialValues.city_code : '',
                ward: initialValues.ward_code ? initialValues.ward_code : '',
                address_details: initialValues.street ? `${initialValues.street.join(', ')}, ${initialValues.ward}, ${initialValues.city}` : ''
            })
            setDataInit(true);
        }
    }, [isReady, initialValues, dataInit]);

    useEffect(() => {
        if (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [error])

    return {
        handleSubmit,
        initialValues,
        handleValidateEmail,
        setFormApi,
        formApiRef,
        formKey,
        setAddressUpdated,
        setCheckoutCity,
        setCheckoutWard,
        setCheckoutStreet
    };
};
