import React, {useCallback, useContext, useEffect, useMemo, useState, useRef} from 'react';
import {useLazyQuery, useMutation, useQuery} from '@apollo/client';

import { useCartContext } from '@magento/peregrine/lib/context/cart';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './cartPage.gql';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {MiniCartContext} from "../../../@theme/Context/MiniCart/MiniCartContext";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import CryptoJS from "crypto-js";
import ReactGA from "react-ga4";
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 * This talon contains logic for a cart page component.
 * It performs effects and returns prop data for rendering the component.
 *
 * This talon performs the following effects:
 *
 * - Manages the updating state of the cart while cart details data is being fetched
 *
 * @function
 *
 * @param {Object} props
 * @param {CartPageQueries} props.queries GraphQL queries
 *
 * @returns {CartPageTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useCartPage } from '@magento/peregrine/lib/talons/CartPage/useCartPage';
 */
export const useCartPage = (props = {}) => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getCartDetailsQuery, removeAllCartItemsMutation, checkPriceChange } = operations;
    const [ showModalPriceChange, setShowModalPriceChange ] = useState(false);
    const [{ cartId }] = useCartContext();
    const [, { addToast }] = useToasts();
    const storage = new BrowserPersistence();
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const { miniCartInfo } = useContext(MiniCartContext);
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [ viewCart, setViewCart ] = useState(true);

    const [isCartUpdating, setIsCartUpdating] = useState(false);
    const [wishlistSuccessProps, setWishlistSuccessProps] = useState(null);

    const prevLenRef = useRef()
    const refetchingRef = useRef(false)

    const [fetchCartDetails, { called, data, loading }] = useLazyQuery(
        getCartDetailsQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            errorPolicy: 'all'
        }
    );

    const { data: checkPriceChangeData, loading: checkPriceChangeLoading, error: checkPriceChangeError } = useQuery(checkPriceChange, {
        variables: {
            cartId
        },
        skip: !cartId,
        fetchPolicy: 'no-cache'
    });

    const [fetchRemoveAllCartItems, {called: removeAllCartCalled, loading: removeAllCartLoading}] = useMutation(removeAllCartItemsMutation);

    const hasItems = !!data?.cart?.total_quantity;
    const shouldShowLoadingIndicator = called && loading && !hasItems;

    const cartItems = useMemo(() => {
        return data?.cart?.items || [];
    }, [data]);

    const cartSubtotal = useMemo(() => {
        return data?.cart?.prices?.grand_total?.value || 0;
    }, [data]);

    const skus = data?.cart?.items?.map(item => item.product.sku);

    const onAddToWishlistSuccess = useCallback(successToastProps => {
        setWishlistSuccessProps(successToastProps);
    }, []);

    const [, { dispatch }] = useEventingContext();

    useEffect(() => {
        const prev = prevLenRef.current
        const curr = cartItems?.length || 0
        if (!called && cartId && !removeAllCartCalled) {
            fetchCartDetails({ variables: { cartId } });
        } else if(!loading && called && cartId && !removeAllCartCalled && !refetchingRef.current && prev !== undefined && curr < prev && curr > 0) {
            debugger
            refetchingRef.current = true
            fetchCartDetails({ variables: { cartId } })
                .finally(() => {
                    refetchingRef.current = false
                })
        }

        // Let the cart page know it is updating while we're waiting on network data.
        setIsCartUpdating(loading);
        prevLenRef.current = curr
    }, [fetchCartDetails, called, cartId, loading, removeAllCartCalled, cartItems?.length]);

    useEffect(() => {
        try {
            if (viewCart) {
                if (miniCartInfo && miniCartInfo.cart_subtotal && cartItems.length > 0) {
                    setViewCart(false);

                    ReactGA.event('view_cart', {
                        category: "Ecommerce",
                        label: "View Cart Page",
                        store_id: storeCode,
                        store_name: storeName,
                        items: cartItems.map(item => ({
                            item_id: `${item.product.art_no}_${storeCode}`,
                            item_name: item.product?.name,
                            price: item.prices?.price?.value,
                            quantity: item.quantity,
                        }))
                    });

                    if (isSignedIn && currentUser) {
                        const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                        window.web_event.track("product", "view_cart", {
                            items: cartItems.map(item => ({
                                "type": "product",
                                "id": `${item.product.art_no}_${storeCode}`,
                                "name": item.product.name,
                                "sku": item.product.sku,
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
                                ...miniCartInfo
                            }
                        })
                    } else {
                        window.web_event.track("product", "view_cart", {
                            items: cartItems.map(item => ({
                                "type": "product",
                                "id": `${item.product.art_no}_${storeCode}`,
                                "name": item.product.name,
                                "sku": item.product.sku,
                                "price": item.product.price_range.maximum_price.final_price.value,
                                "original_price": item.product.price_range.maximum_price.regular_price.value,
                                "quantity": item.quantity
                            })),
                            extra: {
                                ...miniCartInfo
                            }
                        })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [miniCartInfo, viewCart, currentUser, isSignedIn, cartItems]);

    const handleRemoveAll = useCallback(async () => {
        setIsCartUpdating(true);

        try {
            if (cartId) {
                const result = await fetchRemoveAllCartItems({
                    variables: {
                        cartId
                    }
                });

                try {
                    ReactGA.event('remove_from_cart', {
                        category: "Ecommerce",
                        label: "Remove from Cart",
                        store_id: storeCode,
                        store_name: storeName,
                        items: cartItems.map(item => ({
                            item_id: `${item.product.art_no}_${storeCode}`,
                            item_name: item.product?.name,
                            price: item.prices?.price?.value,
                            quantity: item.quantity,
                        }))
                    });

                    if (isSignedIn && currentUser) {
                        const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                        window.web_event.track("product", "remove_cart", {
                            items: cartItems.map(item => ({
                                "type": "product",
                                "id": `${item.product.art_no}_${storeCode}`,
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
                                ...miniCartInfo
                            }
                        })
                    } else {
                        window.web_event.track("product", "remove_cart", {
                            items: cartItems.map(item => ({
                                "type": "product",
                                "id": `${item.product.art_no}_${storeCode}`,
                                "quantity": item.quantity
                            })),
                            extra: {
                                ...miniCartInfo
                            }
                        })
                    }
                } catch (error) {
                    console.log(error);
                }

                if (result) {
                    await fetchCartDetails({
                        variables: {cartId}
                    })
                    setIsCartUpdating(false);
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
            setIsCartUpdating(false);
        }
    }, [cartId, isCartUpdating, cartItems, miniCartInfo, isSignedIn])

    useEffect(() => {
        if (called && cartId && !loading && !removeAllCartLoading) {
            dispatch({
                type: 'CART_PAGE_VIEW',
                payload: {
                    cart_id: cartId,
                    products: cartItems
                }
            });
        }
    }, [called, cartItems, cartId, loading, dispatch, removeAllCartLoading]);

    useEffect(() => {
        if (!!checkPriceChangeData?.CheckPriceChange?.is_price_change) {
            setShowModalPriceChange(true);
        } else {
            setShowModalPriceChange(false);
        }
    }, [checkPriceChangeData]);

    return {
        cartItems,
        cartSubtotal,
        hasItems,
        isCartUpdating,
        fetchCartDetails,
        onAddToWishlistSuccess,
        setIsCartUpdating,
        shouldShowLoadingIndicator,
        wishlistSuccessProps,
        handleRemoveAll,
        removeAllCartLoading,
        showModalPriceChange,
        setShowModalPriceChange
    };
};

/** JSDoc type definitions */

/**
 * GraphQL formatted string queries used in this talon.
 *
 * @typedef {Object} CartPageQueries
 *
 * @property {GraphQLAST} getCartDetailsQuery Query for getting the cart details.
 *
 * @see [cartPage.gql.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/cartPage.gql.js}
 * for queries used in Venia
 */

/**
 * Props data to use when rendering a cart page component.
 *
 * @typedef {Object} CartPageTalonProps
 *
 * @property {Array<Object>} cartItems An array of item objects in the cart.
 * @property {boolean} hasItems True if the cart has items. False otherwise.
 * @property {boolean} isCartUpdating True if the cart is updating. False otherwise.
 * @property {function} setIsCartUpdating Callback function for setting the updating state of the cart page.
 * @property {boolean} shouldShowLoadingIndicator True if the loading indicator should be rendered. False otherwise.
 */
