import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {useMutation} from "@apollo/client";
import { SET_CUSTOMER_ADDRESS_ON_CART } from '@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/shippingInformation.gql';
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import { useToasts } from '@magento/peregrine';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useAddressCard = props => {
    const { address, onEdit, onSelection } = props;
    const addressId = address ? address.id : null;

    const [hasUpdate, setHasUpdate] = useState(false);
    const hasRendered = useRef(false);
    const [{ cartId }] = useCartContext();
    const [, { addToast }] = useToasts();

    const [
        setCustomerAddressOnCart,
        {
            error: setCustomerAddressOnCartError,
            loading: setCustomerAddressOnCartLoading
        }
    ] = useMutation(SET_CUSTOMER_ADDRESS_ON_CART);

    useEffect(() => {
        let updateTimer;
        if (address !== undefined) {
            if (hasRendered.current) {
                setHasUpdate(true);
                updateTimer = setTimeout(() => {
                    setHasUpdate(false);
                }, 2000);
            } else {
                hasRendered.current = true;
            }
        }

        return () => {
            if (updateTimer) {
                clearTimeout(updateTimer);
            }
        };
    }, [hasRendered, address]);

    const addressForEdit = useMemo(() => {
        if (!address) {
            return null;
        }

        const { country_code: countryCode, ...addressRest } = address;

        return {
            ...addressRest,
            country: {
                code: countryCode
            }
        };
    }, [address]);

    const handleClick = useCallback(async () => {
        try {
            onSelection(address);

            await setCustomerAddressOnCart({
                variables: {
                    cartId,
                    addressId: addressId
                }
            });
        } catch (e) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: e.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [address, onSelection]);

    const handleKeyPress = useCallback(async (event) => {
        if (event.key === 'Enter') {
            try {
                onSelection(addressId);

                await setCustomerAddressOnCart({
                    variables: {
                        cartId,
                        addressId: addressId
                    }
                });
            } catch (e) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: e.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        }
    }, [addressId, onSelection])

    const handleEditAddress = useCallback(() => {
        onEdit(addressForEdit);
    }, [addressForEdit, onEdit]);

    return {
        handleClick,
        handleEditAddress,
        handleKeyPress,
        hasUpdate
    };
};
