import React, {useCallback, useContext, useEffect, useState} from 'react';
import ReactGA from "react-ga4";
import { useMutation } from '@apollo/client';
import {useHistory, useLocation} from 'react-router-dom';

import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import operations from './updateCartItem.gql';
import { REMOVE_ITEM_MUTATION, UPDATE_ITEM_MUTATION, UPDATE_ITEMS_MUTATION } from  '@magento/venia-ui/lib/components/LegacyMiniCart/cartOptions.gql';
import {MiniCartContext} from "@magenest/theme/Context/MiniCart/MiniCartContext";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import CryptoJS from "crypto-js";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 * @param {String} props.item.uid - uid of item
 * @param {String} props.item.name - name of item
 * @param {String} props.item.stock_status - stock status of item
 * @param {String} props.item.__typename - product type
 * @param {String} props.item.url_key - item url key
 * @param {String} props.item.sku - item sku
 *
 * @returns {
 *      handleAddToCart: Function,
 *      handleUpdateCartItem: Function,
 *      isDisabled: Boolean,
 *      isInStock: Boolean
 * }
 *
 */
const UNSUPPORTED_PRODUCT_TYPES = [
    'VirtualProduct',
    'BundleProduct',
    'GroupedProduct',
    'DownloadableProduct'
];

export const useUpdateCartItem = props => {
    const { item, urlSuffix, isSearchSuggestion = false, searchValue = null, dealProducts = [], giftProducts = [] } = props;

    const { miniCartProductList } = useContext(MiniCartContext);
    const [cartItemUid, setCartItemUid] = useState('');
    const [quantityInCart, setQuantityInCart] = useState(0);
    const [quantityUpdate, setQuantityUpdate] = useState(0);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [, { addToast }] = useToasts();
    const [, { dispatch }] = useEventingContext();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeName = store?.storeInformation?.name || '';
    const storeCode = store?.storeInformation?.source_code.replace('b2c_', '') || '';const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const searchQuery = query.get('query') || searchValue;

    const [isLoading, setIsLoading] = useState(false);

    const isInStock = item.stock_status === 'IN_STOCK';

    const productType = item
        ? item.__typename !== undefined
            ? item.__typename
            : item.type
        : null;

    const isUnsupportedProductType = UNSUPPORTED_PRODUCT_TYPES.includes(
        productType
    );

    const isDisabled = isLoading || !isInStock || isUnsupportedProductType;

    const history = useHistory();

    const [{ cartId }] = useCartContext();

    const [addToCart] = useMutation(operations.ADD_ITEM);
    const [addItemsToCart] = useMutation(operations.ADD_ITEMS);
    const [updateCartItem] = useMutation(UPDATE_ITEM_MUTATION);
    const [updateCartItems] = useMutation(UPDATE_ITEMS_MUTATION);

    const handleAddToCart = useCallback(async () => {
        try {
            if (productType === 'SimpleProduct' || productType === 'simple') {
                setIsLoading(true);

                const quantity = (item.mm_product_type && item.mm_product_type === 'F') ? 0.5 : 1;

                if (dealProducts.length || giftProducts.length) {
                    const removeProducts = [];
                    const shouldKeep = dp => {
                        const uid = dp.entered_options[0].uid;
                        const quantity = dp.quantity;
                        if (miniCartProductList[uid] && quantity === 0) {
                            removeProducts.push({
                                cart_item_uid: miniCartProductList[uid].cart_item_uid,
                                quantity: 0
                            });
                            return false;
                        } else if (!miniCartProductList[uid] && quantity > 0) {
                            return true;
                        }
                        return false;
                    }
                    const updatedDealProducts = [
                        ...(dealProducts || []).filter(shouldKeep),
                        ...(giftProducts || []).filter(shouldKeep),
                        {
                            quantity,
                            entered_options: [{
                                uid: item.uid,
                                value: item.name
                            }],
                            sku: item.sku
                        }
                    ]
                    if (removeProducts.length) {
                        updateCartItems({
                            variables: {
                                cartId,
                                cartItems: removeProducts
                            }
                        });
                    }
                    const result = await addItemsToCart({
                        variables: {
                            cartId,
                            cartItems: updatedDealProducts
                        }
                    });

                    dispatch({
                        type: 'CART_ADD_ITEM',
                        payload: {
                            cartId,
                            sku: item.sku,
                            name: item.name,
                            pricing: {
                                regularPrice: {
                                    amount:
                                    item.price_range.maximum_price.regular_price
                                }
                            },
                            priceTotal:
                            item.price_range.maximum_price.final_price.value,
                            currencyCode:
                            item.price_range.maximum_price.final_price.currency,
                            discountAmount:
                            item.price_range.maximum_price.discount.amount_off,
                            selectedOptions: null,
                            quantity
                        }
                    });
                    if (result) {
                        const errors = result?.data?.addProductsToCart?.user_errors || [];
                        const cart_subtotal = result?.data?.addProductsToCart?.cart?.prices?.subtotal_excluding_tax?.value || 0;
                        const cart_item_count = result?.data?.addProductsToCart?.cart?.total_quantity || 0;

                        errors && errors.map(error => (
                            addToast({
                                type: 'error',
                                icon: errorIcon,
                                message: error.message,
                                dismissable: true,
                                timeout: 7000
                            })
                        ))

                        try {
                            if (!miniCartProductList[item.uid]) {
                                ReactGA.event('add_to_cart', {
                                    category: "Ecommerce",
                                    label: "Add to Cart",
                                    store_id: storeCode,
                                    store_name: storeName,
                                    items: [
                                        {
                                            item_id: `${item.art_no}_${storeCode}`,
                                            item_name: item.name,
                                            price: item.price_range?.maximum_price?.final_price?.value || 0,
                                            quantity: !!miniCartProductList[item.uid] ? miniCartProductList[item.uid].quantity + quantity : quantityUpdate + quantity
                                        }
                                    ]
                                });
                            }

                            const productLink = resourceUrl(
                                `/${item.url_key}${urlSuffix || ''}`
                            );

                            const productItemsTrack = {
                                "type": "product", // Fixed Value
                                "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                "name": item.name,
                                "sku": item.sku, // ArtNo + "_" + Barcode
                                "page_url": `${window.location.origin}${productLink}`,
                                "image_url": item.small_image?.url || "",
                                "store_id": storeCode,
                                "store_name": storeName,
                                "price": item.price_range?.maximum_price?.final_price?.value || 0,
                                "original_price": item.price.regularPrice.amount.value > item.price_range.maximum_price.final_price.value ? item.price.regularPrice.amount.value : item.price_range.maximum_price.final_price.value,
                                "main_category": item.categories?.[0]?.name || "Unknown",
                                "brand": "NO BRAND"
                            };
                            if (item.categories?.[1]) {
                                productItemsTrack.category_level_1 = item.categories[1].name;
                            }
                            if (item.categories?.[2]) {
                                productItemsTrack.category_level_2 = item.categories[2].name;
                            }

                            const cartItemsTrack = {
                                ...productItemsTrack,
                                "quantity": quantity
                            };

                            if ((item?.tracking_click_url || item?.tracking_url) && productLink) {
                                let uri = item?.tracking_click_url || item?.tracking_url;
                                const prefix = 'https://a.cdp.asia/stream_event?';
                                if (uri?.startsWith(prefix)) uri = uri.slice(prefix.length);
                                window.web_event.trackEventWithUri(
                                    uri,
                                    productLink,
                                    '_self',
                                    {trackingOnly: true}
                                );
                            }

                            if (isSignedIn && currentUser) {
                                const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                                window.web_event.track("product", "add_to_cart", {
                                    items: [cartItemsTrack],
                                    dims: {
                                        customers: {
                                            "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                            "name": currentUser.firstname,
                                            "email": currentUser.email,
                                            "phone": customerPhoneNumber
                                        }
                                    },
                                    extra: {
                                        "event_source": "add_to_cart",
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count,
                                        ...(searchQuery && {
                                            "src_search_term": searchQuery,
                                            "location": `${isSearchSuggestion ? 'Auto Suggestion Panel' : 'Search Result Page'}`, // Auto Suggestion Panel/Search Result Page
                                            "atm_campaign": "ABC",
                                            "atm_term": "hop%20qua"
                                        })
                                    }
                                })
                            } else {
                                window.web_event.track("product", "add_to_cart", {
                                    items: [cartItemsTrack],
                                    extra: {
                                        "event_source": "add_to_cart",
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count,
                                        ...(searchQuery && {
                                            "src_search_term": searchQuery,
                                            "location": `${isSearchSuggestion ? 'Auto Suggestion Panel' : 'Search Result Page'}`, // Auto Suggestion Panel/Search Result Page
                                            "atm_campaign": "ABC",
                                            "atm_term": "hop%20qua"
                                        })
                                    }
                                })
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } else {
                    const result = await addToCart({
                        variables: {
                            cartId,
                            cartItem: {
                                quantity,
                                entered_options: [
                                    {
                                        uid: item.uid,
                                        value: item.name
                                    }
                                ],
                                sku: item.sku
                            }
                        }
                    });

                    dispatch({
                        type: 'CART_ADD_ITEM',
                        payload: {
                            cartId,
                            sku: item.sku,
                            name: item.name,
                            pricing: {
                                regularPrice: {
                                    amount:
                                    item.price_range.maximum_price.regular_price
                                }
                            },
                            priceTotal: item.price_range.maximum_price.final_price.value,
                            currencyCode: item.price_range.maximum_price.final_price.currency,
                            discountAmount: item.price_range.maximum_price.discount.amount_off,
                            selectedOptions: null,
                            quantity
                        }
                    });

                    if (result) {
                        const errors = result?.data?.addProductsToCart?.user_errors || [];
                        const cart_subtotal = result?.data?.addProductsToCart?.cart?.prices?.subtotal_excluding_tax?.value || 0;
                        const cart_item_count = result?.data?.addProductsToCart?.cart?.total_quantity || 0;

                        errors && errors.map(error => (
                            addToast({
                                type: 'error',
                                icon: errorIcon,
                                message: error.message,
                                dismissable: true,
                                timeout: 7000
                            })
                        ))

                        try {
                            if (!miniCartProductList[item.uid]) {
                                ReactGA.event('add_to_cart', {
                                    category: "Ecommerce",
                                    label: "Add to Cart",
                                    store_id: storeCode,
                                    store_name: storeName,
                                    items: [
                                        {
                                            item_id: `${item.art_no}_${storeCode}`,
                                            item_name: item.name,
                                            price: item.price_range?.maximum_price?.final_price?.value || 0,
                                            quantity: !!miniCartProductList[item.uid] ? miniCartProductList[item.uid].quantity + quantity : quantityUpdate + quantity
                                        }
                                    ]
                                });
                            }

                            const productLink = resourceUrl(
                                `/${item.url_key}${urlSuffix || ''}`
                            );

                            const productItemsTrack = {
                                "type": "product", // Fixed Value
                                "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                "name": item.name,
                                "sku": item.sku, // ArtNo + "_" + Barcode
                                "page_url": `${window.location.origin}${productLink}`,
                                "image_url": item.small_image?.url || "",
                                "store_id": storeCode,
                                "store_name": storeName,
                                "price": item.price_range?.maximum_price?.final_price?.value || 0,
                                "original_price": item.price.regularPrice.amount.value > item.price_range.maximum_price.final_price.value ? item.price.regularPrice.amount.value : item.price_range.maximum_price.final_price.value,
                                "main_category": item.categories?.[0]?.name || "Unknown",
                                "brand": "NO BRAND"
                            };
                            if (item.categories?.[1]) {
                                productItemsTrack.category_level_1 = item.categories[1].name;
                            }
                            if (item.categories?.[2]) {
                                productItemsTrack.category_level_2 = item.categories[2].name;
                            }

                            const cartItemsTrack = {
                                ...productItemsTrack,
                                "quantity": quantity
                            };

                            if ((item?.tracking_click_url || item?.tracking_url) && productLink) {
                                let uri = item?.tracking_click_url || item?.tracking_url;
                                const prefix = 'https://a.cdp.asia/stream_event?';
                                if (uri?.startsWith(prefix)) uri = uri.slice(prefix.length);
                                window.web_event.trackEventWithUri(
                                    uri,
                                    productLink,
                                    '_self',
                                    {trackingOnly: true}
                                );
                            }

                            if (isSignedIn && currentUser) {
                                const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                                window.web_event.track("product", "add_to_cart", {
                                    items: [cartItemsTrack],
                                    dims: {
                                        customers: {
                                            "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                            "name": currentUser.firstname,
                                            "email": currentUser.email,
                                            "phone": customerPhoneNumber
                                        }
                                    },
                                    extra: {
                                        "event_source": "add_to_cart",
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count,
                                        ...(searchQuery && {
                                            "src_search_term": searchQuery,
                                            "location": `${isSearchSuggestion ? 'Auto Suggestion Panel' : 'Search Result Page'}`, // Auto Suggestion Panel/Search Result Page
                                            "atm_campaign": "ABC",
                                            "atm_term": "hop%20qua"
                                        })
                                    }
                                })
                            } else {
                                window.web_event.track("product", "add_to_cart", {
                                    items: [cartItemsTrack],
                                    extra: {
                                        "event_source": "add_to_cart",
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count,
                                        ...(searchQuery && {
                                            "src_search_term": searchQuery,
                                            "location": `${isSearchSuggestion ? 'Auto Suggestion Panel' : 'Search Result Page'}`, // Auto Suggestion Panel/Search Result Page
                                            "atm_campaign": "ABC",
                                            "atm_term": "hop%20qua"
                                        })
                                    }
                                })
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }

                setIsLoading(false);
            } else if (
                productType === 'ConfigurableProduct' ||
                productType === 'configurable'
            ) {
                const productLink = resourceUrl(
                    `/${item.url_key}${urlSuffix || ''}`
                );

                history.push(productLink);
            } else {
                console.warn('Unsupported product type unable to handle.');
            }
        } catch (error) {
            setIsLoading(false);
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            })
        }
    }, [productType, addToCart, addItemsToCart, cartId, item, dispatch, history, urlSuffix, miniCartProductList, searchQuery, isSearchSuggestion, dealProducts, giftProducts]);

    const handleUpdateCartItem = useCallback(async (cartItemUid, newQuantity) => {
        try {
            if (productType === 'SimpleProduct' || productType === 'simple') {
                setIsLoading(true);

                const result = await updateCartItem({
                    variables: {
                        "cartId": cartId,
                        "itemId": cartItemUid,
                        "quantity": newQuantity
                    }
                });

                if (result) {
                    try {
                        const cart_subtotal = result?.data?.updateCartItems?.cart?.prices?.subtotal_excluding_tax?.value || 0;
                        const cart_item_count = result?.data?.updateCartItems?.cart?.total_quantity || 0;

                        if (Number(newQuantity) <= Number(miniCartProductList[item.uid].quantity)) {
                            if (newQuantity === 0) {
                                const selectedOptionsLabels =
                                    item.configurable_options?.map(
                                        ({ option_label, value_label }) => ({
                                            attribute: option_label,
                                            value: value_label
                                        })
                                    ) || null;
                                dispatch({
                                    type: 'CART_REMOVE_ITEM',
                                    payload: {
                                        cartId,
                                        sku: item.sku,
                                        name: item.name,
                                        selectedOptions: selectedOptionsLabels,
                                        quantity: miniCartProductList[item.uid].quantity
                                    }
                                });
                            }

                            ReactGA.event('remove_from_cart', {
                                category: "Ecommerce",
                                label: "Remove from Cart",
                                store_id: storeCode,
                                store_name: storeName,
                                items: [
                                    {
                                        item_id: `${item.art_no}_${storeCode}`,
                                        item_name: item.name,
                                        price: item.price_range?.maximum_price?.final_price?.value || 0,
                                        quantity: miniCartProductList[item.uid].quantity - newQuantity
                                    }
                                ]
                            });

                            if (isSignedIn && currentUser) {
                                const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;
                                window.web_event.track("product", "remove_cart", {
                                    items: [
                                        {
                                            "type": "product",
                                            "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                            "quantity": miniCartProductList[item.uid].quantity - newQuantity,
                                            "name": item.name
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
                                            "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                            "quantity": miniCartProductList[item.uid].quantity - newQuantity,
                                            "name": item.name
                                        }
                                    ],
                                    extra: {
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count
                                    }
                                })
                            }
                        } else {
                            if (!miniCartProductList[item.uid]) {
                                ReactGA.event('add_to_cart', {
                                    category: "Ecommerce",
                                    label: "Add to Cart",
                                    store_id: storeCode,
                                    store_name: storeName,
                                    items: [
                                        {
                                            item_id: `${item.art_no}_${storeCode}`,
                                            item_name: item.name,
                                            price: item.price_range?.maximum_price?.final_price?.value || 0,
                                            quantity: newQuantity - miniCartProductList[item.uid].quantity
                                        }
                                    ]
                                });
                            }

                            const productLink = resourceUrl(
                                `/${item.url_key}${urlSuffix || ''}`
                            );

                            const productItemsTrack = {
                                "type": "product", // Fixed Value
                                "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                "name": item.name,
                                "sku": item.sku, // ArtNo + "_" + Barcode
                                "page_url": `${window.location.origin}${productLink}`,
                                "image_url": item.small_image?.url || "",
                                "store_id": storeCode,
                                "store_name": storeName,
                                "price": item.price_range?.maximum_price?.final_price?.value || 0,
                                "original_price": item.price.regularPrice.amount.value > item.price_range.maximum_price.final_price.value ? item.price.regularPrice.amount.value : item.price_range.maximum_price.final_price.value,
                                "main_category": item.categories?.[0]?.name || "Unknown",
                                "brand": "NO BRAND",
                                "quantity": newQuantity - miniCartProductList[item.uid].quantity
                            };
                            if (item.categories?.[1]) {
                                productItemsTrack.category_level_1 = item.categories[1].name;
                            }

                            if (item.categories?.[2]) {
                                productItemsTrack.category_level_2 = item.categories[2].name;
                            }

                            if (isSignedIn && currentUser) {
                                const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                                window.web_event.track("product", "add_to_cart", {
                                    items: [productItemsTrack],
                                    dims: {
                                        customers: {
                                            "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                            "name": currentUser.firstname,
                                            "email": currentUser.email,
                                            "phone": customerPhoneNumber
                                        }
                                    },
                                    extra: {
                                        "event_source": "add_to_cart",
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count
                                    }
                                })
                            } else {
                                window.web_event.track("product", "add_to_cart", {
                                    items: [productItemsTrack],
                                    extra: {
                                        "event_source": "add_to_cart",
                                        "cart_subtotal": cart_subtotal,
                                        "cart_item_count": cart_item_count
                                    }
                                })
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                setIsLoading(false);
            } else if (
                productType === 'ConfigurableProduct' ||
                productType === 'configurable'
            ) {
                const productLink = resourceUrl(
                    `/${item.url_key}${urlSuffix || ''}`
                );

                history.push(productLink);
            } else {
                console.warn('Unsupported product type unable to handle.');
            }
        } catch (error) {
            setQuantityUpdate(!!miniCartProductList[item.uid] ? miniCartProductList[item.uid].quantity : quantityUpdate);
            setIsLoading(false);
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            })
        }
    }, [productType, updateCartItem, cartId, item, dispatch, history, urlSuffix, miniCartProductList, currentUser, isSignedIn, quantityUpdate]);

    useEffect(() => {
        setCartItemUid(!!miniCartProductList[item.uid] ? miniCartProductList[item.uid].cart_item_uid : '');
        setQuantityInCart(!!miniCartProductList[item.uid] ? miniCartProductList[item.uid].quantity : 0);
        setQuantityUpdate(!!miniCartProductList[item.uid] ? miniCartProductList[item.uid].quantity : 0);
    }, [miniCartProductList]);

    const handleBlur = useCallback(async (event) => {
        let value = Number(event.target.value);
        if (value === 0) {
            setQuantityUpdate(0);
        } else {
            value = parseInt(event.target.value, 10);
            if (item.mm_product_type && item.mm_product_type === 'F') {
                value = parseFloat(event.target.value);
                if (value % 1 === 0) {
                    value = parseInt(value, 10);
                } else {
                    value = Math.round(value * 2) / 2;
                }
                if (isNaN(value) || value <= 0) value = 0.5;
            }
            if (isNaN(value) || value <= 0) value = 1;
            setQuantityUpdate(value.toString());
        }

        setIsInputFocused(false);

        try {
            await handleUpdateCartItem(cartItemUid, value);
        } catch (error) {
            console.error(error);
        }
    }, [quantityUpdate, cartItemUid, handleUpdateCartItem]);

    const handleKeyPress = useCallback(async (event) => {
        let value = Number(event.target.value);
        if (value === 0) {
            setQuantityUpdate(0);
        } else {
            value = parseInt(event.target.value, 10);
            if (item.mm_product_type && item.mm_product_type === 'F') {
                value = parseFloat(event.target.value);
                if (value % 1 === 0) {
                    value = parseInt(value, 10);
                } else {
                    value = Math.round(value * 2) / 2;
                }
                if (isNaN(value) || value <= 0) value = 0.5;
            }
            if (isNaN(value) || value <= 0) value = 1;
            setQuantityUpdate(value.toString());
        }

        if (event.key === 'Enter') {
            try {
                await handleUpdateCartItem(cartItemUid, value);
            } catch (error) {
                console.error(error);
            }
        }
    }, [quantityUpdate, cartItemUid, handleUpdateCartItem]);

    return {
        handleAddToCart,
        handleUpdateCartItem,
        isDisabled,
        isInStock,
        handleBlur,
        handleKeyPress,
        quantityInCart,
        isInputFocused,
        cartItemUid,
        quantityUpdate,
        setIsInputFocused
    };
};
