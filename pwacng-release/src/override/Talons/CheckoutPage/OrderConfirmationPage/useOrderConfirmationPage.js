import React, {useCallback, useEffect} from "react";
import { CANCEL_ORDER_MUTATION, REORDER_GUEST_MUTATION, PAYMENT_RESULT_QUERY, GUEST_EMAIL_QUERY } from '@magenest/theme/Talons/OrderConfirmationPage/orderConfirmationPage.gql';
import {useLazyQuery, useMutation} from "@apollo/client";
import { useHistory } from 'react-router-dom';
import { useToasts } from '@magento/peregrine';
import {useIntl} from "react-intl";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {REORDER} from "../../../Components/OrderHistoryPage/reorder.gql";
import {AlertCircle as AlertCircleIcon} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useCartContext} from "@magento/peregrine/lib/context/cart";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const flatten = data => {
    const { cart } = data;
    const { shipping_addresses } = cart;

    // Safe array access with fallback
    const address = shipping_addresses?.[0] || null;

    const shippingMethod = address?.selected_shipping_method && `${
        address.selected_shipping_method.carrier_title
    } - ${address.selected_shipping_method.method_title}`;

    return {
        city: address?.city || '',
        country: address?.country?.label || '',
        email: cart?.email || '',
        firstname: address?.firstname || '',
        postcode: address?.postcode || '',
        region: address?.region?.label || '',
        shippingMethod: shippingMethod || '',
        street: address?.street || [],
        totalItemQuantity: cart?.total_quantity || 0
    };
};

export const useOrderConfirmationPage = props => {
    const {
        search,
        orderNumber
    } = props;
    const { formatMessage } = useIntl();

    const history = useHistory();
    const [, { addToast }] = useToasts();
    const [{ isSignedIn }] = useUserContext();
    const [{ cartId }] = useCartContext();
    const [ fetchCancelOrder, {loading: cancelOrderLoading} ] = useMutation(CANCEL_ORDER_MUTATION);
    const [reorder, { loading:reorderLoading, error:reorderError }] = useMutation(
        REORDER,
        {
            fetchPolicy: 'no-cache',
            skip: !isSignedIn,
            onCompleted: () => {
                history.push('/cart');
            }
        }
    );
    const [reorderGuest, { loading:reorderGuestLoading, error:reorderGuestError }] = useMutation(
        REORDER_GUEST_MUTATION,
        {
            fetchPolicy: 'no-cache',
            skip: isSignedIn,
            onCompleted: () => {
                history.push('/cart');
            }
        }
    );
    const [ fetchPaymentResult, { data, loading, error } ] = useLazyQuery(PAYMENT_RESULT_QUERY);

    const [ fetchGuestEmail, { data: guestEmail } ] = useLazyQuery(GUEST_EMAIL_QUERY);

    useEffect(() => {
        if (search) {
            fetchPaymentResult({
                variables: {
                    input: {
                        response_params: search
                    }
                },
                skip: !search
            })

            const currentUrl = new URL(window.location);
            currentUrl.search = '';
            window.history.replaceState({}, '', currentUrl);
        }
    }, [search]);

    useEffect(() => {
        if (orderNumber && !isSignedIn) {
            fetchGuestEmail({
                variables: {
                    order_number: orderNumber
                },
                skip: isSignedIn
            })
        }
    }, [fetchGuestEmail, orderNumber, isSignedIn]);

    const handleCancelOrder = useCallback(async (orderId, email) => {
        await fetchCancelOrder({
            variables: {
                input: {
                    order_id: atob(orderId),
                    reason: 'The order was placed by mistake'
                }
            }
        });

        addToast({
            type: 'success',
            message: formatMessage({
                id: 'global.cancelOrderText',
                defaultMessage: 'You have successfully canceled the order.'
            }),
            timeout: 5000
        });

        history.push(`/order/${orderNumber}`);

    }, [fetchCancelOrder, orderNumber])

    const handleReOrder = useCallback( () => {
        reorder({
            variables: {
                orderNumber: orderNumber
            }
        }).then(response => {
            if (response.errors) {
                response.errors && response.errors.map(error => (
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: error.message,
                        dismissable: true,
                        timeout: 5000
                    })
                ))
            }
        }).catch(error => {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message || 'An unexpected error occurred.',
                dismissable: true,
                timeout: 5000
            })
        });
    }, [orderNumber, reorder]);

    const handleReOrderGuest = useCallback( () => {
        reorderGuest({
            variables: {
                input: {
                    cart_id: cartId,
                    order_number: orderNumber
                }
            }
        }).then(response => {
            if (response.errors) {
                response.errors && response.errors.map(error => (
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: error.message,
                        dismissable: true,
                        timeout: 5000
                    })
                ))
            }
        }).catch(error => {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message || 'An unexpected error occurred.',
                dismissable: true,
                timeout: 5000
            })
        });
    }, [cartId, orderNumber, reorderGuest]);

    return {
        handleCancelOrder,
        handleReOrder,
        handleReOrderGuest,
        data,
        orderStatus: data?.paymentResult?.status,
        orderPaymentId: data?.paymentResult?.order_id,
        customerEmail: data?.paymentResult?.email || guestEmail?.guestEmailOrder?.email || '',
        loading: loading || cancelOrderLoading || reorderLoading || reorderGuestLoading
    };
};
