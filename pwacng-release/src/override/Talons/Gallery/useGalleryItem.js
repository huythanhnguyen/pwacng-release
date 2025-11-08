import { isSupportedProductType as isSupported } from '@magento/peregrine/lib/talons/Gallery/isSupportedProductType';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import { useCallback, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '@magento/peregrine/lib/hooks/useIntersectionObserver';
import CryptoJS from "crypto-js";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useLocation} from "react-router-dom";

export const useGalleryItem = (props = {}) => {
    const [, { dispatch }] = useEventingContext();
    const intersectionObserver = useIntersectionObserver();
    const { item, storeConfig } = props;
    const productUrlSuffix = storeConfig && storeConfig.product_url_suffix;
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeCode = store?.storeInformation?.source_code?.replace('b2c_', '') || '';
    const storeName = store?.storeInformation?.name || '';
    const [{ isSignedIn, currentUser }] = useUserContext();
    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const searchValue = query.get('query');

    const finalPrice = item?.price_range?.maximum_price?.final_price?.value;
    const discountAmount =
        item?.price_range?.maximum_price?.discount?.amount_off;
    const currencyCode =
        item?.price_range?.maximum_price?.final_price?.currency;
    const regularPrice = item?.price_range?.maximum_price?.regular_price?.value;

    const productLink = resourceUrl(`/${item.url_key}${productUrlSuffix || ''}`);

    const handleLinkClick = useCallback((productLink = null) => {
        try {
            if (searchValue) {
                const productItemsTrack = {
                    "type": "product", // Fixed Value
                    "id": `${item.art_no}_${storeCode}`, // ArtNo + "_" + StoreCode
                    "name": item.name,
                    "sku": item.sku, // ArtNo + "_" + Barcode
                    "page_url": `${window.location.origin}${productLink}`,
                    "image_url": item.small_image,
                    "store_id": storeCode,
                    "store_name": storeName,
                    "price": finalPrice,
                    "original_price": regularPrice,
                    "main_category": `${item?.categories?.[0]?.name || "Unknown"}`,
                    "brand": "NO BRAND"
                };

                if (item?.categories?.[1]) {
                    productItemsTrack.category_level_1 = item.categories[1].name;
                }
                if (item?.categories?.[2]) {
                    productItemsTrack.category_level_2 = item.categories[2].name;
                }

                if (isSignedIn && currentUser) {
                    const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || '';

                    window.web_event.track("product", "click", {
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
                            "src_search_term": searchValue,
                            "location": "Search Result Page" // Auto Suggestion Panel/Search Result Page
                        }
                    })
                } else {
                    window.web_event.track("product", "view", {
                        items: [productItemsTrack],
                        extra: {
                            "src_search_term": searchValue,
                            "location": "Search Result Page" // Auto Suggestion Panel/Search Result Page
                        }
                    })
                }
            }

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
        } catch (error) {
            console.log(error);
        }

        dispatch({
            type: 'PRODUCT_CLICK',
            payload: {
                name: item.name,
                sku: item.sku,
                priceTotal: finalPrice,
                discountAmount,
                currencyCode,
                selectedOptions: null
            }
        });
    }, [currencyCode, discountAmount, dispatch, finalPrice, item, searchValue, isSignedIn, currentUser]);

    const itemRef = useRef(null);
    const contextRef = useRef({
        dispatched: false,
        timeOutId: null
    });
    useEffect(() => {
        if (
            typeof intersectionObserver === 'undefined' ||
            !item ||
            contextRef.current.dispatched
        ) {
            return;
        }
        const htmlElement = itemRef.current;
        const onIntersection = entries => {
            if (entries[0].isIntersecting) {
                contextRef.current.timeOutId = setTimeout(() => {
                    observer.unobserve(htmlElement);
                    dispatch({
                        type: 'PRODUCT_IMPRESSION',
                        payload: {
                            name: item.name,
                            sku: item.sku,
                            priceTotal: finalPrice,
                            discountAmount,
                            currencyCode,
                            selectedOptions: null
                        }
                    });
                    contextRef.current.dispatched = true;
                }, 500);
            } else {
                clearTimeout(contextRef.current.timeOutId);
            }
        };
        const observer = new intersectionObserver(onIntersection, {
            threshold: 0.9
        });
        observer.observe(htmlElement);
        return () => {
            if (htmlElement) {
                observer.unobserve(htmlElement);
            }
        };
    }, [
        currencyCode,
        discountAmount,
        dispatch,
        finalPrice,
        intersectionObserver,
        item
    ]);

    const productType = item
        ? item.__typename !== undefined
            ? item.__typename
            : item.type
        : null;
    const isSupportedProductType = isSupported(productType);

    const wishlistButtonProps =
        storeConfig && storeConfig.magento_wishlist_general_is_enabled === '1'
            ? {
                item: {
                    art_no: item.art_no,
                    name: item.name,
                    price: item.price_range,
                    image: item.small_image,
                    sku: item.sku,
                    url: item.url_key,
                    quantity: 1,
                    url_suffix: productUrlSuffix
                },
                storeConfig
            }
            : null;

    return {
        ...props,
        itemRef,
        handleLinkClick,
        wishlistButtonProps,
        isSupportedProductType,
        productLink
    };
};
