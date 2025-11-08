import React, {useCallback, useEffect, useMemo} from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';

import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/MiniCart/miniCart.gql';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import { REMOVE_ALL_CART_ITEMS_MUTATION } from "../CartPage/cartPage.gql";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 *
 * @param {Boolean} props.isOpen - True if the mini cart is open
 * @param {Function} props.setIsOpen - Function to toggle the mini cart
 * @param {DocumentNode} props.operations.miniCartQuery - Query to fetch mini cart data
 * @param {DocumentNode} props.operations.removeItemMutation - Mutation to remove an item from cart
 *
 * @returns {
 *      closeMiniCart: Function,
 *      errorMessage: String,
 *      handleEditCart: Function,
 *      handleProceedToCheckout: Function,
 *      handleRemoveItem: Function,
 *      loading: Boolean,
 *      productList: Array<>,
 *      subTotal: Number,
 *      totalQuantity: Number
 *      configurableThumbnailSource: String
 *  }
 */
export const useMiniCart = props => {
    const { isOpen } = props;
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const [, { dispatch }] = useEventingContext();

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        removeItemMutation,
        miniCartQuery,
        getStoreConfigQuery
    } = operations;

    const [{ cartId }] = useCartContext();
    const history = useHistory();
    const [, { addToast }] = useToasts();

    const { data: miniCartData, loading: miniCartLoading } = useQuery(
        miniCartQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            variables: { cartId },
            skip: !cartId,
            errorPolicy: 'all'
        }
    );

    const [fetchRemoveAllCartItems, {called: removeAllCartCalled, loading: removeAllCartLoading}] = useMutation(REMOVE_ALL_CART_ITEMS_MUTATION);

    const { data: storeConfigData } = useQuery(getStoreConfigQuery, {
        fetchPolicy: 'cache-and-network'
    });

    const configurableThumbnailSource = useMemo(() => {
        if (storeConfigData) {
            return storeConfigData.storeConfig.configurable_thumbnail_source;
        }
    }, [storeConfigData]);

    const storeUrlSuffix = useMemo(() => {
        if (storeConfigData) {
            return storeConfigData.storeConfig.product_url_suffix;
        }
    }, [storeConfigData]);

    const [{ isSignedIn, currentUser }] = useUserContext();
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeCode = store?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = store?.storeInformation?.name || '';

    const [
        removeItem,
        {
            loading: removeItemLoading,
            called: removeItemCalled,
            error: removeItemError
        }
    ] = useMutation(removeItemMutation);

    const totalQuantity = useMemo(() => {
        if (!miniCartLoading) {
            return miniCartData?.cart?.total_quantity;
        }
    }, [miniCartData, miniCartLoading]);

    const subTotal = useMemo(() => {
        if (!miniCartLoading) {
            return miniCartData?.cart?.prices?.grand_total;
        }
    }, [miniCartData, miniCartLoading]);

    const revenue = useMemo(() => {
        if (!miniCartLoading) {
            return miniCartData?.cart?.prices?.subtotal_with_discount_excluding_tax;
        }
    }, [miniCartData, miniCartLoading]);

    const productList = useMemo(() => {
        if (!miniCartLoading) {
            return miniCartData?.cart?.items;
        }
    }, [miniCartData, miniCartLoading]);

    const closeMiniCart = useCallback(() => {
        closeDrawer('miniCart');
    }, [closeDrawer]);

    const handleRemoveAllCart = useCallback(async () => {
        try {
            if (cartId && miniCartData?.cart?.items?.length > 0) {
                const cart_subtotal = miniCartData.cart?.prices?.grand_total?.value || 0;
                const cart_item_count = miniCartData.cart?.total_quantity || 0;

                ReactGA.event('remove_from_cart', {
                    category: "Ecommerce",
                    label: "Remove from Cart",
                    store_id: storeCode,
                    store_name: storeName,
                    items: miniCartData.cart.items.map(item => ({
                        item_id: `${item.product.art_no}_${storeCode}`,
                        item_name: item.product?.name,
                        price: item.prices?.price?.value,
                        quantity: item.quantity,
                    }))
                });

                if (isSignedIn && currentUser) {
                    const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                    window.web_event.track("product", "remove_cart", {
                        items: miniCartData.cart.items.map(item => ({
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
                            "cart_subtotal": cart_subtotal,
                            "cart_item_count": cart_item_count
                        }
                    })
                } else {
                    window.web_event.track("product", "remove_cart", {
                        items: miniCartData.cart.items.map(item => ({
                            "type": "product",
                            "id": `${item.product.art_no}_${storeCode}`,
                            "quantity": item.quantity
                        })),
                        extra: {
                            "cart_subtotal": cart_subtotal,
                            "cart_item_count": cart_item_count
                        }
                    })
                }

                await fetchRemoveAllCartItems({
                    variables: {
                        cartId
                    },
                    refetchQueries: [{query: miniCartQuery, variables: {cartId}}]
                });
            }
        } catch (e) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: e.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [cartId, miniCartData])

    const handleRemoveItem = useCallback(
        async id => {
            try {
                const result = await removeItem({
                    variables: {
                        cartId,
                        itemId: id
                    }
                });

                const [product] = productList.filter(
                    p => (p.uid || p.id) === id
                );

                const selectedOptionsLabels =
                    product.configurable_options?.map(
                        ({ option_label, value_label }) => ({
                            attribute: option_label,
                            value: value_label
                        })
                    ) || null;

                dispatch({
                    type: 'CART_REMOVE_ITEM',
                    payload: {
                        cartId,
                        sku: product.product.sku,
                        name: product.product.name,
                        priceTotal: product.prices.price.value,
                        currencyCode: product.prices.price.currency,
                        discountAmount:
                        product.prices.total_item_discount.value,
                        selectedOptions: selectedOptionsLabels,
                        quantity: product.quantity
                    }
                });

                if (result) {
                    try {
                        const cart_subtotal = result?.data?.removeItemFromCart?.cart?.prices?.grand_total?.value || 0;
                        const cart_item_count = result?.data?.removeItemFromCart?.cart?.total_quantity || 0;

                        ReactGA.event('remove_from_cart', {
                            category: "Ecommerce",
                            label: "Remove from Cart",
                            store_id: storeCode,
                            store_name: storeName,
                            items: [
                                {
                                    item_id: `${product.product.art_no}_${storeCode}`,
                                    item_name: product.product?.name,
                                    price: product.prices?.price?.value || 0,
                                    quantity: product.quantity
                                }
                            ]
                        });

                        if (isSignedIn && currentUser) {
                            const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                            window.web_event.track("product", "remove_cart", {
                                items: [
                                    {
                                        "type": "product",
                                        "id": `${product.product.art_no}_${storeCode}`,
                                        "quantity": product.quantity
                                    }
                                ],
                                dims: {
                                    customers: {
                                        "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                        "name": currentUser.firstname,
                                        "email": currentUser.email,
                                        "phone": customerPhoneNumber
                                    }
                                },
                                extra: {
                                    "cart_subtotal": cart_subtotal,
                                    "cart_item_count": cart_item_count
                                }
                            })
                        } else {
                            window.web_event.track("product", "remove_cart", {
                                items: [
                                    {
                                        "type": "product",
                                        "id": `${product.product.art_no}_${storeCode}`,
                                        "quantity": product.quantity
                                    }
                                ],
                                extra: {
                                    "cart_subtotal": cart_subtotal,
                                    "cart_item_count": cart_item_count
                                }
                            })
                        }
                    } catch (error) {
                        console.log(error);
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
            }
        },
        [removeItem, cartId, dispatch, productList]
    );

    const handleProceedToCheckout = useCallback(() => {
        closeDrawer('miniCart');
        history.push('/checkout');
    }, [history, closeDrawer]);

    const handleEditCart = useCallback(() => {
        closeDrawer('miniCart');
        history.push('/cart');
    }, [history, closeDrawer]);

    const derivedErrorMessage = useMemo(
        () => deriveErrorMessage([removeItemError]),
        [removeItemError]
    );

    useEffect(() => {
        if (isOpen) {
            dispatch({
                type: 'MINI_CART_VIEW',
                payload: {
                    cartId: cartId,
                    products: productList
                }
            });
        }
    }, [isOpen, cartId, productList, dispatch]);

    return {
        closeMiniCart,
        errorMessage: derivedErrorMessage,
        handleEditCart,
        handleProceedToCheckout,
        handleRemoveItem,
        loading: miniCartLoading || (removeItemCalled && removeItemLoading) || (removeAllCartLoading && removeAllCartCalled),
        productList,
        subTotal,
        totalQuantity,
        configurableThumbnailSource,
        storeUrlSuffix,
        handleRemoveAllCart,
        revenue
    };
};
