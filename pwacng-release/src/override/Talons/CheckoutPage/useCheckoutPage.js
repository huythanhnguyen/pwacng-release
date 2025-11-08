import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
    useApolloClient,
    useLazyQuery,
    useMutation,
    useQuery
} from '@apollo/client';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import DEFAULT_OPERATIONS from '../../Talons/CheckoutPage/checkoutPage.gql';

import CheckoutError from '@magento/peregrine/lib/talons/CheckoutPage/CheckoutError';
import {
    GET_STORE_INFORMATION_QUERY,
    GET_STORE_VIEW_QUERY
} from "../../../@theme/Talons/StoreLocation/storeLocation.gql";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
import {useLocation} from "react-router-dom";
import {WRITE_LOG_CLIENT} from "../App/log.gql";
export const CHECKOUT_STEP = {
    SHIPPING_ADDRESS: 1,
    PAYMENT: 2
};

/**
 *
 * @param {DocumentNode} props.operations.getCheckoutDetailsQuery query to fetch checkout details
 * @param {DocumentNode} props.operations.getCustomerQuery query to fetch customer details
 * @param {DocumentNode} props.operations.getOrderDetailsQuery query to fetch order details
 * @param {DocumentNode} props.operations.createCartMutation mutation to create a new cart
 * @param {DocumentNode} props.operations.placeOrderMutation mutation to place order
 *
 * @returns {
 *  activeContent: String,
 *  availablePaymentMethods: Array,
 *  cartItems: Array,
 *  checkoutStep: Number,
 *  customer: Object,
 *  error: ApolloError,
 *  handlePlaceOrder: Function,
 *  handlePlaceOrderEnterKeyPress: Function,
 *  hasError: Boolean,
 *  isCartEmpty: Boolean,
 *  isGuestCheckout: Boolean,
 *  isLoading: Boolean,
 *  isUpdating: Boolean,
 *  orderDetailsData: Object,
 *  orderDetailsLoading: Boolean,
 *  orderNumber: String,
 *  placeOrderLoading: Boolean,
 *  setCheckoutStep: Function,
 *  setIsUpdating: Function,
 *  setShippingInformationDone: Function,
 *  setShippingMethodDone: Function,
 *  setPaymentInformationDone: Function,
 *  scrollShippingInformationIntoView: Function,
 *  shippingInformationRef: ReactRef,
 *  shippingMethodRef: ReactRef,
 *  scrollShippingMethodIntoView: Function,
 *  resetReviewOrderButtonClicked: Function,
 *  handleReviewOrder: Function,
 *  handleReviewOrderEnterKeyPress: Function,
 *  reviewOrderButtonClicked: Boolean,
 *  toggleAddressBookContent: Function,
 *  toggleSignInContent: Function,
 * }
 */
