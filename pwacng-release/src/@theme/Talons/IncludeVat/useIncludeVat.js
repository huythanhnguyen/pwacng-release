import {useCallback, useContext, useEffect, useRef, useState} from "react";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from './includeVat.gql';
import {useMutation} from "@apollo/client";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {FormContext} from "../../Context/Checkout/formContext";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";

const UseIncludeVat = props => {
    const {
        vatInformation,
        isExportVat,
        deliveryDate,
        doneEditing,
        vatCompany,
        doneGuestSubmit,
        setIsExportVat
    } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const [{cartId}] = useCartContext();
    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const { setIsNextStep } = useContext(FormContext);
    const storage = new BrowserPersistence();
    const isCallBeforeDelivery = storage.getItem('is_call_before_delivery');
    const [ formKey, setFormKey ] = useState(0);

    const {
        setVatInformation,
        setCallBeforeDelivery
    } = operations;

    const [
        fetchSetVatInformation,
        {
            called,
            loading: setVatInformationLoading,
            error: setVatInformationError
        }] = useMutation(setVatInformation);

    const [
        fetchSetCallBeforeDelivery,
        {
            called: setCallBeforeDeliveryCalled,
            loading: setCallBeforeDeliveryLoading,
            error: setCallBeforeDeliveryError
        }] = useMutation(setCallBeforeDelivery);

    const handleSubmit = useCallback(async (values) => {
        try {
            const {
                company_name,
                company_vat_number,
                company_address
            } = values;

            if (isExportVat) {
                if (cartId && company_name && company_vat_number && company_address) {
                    await fetchSetVatInformation({
                        variables: {
                            input: {
                                cart_id: cartId,
                                vat_address: {
                                    customer_vat_id: vatInformation?.customer_vat_id ? vatInformation.customer_vat_id : null,
                                    company_name,
                                    company_vat_number,
                                    company_address
                                }
                            }
                        }
                    });
                } else {
                    setIsNextStep(false);
                }
            } else {
                await fetchSetVatInformation({
                    variables: {
                        input: {
                            cart_id: cartId,
                            vat_address: {
                                customer_vat_id: null,
                                company_name: '',
                                company_vat_number: '',
                                company_address: ''
                            }
                        }
                    }
                });

                formApiRef.current.reset();
            }

        } catch (error) {
            console.error(error)
        }
    }, [fetchSetVatInformation, vatInformation, setIsNextStep, isExportVat]);

    useEffect(() => {
        if (vatCompany.company_name || vatCompany.company_vat_number || vatCompany.company_address) {
            setIsExportVat(true);
            setFormKey(formKey + 1);
        }
    }, [vatCompany]);

    useEffect(() => {
        if(isExportVat) {
            if (
                called &&
                vatCompany.company_name &&
                vatCompany.company_vat_number &&
                vatCompany.company_address &&
                deliveryDate.date &&
                !!deliveryDate.time_interval_id &&
                (doneEditing || doneGuestSubmit)
            ) {
                setIsNextStep(true)
            } else {
                setIsNextStep(false)
            }
        }
    }, [isExportVat, setIsNextStep, deliveryDate, vatCompany, doneGuestSubmit, doneEditing, called]);

    const handleCallBeforeDelivery = useCallback(async is_call_before_delivery => {
        try {
            const result = await fetchSetCallBeforeDelivery({
                variables: {
                    input: {
                        cart_id: cartId,
                        is_call_before_delivery
                    }
                }
            });

            if (result) {
                storage.setItem('is_call_before_delivery', result.data.setCallBeforeDeliveryOnCart.cart.is_call_before_delivery)
            }
        } catch (error) {
            console.log(error)
        }
    }, [cartId])

    return {
        handleSubmit,
        setFormApi,
        handleCallBeforeDelivery,
        isCallBeforeDelivery,
        formKey
    }
}

export default UseIncludeVat
