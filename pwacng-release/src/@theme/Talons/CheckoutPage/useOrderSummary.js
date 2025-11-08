import {useLazyQuery} from "@apollo/client";
import {GET_STORE_INFORMATION_QUERY, GET_STORE_VIEW_QUERY} from "../StoreLocation/storeLocation.gql";
import {useToasts} from "@magento/peregrine";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {FormContext} from "../../Context/Checkout/formContext";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {useShippingMethod} from "../../../override/Talons/CheckoutPage/ShippingMethod/useShippingMethod";
import {useUserContext} from "@magento/peregrine/lib/context/user";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const UseOrderSummary = props => {
    const {
        setCheckoutStep,
        selectedAddressId,
        checkoutStep,
        CHECKOUT_STEP,
        fetchStoreView,
        isContinue,
        setIsContinue,
        deliveryDate,
        setLoading,
        handleOpenChangeStore,
        loading,
        doneGuestSubmit,
        selectedAddress
    } = props

    const { handleSubmit } = useShippingMethod({
        setLoading
    });

    const { formatMessage } = useIntl();
    const { formShippingRef, formVatRef, formDeliveryRef, isNextStep, setIsNextStep } = useContext(FormContext);
    const storage = new BrowserPersistence();
    const storeViewCurrent = storage.getItem('store_view_code')?.slice(0, -3) || '';
    const [ isClicked, setIsClicked ] = useState(false);
    const [ callShippingMethod, setCallShippingMethod ] = useState(false);
    const [{ isSignedIn }] = useUserContext();

    const [, { addToast }] = useToasts();

    const handleTriggerSubmit = useCallback(async () => {
        if (formShippingRef.current) {
            await formShippingRef.current.click();
        }

        if (formVatRef.current) {
            await formVatRef.current.click();
        }

        if (formDeliveryRef.current) {
            await formDeliveryRef.current.click();
        }

        setCallShippingMethod(true);
    }, [
        formShippingRef,
        formVatRef,
        formDeliveryRef,
        setCallShippingMethod
    ]);

    useEffect(async () => {
        if (callShippingMethod && !loading) {
            setCallShippingMethod(false);

            const isValidDeliveryDate = deliveryDate.date && deliveryDate.time_interval_id;

            const showErrorToast = () => {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'global.messageDeliveryAddressEmpty',
                        defaultMessage: 'Please add delivery address'
                    }),
                    dismissable: true,
                    timeout: 5000
                });
            };

            const showDeliveryDateToast = () => {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'global.messageDeliveryDateEmpty',
                        defaultMessage: 'Please select delivery time'
                    }),
                    dismissable: true,
                    timeout: 5000
                });
            };

            if (isSignedIn) {
                if (selectedAddress) {
                    if (isValidDeliveryDate) {
                        await handleSubmit(deliveryDate, setIsClicked);
                    } else {
                        showDeliveryDateToast();
                    }
                } else {
                    showErrorToast();
                }
            } else {
                if (doneGuestSubmit) {
                    if (isValidDeliveryDate) {
                        await handleSubmit(deliveryDate, setIsClicked);
                    } else {
                        showDeliveryDateToast();
                    }
                } else {
                    showErrorToast();
                }
            }
        }
    }, [callShippingMethod, deliveryDate, selectedAddress, isSignedIn, doneGuestSubmit, loading]);

    useEffect(async () => {
        if (isClicked) {
            setIsClicked(false);

            if (selectedAddressId.city && selectedAddressId.ward) {
                const storeViewResult = await fetchStoreView({
                    variables: {
                        street: selectedAddressId.street,
                        city: selectedAddressId.city,
                        ward: selectedAddressId.ward,
                        language: storage.getItem('language').code,
                        website: 'b2c'
                    }
                });

                if (storeViewResult?.data?.storeView?.store_view_code) {
                    const sortedStores = storeViewResult && [...storeViewResult.data.storeView.store_view_code].sort((a, b) => Number(a.distance) - Number(b.distance));

                    if (sortedStores.some(s => s.store_view_code.slice(0, -3) === storeViewCurrent)) {
                        const addressStorage = storage.getItem('customer_address');
                        if (addressStorage && addressStorage.city_code === selectedAddressId.city && addressStorage.ward_code === selectedAddressId.ward) {
                            storage.setItem('customer_address', {
                                city_code: selectedAddressId.city || '',
                                ward_code: selectedAddressId.ward || '',
                                address: selectedAddressId.street || '',
                                address_details: selectedAddressId.address_details || ''
                            });
                            storage.setItem('isAddressChanged', true);
                            setIsContinue(true);
                        } else {
                            handleOpenChangeStore(true);
                        }
                    } else {
                        handleOpenChangeStore(true);
                    }
                } else {
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: formatMessage({
                            id: 'global.messageNoSupportDelivery',
                            defaultMessage: 'The Mega Market does not support delivery in this area'
                        }),
                        dismissable: true,
                        timeout: 7000
                    });
                }
            } else {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'global.messageContinueError',
                        defaultMessage: 'Please check your information again for payment'
                    }),
                    dismissable: true,
                    timeout: 7000
                });
            }
        }
    }, [
        selectedAddressId,
        storeViewCurrent,
        handleOpenChangeStore,
        fetchStoreView,
        isClicked
    ]);

    useEffect(() => {
        if (isContinue) {
            setIsContinue(false);

            if (isNextStep) {
                setCheckoutStep(CHECKOUT_STEP.PAYMENT);

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'global.messageContinueError',
                        defaultMessage: 'Please fill in all information to pay'
                    }),
                    dismissable: true,
                    timeout: 7000
                });
            }
        }
    }, [isNextStep, setCheckoutStep, isContinue]);

    useEffect(() => {
        if (checkoutStep === CHECKOUT_STEP.PAYMENT) {
            setIsContinue(false);
            setIsNextStep(false);
        }
    }, [checkoutStep])


    return {
        handleTriggerSubmit
    }
}

export default UseOrderSummary
