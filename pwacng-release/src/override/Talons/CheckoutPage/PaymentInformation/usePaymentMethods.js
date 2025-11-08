import {useCallback, useEffect} from 'react';
import { useMutation, useQuery } from '@apollo/client';
import useFieldState from '@magento/peregrine/lib/hooks/hook-wrappers/useInformedFieldStateWrapper';
import DEFAULT_OPERATIONS from './paymentMethods.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const usePaymentMethods = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        getPaymentMethodsQuery,
        setPaymentMethodOnCartMutation
    } = operations;

    const [setPaymentMethod] = useMutation(setPaymentMethodOnCartMutation);

    const [{ cartId }] = useCartContext();

    const { data, loading } = useQuery(getPaymentMethodsQuery, {
        skip: !cartId,
        variables: { cartId }
    });

    const { value: currentSelectedPaymentMethod } = useFieldState(
        'selectedPaymentMethod'
    );

    const availablePaymentMethods =
        data?.cart?.available_payment_methods || [];

    const initialSelectedMethod = 'cashondelivery';

    const handlePaymentMethodSelection = useCallback(
        element => {
            const value = element.target.value;

            const paymentMethodData =
                value === 'vnpay' || value === 'momo_wallet' || value === 'zalopay'
                    ? {
                        code: value,
                        online_payment: {
                            return_url: `${window.location.origin}/order-confirmation`
                        }
                    }
                    : {
                        code: value
                    };

            setPaymentMethod({
                variables: {
                    cartId,
                    paymentMethod: paymentMethodData
                }
            });
        },
        [cartId, setPaymentMethod]
    );

    useEffect(() => {
        if (!currentSelectedPaymentMethod) {
            setPaymentMethod({
                variables: {
                    cartId,
                    paymentMethod: {
                        code: 'cashondelivery'
                    }
                }
            });
        }
    },  [currentSelectedPaymentMethod, cartId, setPaymentMethod])

    return {
        availablePaymentMethods,
        currentSelectedPaymentMethod,
        handlePaymentMethodSelection,
        initialSelectedMethod,
        isLoading: loading
    };
};
