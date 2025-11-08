import React, {useCallback, useMemo, useState} from 'react';
import { useMutation, useQuery } from '@apollo/client';
import DEFAULT_OPERATIONS from './customerForm.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {
    SET_CUSTOMER_ADDRESS_ON_CART
} from "@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/shippingInformation.gql";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useCustomerForm = props => {
    const { afterSubmit, onCancel, shippingData, setSelectedAddress, setSelectedAddressId } = props;

    const [ address, setAddress ] = useState({
        city: shippingData?.custom_attributes?.find(item => item.attribute_code === 'city_code')?.value || '',
        ward: shippingData?.custom_attributes?.find(item => item.attribute_code === 'ward_code')?.value || ''
    });
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        createCustomerAddressMutation,
        updateCustomerAddressMutation,
        getCustomerQuery,
        getCustomerAddressesQuery,
        getDefaultShippingQuery
    } = operations;
    const [{ cartId }] = useCartContext();
    const [, { addToast }] = useToasts();

    const [
        createCustomerAddress,
        {
            error: createCustomerAddressError,
            loading: createCustomerAddressLoading
        }
    ] = useMutation(createCustomerAddressMutation);

    const [
        updateCustomerAddress,
        {
            error: updateCustomerAddressError,
            loading: updateCustomerAddressLoading
        }
    ] = useMutation(updateCustomerAddressMutation);

    const [
        setCustomerAddressOnCart,
        {
            error: setCustomerAddressOnCartError,
            loading: setCustomerAddressOnCartLoading
        }
    ] = useMutation(SET_CUSTOMER_ADDRESS_ON_CART);

    const { data: customerData, loading: getCustomerLoading } = useQuery(
        getCustomerQuery
    );

    const isSaving =
        createCustomerAddressLoading || updateCustomerAddressLoading;

    // Simple heuristic to indicate form was submitted prior to this render
    const isUpdate = !!shippingData?.city;

    const { country } = shippingData;
    const { code: countryCode } = country;

    let initialValues = {
        ...shippingData,
        country: countryCode
    };

    const hasDefaultShipping =
        !!customerData && !!customerData.customer.default_shipping;

    // For first time creation pre-fill the form with Customer data
    if (!isUpdate && !getCustomerLoading && !hasDefaultShipping && customerData) {
        const { customer } = customerData;
        const { email, firstname, lastname } = customer;
        const defaultUserData = { email, firstname, lastname };
        initialValues = {
            ...initialValues,
            ...defaultUserData
        };
    }

    const [, { dispatch }] = useEventingContext();
    const dispatchEvent = useCallback(
        (action, address) => {
            if (action === 'ADD') {
                dispatch({
                    type: 'USER_ADDRESS_CREATE',
                    payload: {
                        address: address,
                        user: customerData
                    }
                });
            }

            if (action === 'EDIT') {
                dispatch({
                    type: 'USER_ADDRESS_EDIT',
                    payload: {
                        address: address,
                        user: customerData
                    }
                });
            }
            if (!hasDefaultShipping) {
                dispatch({
                    type: 'CHECKOUT_SHIPPING_INFORMATION_ADDED',
                    payload: {
                        cart_id: customerData.cart_id
                    }
                });
            }
        },
        [customerData, dispatch, hasDefaultShipping]
    );

    const handleSubmit = useCallback(
        async formValues => {
            try {
                const customerAddress = {
                    street: formValues.street.filter(e => e),
                    country_code: 'VN',
                    telephone: formValues.telephone,
                    city: formValues.city,
                    firstname: formValues.firstname,
                    lastname: '',
                    default_shipping: !!formValues.default_shipping,
                    custom_attributes: [
                        {
                            attribute_code: "city_code",
                            value: formValues.city
                        },
                        {
                            attribute_code: "ward_code",
                            value: formValues.ward
                        }
                    ]
                };

                if (isUpdate) {
                    const { id: addressId } = shippingData;
                    const result = await updateCustomerAddress({
                        variables: {
                            addressId,
                            address: customerAddress
                        },
                        refetchQueries: [{ query: getCustomerAddressesQuery }]
                    });

                    if (result?.data) {
                        dispatchEvent('EDIT', customerAddress);
                        await setCustomerAddressOnCart({
                            variables: {
                                cartId,
                                addressId: addressId
                            }
                        });

                        setSelectedAddress(addressId);
                        setSelectedAddressId({
                            street: customerAddress?.street?.join(', ') || '',
                            city: customerAddress?.custom_attributes?.find(item => item.attribute_code === 'city_code')?.value || '',
                            ward: customerAddress?.custom_attributes?.find(item => item.attribute_code === 'ward_code')?.value || '',
                            address_details: customerAddress?.street?.join(', ') || '' //@todo
                        });
                    }
                } else {
                    const result = await createCustomerAddress({
                        variables: {
                            address: customerAddress
                        },
                        refetchQueries: [
                            { query: getCustomerAddressesQuery },
                            { query: getDefaultShippingQuery }
                        ]
                    });
                    if (result?.data?.createCustomerAddress?.id) {
                        dispatchEvent('ADD', customerAddress);
                        await setCustomerAddressOnCart({
                            variables: {
                                cartId,
                                addressId: result.data.createCustomerAddress.id
                            }
                        });

                        const customerAddr = result.data.createCustomerAddress;
                        setSelectedAddress(customerAddr.id);
                        setSelectedAddressId({
                            street: customerAddr.street?.join(', ') || '',
                            city: customerAddr.custom_attributes?.find(item => item.attribute_code === 'city_code')?.value || '',
                            ward: customerAddr.custom_attributes?.find(item => item.attribute_code === 'ward_code')?.value || '',
                            address_details: `${customerAddr.street?.join(', ') || ''}, ${customerAddr.custom_attributes?.find(item => item.attribute_code === 'ward')?.value || ''}, ${customerAddr.city || ''}`
                        });
                    }
                }
            } catch (e) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: e.message,
                    dismissable: true,
                    timeout: 7000
                });
                return;
            }
            if (afterSubmit) {
                afterSubmit();
            }
        },
        [
            afterSubmit,
            createCustomerAddress,
            getCustomerAddressesQuery,
            getDefaultShippingQuery,
            isUpdate,
            shippingData,
            updateCustomerAddress,
            dispatchEvent,
            cartId,
            setSelectedAddressId
        ]
    );

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const errors = useMemo(
        () =>
            new Map([
                ['createCustomerAddressMutation', createCustomerAddressError],
                ['updateCustomerAddressMutation', updateCustomerAddressError]
            ]),
        [createCustomerAddressError, updateCustomerAddressError]
    );

    return {
        errors,
        handleCancel,
        handleSubmit,
        hasDefaultShipping,
        initialValues,
        isLoading: getCustomerLoading,
        isSaving,
        isUpdate,
        address,
        setAddress
    };
};
