import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/AddressBook/addressBook.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useAddressBook = props => {
    const {
        setSelectedAddressId,
        shippingData,
        setSelectedAddress
    } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const {
        setCustomerAddressOnCartMutation,
        getCustomerAddressesQuery,
        getCustomerCartAddressQuery
    } = operations;
    const [ isFirstCallAddress, setIsFirstCallAddress ] = useState(true);

    const [, { toggleDrawer }] = useAppContext();
    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();
    const [, { addToast }] = useToasts();

    const addressCount = useRef();
    const [activeAddress, setActiveAddress] = useState();

    const [
        setCustomerAddressOnCart,
        {
            data: setCustomerAddressOnCartData,
            error: setCustomerAddressOnCartError,
            loading: setCustomerAddressOnCartLoading
        }
    ] = useMutation(setCustomerAddressOnCartMutation);

    const {
        data: customerAddressesData,
        loading: customerAddressesLoading
    } = useQuery(getCustomerAddressesQuery, {
        fetchPolicy: 'cache-and-network',
        skip: !isSignedIn
    });

    const {
        data: customerCartAddressData,
        loading: customerCartAddressLoading
    } = useQuery(getCustomerCartAddressQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const derivedErrorMessage = useMemo(
        () => deriveErrorMessage([setCustomerAddressOnCartError]),
        [setCustomerAddressOnCartError]
    );

    const isLoading =
        customerAddressesLoading ||
        customerCartAddressLoading;

    const customerAddresses = useMemo(
        () =>
            (customerAddressesData &&
                customerAddressesData.customer.addresses) ||
            [],
        [customerAddressesData]
    );

    useEffect(async () => {
        if (customerAddresses.length > 0 && customerAddresses.length !== addressCount.current) {
            // Auto-select newly added address when count changes
            if (addressCount.current) {
                const newestAddress =
                    customerAddresses[customerAddresses.length - 1];
                if (newestAddress.is_new_administrative) {
                    try {
                        await setCustomerAddressOnCart({
                            variables: {
                                cartId,
                                addressId: newestAddress.id
                            }
                        });

                        setSelectedAddress(newestAddress.id);
                        setSelectedAddressId({
                            street: newestAddress?.street?.join(', ') || '',
                            city: newestAddress?.custom_attributes?.find(item => item.attribute_code === 'city_code')?.value || '',
                            ward: newestAddress?.custom_attributes?.find(item => item.attribute_code === 'ward_code')?.value || '',
                            address_details: newestAddress?.custom_attributes ? `${newestAddress.street?.join(', ') || ''}, ${newestAddress.custom_attributes.find(item => item.attribute_code === 'ward')?.value || ''}, ${newestAddress.city}` : ''
                        });
                    } catch (error) {
                        setSelectedAddress(null);
                        setSelectedAddressId({
                            street: '',
                            city: '',
                            ward: '',
                            address_details: ''
                        });
                        addToast({
                            type: 'error',
                            icon: errorIcon,
                            message: error.message,
                            dismissable: true,
                            timeout: 7000
                        });
                    }
                }
            }

            addressCount.current = customerAddresses.length;
        } else if (!customerAddresses?.length) {
            setSelectedAddress(null);
            setSelectedAddressId({
                street: '',
                city: '',
                ward: '',
                address_details: ''
            });
        }
    }, [customerAddresses, cartId, setSelectedAddressId]);

    const handleEditAddress = useCallback(
        address => {
            setActiveAddress(address);
            toggleDrawer('shippingInformation.edit');
        },
        [toggleDrawer]
    );

    const handleAddAddress = useCallback(() => {
        handleEditAddress();
    }, [handleEditAddress]);

    const handleSelectAddress = useCallback(address => {
        setSelectedAddress(address.id);

        setSelectedAddressId({
            street: address?.street?.join(', ') || '',
            city: address?.custom_attributes?.find(item => item.attribute_code === 'city_code')?.value || '',
            ward: address?.custom_attributes?.find(item => item.attribute_code === 'ward_code')?.value || '',
            address_details: address?.custom_attributes ? `${address.street?.join(', ') || ''}, ${address.custom_attributes.find(item => item.attribute_code === 'ward')?.value || ''}, ${address.city}` : ''
        });
    }, [setSelectedAddressId]);

    useEffect(() => {
        const isShippingDataValid =
            !!shippingData &&
            !!shippingData.customer_address_id &&
            !!shippingData.city_code &&
            !!shippingData.ward_code &&
            Array.isArray(shippingData.street) &&
            shippingData.street.length > 0;

        if (!isShippingDataValid || !isFirstCallAddress || !cartId) return;

        const run = async () => {
            setIsFirstCallAddress(false);

            if (shippingData.is_new_administrative) {
                try {
                    await setCustomerAddressOnCart({
                        variables: {
                            cartId,
                            addressId: shippingData.customer_address_id
                        }
                    });

                    setSelectedAddress(shippingData.customer_address_id);
                    setSelectedAddressId({
                        street: shippingData?.street?.join(', ') || '',
                        city: shippingData?.city_code || '',
                        ward: shippingData?.ward_code || '',
                        address_details: shippingData ? `${shippingData.street?.join(', ') || ''}, ${shippingData.ward}, ${shippingData.city}` : ''
                    });
                } catch (error) {
                    // Log error for monitoring but don't expose details to console in production
                    if (process.env.NODE_ENV === 'development') {
                        console.error(error);
                    }
                    setSelectedAddress(null);
                    setSelectedAddressId({
                        street: '',
                        city: '',
                        ward: '',
                        address_details: ''
                    });
                }
            }
        };

        run();
    }, [shippingData, isFirstCallAddress, cartId]);

    return {
        activeAddress,
        customerAddresses,
        errorMessage: derivedErrorMessage,
        isLoading,
        handleAddAddress,
        handleSelectAddress,
        handleEditAddress
    };
};
