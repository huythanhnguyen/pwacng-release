import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import DEFAULT_OPERATIONS from './shippingMethod.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {useToasts} from "@magento/peregrine";
import {
    GET_SHIPPING_INFORMATION
} from "@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/shippingInformation.gql";
import ReactGA from "react-ga4";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import CryptoJS from "crypto-js";

export const displayStates = {
    DONE: 'done',
    EDITING: 'editing',
    INITIALIZING: 'initializing'
};

const serializeShippingMethod = method => {
    const { carrier_code, method_code } = method;

    return `${carrier_code}|${method_code}`;
};

const deserializeShippingMethod = serializedValue => {
    return serializedValue.split('|');
};

// Sorts available shipping methods by price.
const byPrice = (a, b) => a.amount.value - b.amount.value;

// Adds a serialized property to shipping method objects
// so they can be selected in the radio group.
const addSerializedProperty = shippingMethod => {
    if (!shippingMethod) return shippingMethod;

    const serializedValue = serializeShippingMethod(shippingMethod);

    return {
        ...shippingMethod,
        serializedValue
    };
};

const DEFAULT_SELECTED_SHIPPING_METHOD = null;
const DEFAULT_AVAILABLE_SHIPPING_METHODS = [];

export const useShippingMethod = props => {
    const {
        setLoading
    } = props
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const [, { addToast }] = useToasts();
    const storage = new BrowserPersistence();
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';

    const {
        getSelectedAndAvailableShippingMethodsQuery,
        setShippingMethodMutation
    } = operations;

    const [{ cartId }] = useCartContext();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [, { dispatch }] = useEventingContext();

    /*
     *  Apollo Hooks.
     */
    const [
        setShippingMethodCall,
        { error: setShippingMethodError, loading: isSettingShippingMethod, called: setShippingMethodCalled }
    ] = useMutation(setShippingMethodMutation);

    const { data, loading: isLoadingShippingMethods } = useQuery(
        getSelectedAndAvailableShippingMethodsQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            skip: !cartId,
            variables: { cartId }
        }
    );

    const {
        data: shippingInformationData,
        loading: getShippingInformationLoading
    } = useQuery(GET_SHIPPING_INFORMATION);

    /*
     *  State / Derived state.
     */
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    const derivedPrimaryShippingAddress =
        data &&
        data.cart.shipping_addresses &&
        data.cart.shipping_addresses.length
            ? data.cart.shipping_addresses[0]
            : null;

    const checkoutItems = data?.cart?.items || []

    const derivedSelectedShippingMethod = useMemo(() => {
        return derivedPrimaryShippingAddress
            ? addSerializedProperty(
                derivedPrimaryShippingAddress.selected_shipping_method
            )
            : DEFAULT_SELECTED_SHIPPING_METHOD;
    }, [derivedPrimaryShippingAddress]);

    const derivedShippingMethods = useMemo(() => {
        if (!derivedPrimaryShippingAddress)
            return DEFAULT_AVAILABLE_SHIPPING_METHODS;

        // Shape the list of available shipping methods.
        // Sort them by price and add a serialized property to each.
        const rawShippingMethods =
            derivedPrimaryShippingAddress.available_shipping_methods;
        const shippingMethodsByPrice = [...rawShippingMethods].sort(byPrice);
        const result = shippingMethodsByPrice.map(addSerializedProperty);

        return result;
    }, [derivedPrimaryShippingAddress]);

    // Determine the component's display state.
    const isBackgroundAutoSelecting =
        isSignedIn &&
        !derivedSelectedShippingMethod &&
        Boolean(derivedShippingMethods.length);
    const displayState = derivedSelectedShippingMethod
        ? displayStates.DONE
        : isLoadingShippingMethods ||
        (isSettingShippingMethod && isBackgroundAutoSelecting)
            ? displayStates.INITIALIZING
            : displayStates.EDITING;

    useEffect(() => {
        setLoading(isSettingShippingMethod)
    }, [isSettingShippingMethod]);

    /*
     *  Callbacks.
     */
    const dispatchEvent = useCallback(
        shippingMethod => {
            dispatch({
                type: !isUpdateMode
                    ? 'CHECKOUT_SHIPPING_METHOD_ADDED'
                    : 'CHECKOUT_SHIPPING_METHOD_UPDATED',
                payload: {
                    cart_id: cartId,
                    selected_shipping_method: {
                        serializedValue: shippingMethod
                    }
                }
            });
        },
        [dispatch, cartId, isUpdateMode]
    );

    // useEffect(async () => {
    //     try {
    //         if (deliveryDate.date && deliveryDate.time_interval_id !== 0) {
    //             await setShippingMethodCall({
    //                 variables: {
    //                     cartId,
    //                     shippingMethod: {
    //                         carrier_code: derivedShippingMethods[0].carrier_code,
    //                         method_code: derivedShippingMethods[0].method_code
    //                     },
    //                     deliveryDate: {
    //                         date: deliveryDate.date,
    //                         time_interval_id: Number(deliveryDate.time_interval_id),
    //                         comment: deliveryDate.comment
    //                     }
    //                 }
    //             });
    //
    //             dispatchEvent(`${derivedShippingMethods[0].carrier_code}|${derivedShippingMethods[0].method_code}`);
    //         }
    //     } catch (error) {
    //         addToast({
    //             type: 'error',
    //             icon: errorIcon,
    //             message: error.message,
    //             dismissable: true,
    //             timeout: 7000
    //         });
    //     }
    // }, [cartId, deliveryDate, derivedShippingMethods]);

    const handleSubmit = useCallback(
        async (deliveryDate, setIsClicked) => {
            // if (!derivedShippingMethods && derivedShippingMethods.length === 0) return null;
            try {
                const result = await setShippingMethodCall({
                    variables: {
                        cartId,
                        shippingMethod: {
                            carrier_code: derivedShippingMethods[0].carrier_code,
                            method_code: derivedShippingMethods[0].method_code
                        },
                        deliveryDate: {
                            date: deliveryDate.date,
                            time_interval_id: Number(deliveryDate.time_interval_id),
                            comment: deliveryDate.comment
                        }
                    },
                    refetchQueries: [{ query: GET_SHIPPING_INFORMATION, variables: { cartId }, fetchPolicy: 'no-cache', skip: !cartId }],
                });

                if (result) {
                    setIsClicked(true);
                    dispatchEvent(`${derivedShippingMethods[0].carrier_code}|${derivedShippingMethods[0].method_code}`);

                    try {
                        ReactGA.event('add_shipping_info', {
                            category: 'Ecommerce',
                            label: 'Shipping Info Added',
                            value: result.data.setShippingMethodsOnCart.cart.shipping_addresses[0].selected_shipping_method.amount.value,
                            shipping_tier: result.data.setShippingMethodsOnCart.cart.shipping_addresses[0].selected_shipping_method.carrier_code,
                            store_id: storeCode,
                            store_name: storeName,
                            items: checkoutItems.map(item => ({
                                item_id: `${item.product.art_no}_${storeCode}`,
                                item_name: item.product.name,
                                price: item.product.price_range?.maximum_price?.final_price?.value || 0,
                                quantity: item.quantity
                            }))
                        });

                        if (data) {
                            if (isSignedIn && currentUser) {
                                const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                                window.web_event.track("product", "checkout_shipping", {
                                    items: checkoutItems.map(item => ({
                                        "type": "product", // Fixed Value
                                        "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                        "name": item.product.name,
                                        "sku": item.product.sku, // ArtNo + "_" + Barcode
                                        "price": item.product.price_range.maximum_price.final_price.value,
                                        "original_price": item.product.price_range.maximum_price.regular_price.value,
                                        "quantity": item.quantity
                                    })),
                                    dims: {
                                        customers: {
                                            "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                            "name": currentUser.firstname,
                                            "email": currentUser.email,
                                            "phone": customerPhoneNumber,
                                            "mcard_no": "" // optional
                                        }
                                    },
                                    extra: {
                                        "shipping_name": derivedPrimaryShippingAddress.firstname,
                                        "shipping_phone": derivedPrimaryShippingAddress.telephone,
                                        "shipping_email": data.cart.email,
                                        "shipping_city": derivedPrimaryShippingAddress.city,
                                        "shipping_province": derivedPrimaryShippingAddress.ward,
                                        "shipping_address": derivedPrimaryShippingAddress.street.join(', '),
                                        "shipping_note": deliveryDate.comment,
                                        "preferred_shipping_date": deliveryDate.date,
                                        "preferred_shipping_time": `${deliveryDate.from / 60}:00 - ${deliveryDate.to / 60}:00`,
                                        "shipping_amount": derivedPrimaryShippingAddress.available_shipping_methods[0].amount.value,
                                        "cart_subtotal": data.cart.prices.subtotal_excluding_tax.value,
                                        "cart_item_count": data.cart.total_quantity
                                    }
                                })
                            } else {
                                window.web_event.track("product", "checkout_shipping", {
                                    items: checkoutItems.map(item => ({
                                        "type": "product", // Fixed Value
                                        "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                        "name": item.product.name,
                                        "sku": item.product.sku, // ArtNo + "_" + Barcode
                                        "price": item.product.price_range.maximum_price.final_price.value,
                                        "original_price": item.product.price_range.maximum_price.regular_price.value,
                                        "quantity": item.quantity
                                    })),
                                    dims: {
                                        customers: {
                                            "customer_id": CryptoJS.MD5(result.data.setShippingMethodsOnCart.cart.shipping_addresses[0].telephone).toString(), // MD5(phone)
                                            "name": result.data.setShippingMethodsOnCart.cart.shipping_addresses[0].firstname,
                                            "email": result.data.setShippingMethodsOnCart.cart.email,
                                            "phone": result.data.setShippingMethodsOnCart.cart.shipping_addresses[0].telephone,
                                            "mcard_no": "" // optional
                                        }
                                    },
                                    extra: {
                                        "shipping_name": derivedPrimaryShippingAddress.firstname,
                                        "shipping_phone": derivedPrimaryShippingAddress.telephone,
                                        "shipping_email": data.cart.email,
                                        "shipping_city": derivedPrimaryShippingAddress.city,
                                        "shipping_province": derivedPrimaryShippingAddress.ward,
                                        "shipping_address": derivedPrimaryShippingAddress.street.join(', '),
                                        "shipping_note": deliveryDate.comment,
                                        "preferred_shipping_date": deliveryDate.date,
                                        "preferred_shipping_time": `${deliveryDate.from / 60}:00 - ${deliveryDate.to / 60}:00`,
                                        "shipping_amount": derivedPrimaryShippingAddress.available_shipping_methods[0].amount.value,
                                        "cart_subtotal": data.cart.prices.subtotal_excluding_tax.value,
                                        "cart_item_count": data.cart.total_quantity
                                    }
                                })
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
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
        },
        [cartId, derivedShippingMethods, storeCode, data, isSignedIn]
    );

    return {
        handleSubmit,
        setShippingMethodCalled
    };
};
