import { useCallback, useMemo, useEffect } from 'react';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import CryptoJS from "crypto-js";
import {useUserContext} from "@magento/peregrine/lib/context/user";

/**
 * Return props necessary to render a SuggestedProduct component.
 *
 * @param {Object} props
 * @param {Object} props.price_range - price range
 * @param {String} props.url_key - url key
 * @param {String} props.url_suffix - url suffix
 * @param {String} props.sku - product sky
 * @param {Function} props.onNavigate - callback to fire on link click
 */
export const useSuggestedProduct = props => {
    const [, { dispatch }] = useEventingContext();
    const {
        name,
        ecom_name,
        price,
        price_range,
        onNavigate,
        url_key,
        url_suffix,
        sku,
        product,
        small_image,
        art_no,
        canonical_url,
        categories,
        searchValue
    } = props;

    const finalPrice = price_range?.maximum_price?.final_price?.value;
    const regularPrice = price_range?.maximum_price?.regular_price?.value;
    const discountAmount = price_range?.maximum_price?.discount?.amount_off;
    const currencyCode = price_range?.maximum_price?.final_price?.currency;
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeCode = store.storeInformation.source_code.replace('b2c_', '');
    const storeName = store.storeInformation.name;
    const [{ isSignedIn, currentUser }] = useUserContext();

    const uri = useMemo(() => resourceUrl(`/${canonical_url}`), [
        canonical_url
    ]);

    const handleClick = useCallback(() => {
        try {
            const productItemsTrack = {
                "type": "product", // Fixed Value
                "id": `${art_no}_${storeCode}`, // ArtNo + "_" + StoreCode
                "name": name,
                "sku": sku, // ArtNo + "_" + Barcode
                "page_url": `${window.location.origin}${uri}`,
                "image_url": small_image,
                "store_id": storeCode,
                "store_name": storeName,
                "price": finalPrice,
                "original_price": regularPrice,
                "main_category": `${categories?.[0]?.name || "Unknown"}`,
                "brand": "NO BRAND"
            };
            if (categories?.[1]) {
                productItemsTrack.category_level_1 = categories[1].name;
            }
            if (categories?.[2]) {
                productItemsTrack.category_level_2 = categories[2].name;
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
                        "location": "Auto Suggestion Panel" // Auto Suggestion Panel/Search Result Page
                    }
                })
            } else {
                window.web_event.track("product", "view", {
                    items: [productItemsTrack],
                    extra: {
                        "src_search_term": searchValue,
                        "location": "Auto Suggestion Panel" // Auto Suggestion Panel/Search Result Page
                    }
                })
            }
        } catch (error) {
            console.log(error);
        }

        dispatch({
            type: 'PRODUCT_CLICK',
            payload: {
                name: name || ecom_name,
                sku,
                priceTotal: finalPrice,
                discountAmount,
                currencyCode,
                selectedOptions: null
            }
        });
        if (typeof onNavigate === 'function') {
            onNavigate();
        }
    }, [
        name,
        ecom_name,
        currencyCode,
        discountAmount,
        dispatch,
        onNavigate,
        art_no,
        storeCode,
        name,
        sku,
        uri,
        small_image,
        storeName,
        finalPrice,
        regularPrice,
        categories,
        isSignedIn,
        currentUser,
        searchValue
    ]);

    const addToWishlistProps = {
        item: {
            art_no: art_no,
            quantity: 1,
            selected_options: product.configurable_options
                ? product.configurable_options.map(
                    option => option.configurable_product_option_value_uid
                )
                : [],
            sku: sku,
            name: ecom_name || name,
            price: price_range,
            image: small_image,
            url: url_key,
            url_suffix: url_suffix
        }
    };

    useEffect(() => {
        if (sku !== null) {
            dispatch({
                type: 'PRODUCT_IMPRESSION',
                payload: {
                    name: ecom_name || name,
                    sku,
                    priceTotal: finalPrice,
                    discountAmount,
                    currencyCode,
                    selectedOptions: null
                }
            });
        }
    }, [name, ecom_name, currencyCode, discountAmount, dispatch, finalPrice, sku]);

    // fall back to deprecated field if price range is unavailable
    const priceProps = useMemo(() => {
        return {
            currencyCode:
                price_range?.maximum_price?.final_price?.currency ||
                price.regularPrice.amount.currency,
            value:
                price_range?.maximum_price?.final_price?.value ||
                price.regularPrice.amount.value
        };
    }, [
        price.regularPrice.amount.currency,
        price.regularPrice.amount.value,
        price_range?.maximum_price?.final_price?.currency,
        price_range?.maximum_price?.final_price?.value
    ]);

    const regularPriceProps = useMemo(() => {
        return {
            currencyCode:
                price?.regularPrice?.amount?.currency,
            value:
            price?.regularPrice?.amount?.value
        };
    }, [
        price.regularPrice.amount.currency,
        price.regularPrice.amount.value
    ]);

    return {
        priceProps,
        handleClick,
        uri,
        regularPriceProps,
        addToWishlistProps
    };
};
