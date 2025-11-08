import React, {useCallback, useEffect, useRef, useState} from "react";
import { SET_CUSTOMER_NO_ON_CART } from './useMCard.gql';
import {useMutation} from "@apollo/client";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const UseMCard = props => {
    const {
        customerNo
    } = props;

    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const [{ cartId }] = useCartContext();
    const [, { addToast }] = useToasts();
    const [setCustomerNoOnCart, {called, loading, error}] = useMutation(SET_CUSTOMER_NO_ON_CART);
    const storage = new BrowserPersistence();
    const customerNoStorage = storage.getItem('customer_no')

    useEffect(() => {
        if (customerNo && !customerNoStorage) {
            formApiRef.current.setValue('mCard_code', customerNo);
            storage.setItem('customer_no', customerNo)
        }
    }, [customerNo, customerNoStorage]);

    useEffect(() => {
        if (customerNo || customerNoStorage) {
            formApiRef.current.submitForm();
        }
    }, [customerNo]);

    const handleBlur = useCallback(value => {
        if (customerNoStorage !== value) {
            formApiRef.current.submitForm();
        }
    }, [formApiRef]);

    const handleSubmit = useCallback(async values => {
        try {
            await setCustomerNoOnCart({
                variables: {
                    input: {
                        cart_id: cartId,
                        customer_no: values.mCard_code ? values.mCard_code : ''
                    }
                },
                skip: !cartId
            });

            storage.setItem('customer_no', values.mCard_code ? values.mCard_code : '')
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [cartId, setCustomerNoOnCart])

    return {
        handleBlur,
        handleSubmit,
        setFormApi
    }
}

export default UseMCard