export const useCheckoutPage = (props = {}) => {
    const [writeLogClient] = useMutation(WRITE_LOG_CLIENT);

    const storage = new BrowserPersistence();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const [ isContinue, setIsContinue ] = useState(false);
    const [ deliveryDate, setDeliveryDate ] = useState({
        date: '',
        time_interval_id: 0,
        comment: '',
        from: '',
        to: ''
    });
    const [ showModalChangeStore, setShowModalChangeStore ] = useState(false);
    const [ selectedAddressId, setSelectedAddressId ] = useState({
        street: '',
        city: '',
        ward: '',
        address_details: ''
    });
    const [ selectedAddress, setSelectedAddress ] = useState();
    const [ isDeliveryTimeInit, setIsDeliveryTimeInit ] = useState(true);
    const [ loading, setLoading ] = useState(false);
    const [ viewCheckout, setViewCheckout ] = useState(true);
    const [ doneGuestSubmit, setDoneGuestSubmit ] = useState(false);
    const storeCode = storage.getItem('store')?.storeInformation?.source_code?.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const location = useLocation();

    const {
        createCartMutation,
        getCheckoutDetailsQuery,
        getOrderDetailsQuery,
        placeOrderMutation
    } = operations;

    const [ fetchStoreView, { data: storeViewData, loading: storeViewLoading, error: storeViewError } ] = useLazyQuery(GET_STORE_VIEW_QUERY, {
        fetchPolicy: 'no-cache'
    });

    const [reviewOrderButtonClicked, setReviewOrderButtonClicked] = useState(
        false
    );

    const apolloClient = useApolloClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [placeOrderButtonClicked, setPlaceOrderButtonClicked] = useState(
        false
    );

    const [checkoutStep, setCheckoutStep] = useState(
        CHECKOUT_STEP.SHIPPING_ADDRESS
    );

    const [{ isSignedIn, currentUser}] = useUserContext();
    const [{ cartId }, { createCart, removeCart }] = useCartContext();

    const [fetchCartId] = useMutation(createCartMutation);
    const [
        placeOrder,
        {
            data: placeOrderData,
            error: placeOrderError,
            loading: placeOrderLoading
        }
    ] = useMutation(placeOrderMutation);

    const [
        getOrderDetails,
        { data: orderDetailsData, loading: orderDetailsLoading }
    ] = useLazyQuery(getOrderDetailsQuery, {
        // We use this query to fetch details _just_ before submission, so we
        // want to make sure it is fresh. We also don't want to cache this data
        // because it may contain PII.
        fetchPolicy: 'no-cache'
    });

    const {
        data: checkoutData,
        networkStatus: checkoutQueryNetworkStatus
    } = useQuery(getCheckoutDetailsQuery, {
        /**
         * Skip fetching checkout details if the `cartId`
         * is a falsy value.
         */
        skip: !cartId,
        notifyOnNetworkStatusChange: true,
        variables: {
            cartId
        }
    });

    const cartItems = useMemo(() => {
        return (checkoutData?.cart?.items) || [];
    }, [checkoutData]);

    const hasAlcoholProduct = useMemo(() => {
        return (!!checkoutData?.cart?.items?.some(item => item?.product?.is_alcohol === true));
    }, [checkoutData]);

    const totalPrice = useMemo(() => {
        return (checkoutData?.cart?.prices?.grand_total) || [];
    }, [checkoutData]);

    const cartPrice = useMemo(() => {
        return checkoutData?.cart?.prices?.subtotal_excluding_tax?.value || 0
    }, [checkoutData])

    /**
     * For more info about network statues check this out
     *
     * https://www.apollographql.com/docs/react/data/queries/#inspecting-loading-states
     */
    const isLoading = useMemo(() => {
        return checkoutQueryNetworkStatus
            ? checkoutQueryNetworkStatus < 7
            : true;
    }, [checkoutQueryNetworkStatus]);

    const checkoutError = useMemo(() => {
        if (placeOrderError) {
            return new CheckoutError(placeOrderError);
        }
    }, [placeOrderError]);

    const resetReviewOrderButtonClicked = useCallback(() => {
        setReviewOrderButtonClicked(false);
    }, []);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (viewCheckout) {
            if (checkoutData) {
                setViewCheckout(false);

                try {
                    if (isSignedIn && currentUser) {
                        const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                        window.web_event.track("product", "checkout", {
                            items: cartItems.map(item => ({
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
                                    "phone": customerPhoneNumber
                                }
                            },
                            extra: {
                                "cart_subtotal": cartPrice,
                                "cart_item_count": checkoutData?.cart?.total_quantity || 0
                            }
                        })

                    } else {
                        window.web_event.track("product", "checkout", {
                            items: cartItems.map(item => ({
                                "type": "product", // Fixed Value
                                "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                "name": item.product.name,
                                "sku": item.product.sku, // ArtNo + "_" + Barcode
                                "price": item.product.price_range.maximum_price.final_price.value,
                                "original_price": item.product.price_range.maximum_price.regular_price.value,
                                "quantity": item.quantity
                            })),
                            extra: {
                                "cart_subtotal": cartPrice,
                                "cart_item_count": checkoutData?.cart?.total_quantity || 0
                            }
                        })
                    }
                } catch (e) {
                    writeLogClient({
                        variables: {
                            message: `checkoutData error: isSignedIn - ${isSignedIn}. currentUser - ${currentUser}`
                        }
                    });
                }
            }
        }
    }, [viewCheckout, cartItems, storeCode, checkoutData, isSignedIn, currentUser]);

    useEffect(() => {
        setLoading(storeViewLoading)
    }, [storeViewLoading]);

    useEffect(() => {
        if (location.pathname === "/checkout" && totalPrice && cartItems && cartItems.length > 0) {
            ReactGA.event('begin_checkout', {
                currency: totalPrice.currency,
                value: totalPrice.value,
                store_id: storeCode,
                store_name: storeName,
                items: cartItems.map(item => ({
                    item_name: item.product.name,
                    item_id: `${item.product.art_no}_${storeCode}`,
                    price: item.prices?.price?.value,
                    quantity: item.quantity
                }))
            });
        }
    }, [cartItems, location, totalPrice])

    const handlePlaceOrder = useCallback(async () => {
        // Fetch order details and then use an effect to actually place the
        // order. If/when Apollo returns promises for invokers from useLazyQuery
        // we can just await this function and then perform the rest of order
        // placement.

        const result = await getOrderDetails({
            variables: {
                cartId
            }
        });

        const shippingAddresses = result?.data?.cart?.shipping_addresses?.[0] || null;
        const storeViewStorage = storage.getItem('store_view_code');
        const storeViewResult = await fetchStoreView({
            variables: {
                street: selectedAddressId.street,
                city: selectedAddressId.city,
                ward: selectedAddressId.ward,
                language: storage.getItem('language').code,
                website: 'b2c'
            }
        });

        if (shippingAddresses && selectedAddressId && storeViewStorage && storeViewResult?.data?.storeView?.store_view_code) {
            const match = storeViewResult?.data?.storeView?.store_view_code?.some(
                item => item.store_view_code.slice(0, -3) === storeViewStorage.slice(0, -3)
            );

            if (
                !match
                || shippingAddresses.city_code !== selectedAddressId.city
                || shippingAddresses.ward_code !== selectedAddressId.ward
                || shippingAddresses.street.join(', ') !== selectedAddressId.street
            ) {
                handleOpenChangeStore(true);
                return
            }
        } else {
            handleOpenChangeStore(true);
            return
        }

        setPlaceOrderButtonClicked(true);
        setIsPlacingOrder(true);
    }, [cartId, selectedAddressId]);

    const handlePlaceOrderEnterKeyPress = useCallback((event) => {
        if (event.key === 'Enter') {
            handlePlaceOrder();
        }
    }, [handlePlaceOrder]);

    const [, { dispatch }] = useEventingContext();

    useEffect(() => {
        async function placeOrderAndCleanup(orderDetailsData) {
            try {
                const result = await placeOrder({
                    variables: {
                        cartId
                    }
                });

                if (result.data.placeOrder.orderV2) {
                    try {
                        ReactGA.event('add_payment_info',{
                            category: 'Ecommerce',
                            label: 'Payment Info Added',
                            store_id: storeCode,
                            store_name: storeName,
                            payment_type: orderDetailsData?.cart?.selected_payment_method?.title || '',
                            items: (orderDetailsData?.cart?.items || []).map(item => ({
                                item_id: `${item.product.art_no}_${storeCode}`,
                                item_name: item.product.name,
                                price: item.product.price_range?.maximum_price?.final_price?.value || 0,
                                quantity: item.quantity
                            }))
                        });

                        ReactGA.event('purchase',{
                            category: 'Ecommerce',
                            transaction_id: result.data.placeOrder.orderV2.number,
                            affiliation: 'Online Store',
                            value: orderDetailsData.cart.prices?.grand_total?.value || 0,
                            currency: orderDetailsData.cart.prices?.grand_total?.currency || 'VND',
                            store_id: storeCode,
                            store_name: storeName,
                            items: (orderDetailsData?.cart?.items || []).map(item => ({
                                item_name: item.product.name,
                                item_id: `${item.product.art_no}_${storeCode}`,
                                price: item.product.price_range?.maximum_price?.final_price?.value || 0,
                                quantity: item.quantity
                            }))
                        });

                        if (isSignedIn && currentUser) {
                            const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                            window.web_event.track("product", "purchase", {
                                items: (orderDetailsData?.cart?.items || []).map(item => ({
                                    "type": "product", // Fixed Value
                                    "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                    "name": item.product.name,
                                    "sku": item.product.sku, // ArtNo + "_" + Barcode
                                    "quantity": item.quantity,
                                    "sale_price": item.product.price_range?.maximum_price?.final_price?.value || 0,
                                    "line_item_quantity": item.quantity,
                                    "line_item_discount_amount": item.prices.total_item_discount.value, // (141000 - 109000) * 2
                                    "line_item_sale_price": item.prices.row_total.value,
                                    "line_item_rounded_amount": item.prices.row_total.value
                                })),
                                dims: {
                                    purchase: {
                                        "id": result.data.placeOrder.orderV2.number,
                                        "name": `#${result.data.placeOrder.orderV2.number}`,
                                        "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                        "customer_name": currentUser.firstname,
                                        "customer_phone": customerPhoneNumber,
                                        "customer_email": currentUser.email,
                                        "shipping_name": orderDetailsData?.cart?.shipping_addresses?.[0]?.firstname || '',
                                        "shipping_phone": orderDetailsData?.cart?.shipping_addresses?.[0]?.telephone || '',
                                        "shipping_email": orderDetailsData?.cart?.email || '',
                                        "shipping_city": orderDetailsData?.cart?.shipping_addresses?.[0]?.city || '',
                                        "shipping_province": orderDetailsData?.cart?.shipping_addresses?.[0]?.ward || '',
                                        "shipping_address": orderDetailsData?.cart?.shipping_addresses?.[0]?.street?.join(', ') || '',
                                        "discount_amount": orderDetailsData.cart.prices?.discounts?.[0]?.amount?.value || 0,
                                        "shipping_amount": orderDetailsData?.cart?.shipping_addresses?.[0]?.selected_shipping_method?.amount?.value || 0,
                                        "payment_method": orderDetailsData.cart.selected_payment_method?.title || '',
                                        "subtotal_price": orderDetailsData.cart.prices?.subtotal_excluding_tax?.value || 0,
                                        "total_price": orderDetailsData.cart.prices?.grand_total?.value || 0,
                                        "revenue": orderDetailsData.cart.prices?.grand_total?.value || 0,
                                        "status": result.data.placeOrder.orderV2.status
                                    },
                                    customers: {
                                        "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                        "name": currentUser.firstname,
                                        "email": currentUser.email,
                                        "phone": customerPhoneNumber
                                    }
                                },
                                extra: {
                                    "order_id": result.data.placeOrder.orderV2.number,
                                    "discount_amount": orderDetailsData.cart.prices?.discounts?.[0]?.amount?.value || 0,
                                    "revenue": orderDetailsData.cart.prices?.grand_total?.value || 0
                                }
                            })
                        } else {
                            window.web_event.track("product", "purchase", {
                                items: orderDetailsData.cart.items.map(item => ({
                                    "type": "product", // Fixed Value
                                    "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                    "name": item.product.name,
                                    "sku": item.product.sku, // ArtNo + "_" + Barcode
                                    "quantity": item.quantity,
                                    "sale_price": item.product.price_range?.maximum_price?.final_price?.value || 0,
                                    "line_item_quantity": item.quantity,
                                    "line_item_discount_amount": item.prices?.total_item_discount?.value || 0, // (141000 - 109000) * 2
                                    "line_item_sale_price": item.prices?.row_total?.value || 0,
                                    "line_item_rounded_amount": item.prices?.row_total?.value || 0
                                })),
                                dims: {
                                    purchase: {
                                        "id": result.data.placeOrder.orderV2.number,
                                        "name": `#${result.data.placeOrder.orderV2.number}`,
                                        "shipping_name": orderDetailsData?.cart?.shipping_addresses?.[0]?.firstname || '',
                                        "shipping_phone": orderDetailsData?.cart?.shipping_addresses?.[0]?.telephone || '',
                                        "shipping_email": orderDetailsData?.cart?.email || '',
                                        "shipping_city": orderDetailsData?.cart?.shipping_addresses?.[0]?.city || '',
                                        "shipping_province": orderDetailsData?.cart?.shipping_addresses?.[0]?.ward || '',
                                        "shipping_address": orderDetailsData?.cart?.shipping_addresses?.[0]?.street?.join(', ') || '',
                                        "discount_amount": orderDetailsData.cart.prices?.discounts?.[0]?.amount?.value || 0,
                                        "shipping_amount": orderDetailsData?.cart?.shipping_addresses?.[0]?.selected_shipping_method?.amount?.value || 0,
                                        "payment_method": orderDetailsData?.cart?.selected_payment_method?.title || '',
                                        "subtotal_price": orderDetailsData?.cart?.prices?.subtotal_excluding_tax?.value || 0,
                                        "total_price": orderDetailsData?.cart?.prices?.grand_total?.value || 0,
                                        "revenue": orderDetailsData?.cart?.prices?.grand_total?.value || 0,
                                        "status": result.data.placeOrder.orderV2.status
                                    },
                                    customers: {
                                        "customer_id": CryptoJS.MD5(orderDetailsData?.cart?.shipping_addresses?.[0]?.telephone || '').toString(), // MD5(phone)
                                        "name": orderDetailsData?.cart?.shipping_addresses?.[0]?.firstname || '',
                                        "email": orderDetailsData?.cart?.email || '',
                                        "phone": orderDetailsData?.cart?.shipping_addresses?.[0]?.telephone || ''
                                    }
                                },
                                extra: {
                                    "order_id": result.data.placeOrder.orderV2.number,
                                    "discount_amount": orderDetailsData.cart.prices?.discounts?.[0]?.amount?.value || 0,
                                    "revenue": orderDetailsData.cart.prices?.grand_total?.value || 0
                                }
                            })
                        }
                    } catch (e) {
                        writeLogClient({
                            variables: {
                                message: `checkoutData error: orderDetailsData - ${orderDetailsData}`
                            }
                        });
                    }

                    if (!isSignedIn) {
                        storage.setItem('customer_no', '');
                    }
                    storage.setItem('is_call_before_delivery', '');

                    // Cleanup stale cart and customer info.
                    await removeCart();
                    await apolloClient.clearCacheData(apolloClient, 'cart');

                    await createCart({
                        fetchCartId
                    });
                }

                setPlaceOrderButtonClicked(false);
            } catch (err) {
                // Log error for monitoring but don't expose details to console in production
                if (process.env.NODE_ENV === 'development') {
                    console.error('An error occurred during when placing the order', err);
                }
                setPlaceOrderButtonClicked(false);
            }
        }

        if (orderDetailsData && isPlacingOrder) {
            setIsPlacingOrder(false);
            placeOrderAndCleanup(orderDetailsData);
        }
    }, [
        apolloClient,
        cartId,
        createCart,
        fetchCartId,
        orderDetailsData,
        placeOrder,
        removeCart,
        isPlacingOrder,
        currentUser,
        isSignedIn
    ]);

    useEffect(() => {
        if (
            checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS &&
            cartItems.length
        ) {
            dispatch({
                type: 'CHECKOUT_PAGE_VIEW',
                payload: {
                    cart_id: cartId,
                    products: cartItems
                }
            });
        } else if (reviewOrderButtonClicked) {
            dispatch({
                type: 'CHECKOUT_REVIEW_BUTTON_CLICKED',
                payload: {
                    cart_id: cartId
                }
            });
        } else if (
            placeOrderButtonClicked &&
            orderDetailsData &&
            orderDetailsData.cart
        ) {
            const shipping =
                orderDetailsData.cart?.shipping_addresses &&
                orderDetailsData.cart.shipping_addresses.reduce(
                    (result, item) => {
                        return [
                            ...result,
                            {
                                ...item.selected_shipping_method
                            }
                        ];
                    },
                    []
                );
            const eventPayload = {
                cart_id: cartId,
                amount: orderDetailsData.cart.prices,
                shipping: shipping,
                payment: orderDetailsData.cart.selected_payment_method,
                products: orderDetailsData.cart.items
            };
            if (isPlacingOrder) {
                dispatch({
                    type: 'CHECKOUT_PLACE_ORDER_BUTTON_CLICKED',
                    payload: eventPayload
                });
            } else if (placeOrderData && orderDetailsData?.cart.id === cartId) {
                dispatch({
                    type: 'ORDER_CONFIRMATION_PAGE_VIEW',
                    payload: {
                        order_number:
                        placeOrderData?.placeOrder?.order?.order_number,
                        ...eventPayload
                    }
                });
            }
        }
    }, [
        placeOrderButtonClicked,
        cartId,
        checkoutStep,
        orderDetailsData,
        cartItems,
        isLoading,
        dispatch,
        placeOrderData,
        isPlacingOrder,
        reviewOrderButtonClicked
    ]);

    const handleOpenChangeStore = useCallback(() => {
        setShowModalChangeStore(true);
    }, [setShowModalChangeStore]);

    const handleCloseChangeStore = useCallback(() => {
        setShowModalChangeStore(false);
    }, [setShowModalChangeStore]);

    /*const handleCloseAndNext = useCallback(() => {
        setShowModalChangeStore(false);
        setIsContinue(true);
    }, [setShowModalChangeStore, setIsContinue]);*/

    return {
        availablePaymentMethods: checkoutData?.cart?.available_payment_methods || null,
        cartItems,
        hasAlcoholProduct,
        checkoutStep,
        error: checkoutError,
        handlePlaceOrder,
        handlePlaceOrderEnterKeyPress,
        isCartEmpty: !(checkoutData?.cart?.total_quantity),
        isGuestCheckout: !isSignedIn,
        isLoading,
        isUpdating,
        orderDetailsData,
        orderDetailsLoading,
        orderNumber:
            (placeOrderData && placeOrderData?.placeOrder?.orderV2?.number) ||
            null,
        placeOrderData,
        placeOrderLoading,
        placeOrderButtonClicked,
        setCheckoutStep,
        setIsUpdating,
        resetReviewOrderButtonClicked,
        reviewOrderButtonClicked,
        deliveryDate,
        setDeliveryDate,
        handleOpenChangeStore,
        handleCloseChangeStore,
        showModalChangeStore,
        selectedAddressId,
        setSelectedAddressId,
        fetchStoreView,
        storeViewData,
        isContinue,
        setIsContinue,
        loading,
        setLoading,
        isDeliveryTimeInit,
        setIsDeliveryTimeInit,
        doneGuestSubmit,
        setDoneGuestSubmit,
        selectedAddress,
        setSelectedAddress
    };
};
