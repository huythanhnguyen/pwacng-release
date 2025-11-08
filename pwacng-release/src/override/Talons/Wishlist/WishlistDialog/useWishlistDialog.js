import React, {useCallback, useContext, useState} from 'react';
import { useQuery, useMutation } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import DEFAULT_OPERATIONS from './wishlistDialog.gql';
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon,
    Check
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useIntl} from "react-intl";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
const CheckIcon = <Icon size={20} src={Check} />;
import ReactGA from "react-ga4";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import CryptoJS from "crypto-js";
import {WishlistContext} from "@magenest/theme/Context/Wishlist/wishlistContext";

export const useWishlistDialog = props => {
    const { isLoading, itemOptions, onClose, onSuccess, setIsModalOpen, isSearchSuggestion, searchValue } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { wishlistProducts, setWishlistProducts } = useContext(WishlistContext);
    const [wishlistSelected, setWishlistSelected] = useState(0);
    const [ isHideAddWishlist, setIsHideAddWishlist ] = useState(false);
    const storage = new BrowserPersistence();
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';

    const { search } = location;
    const query = new URLSearchParams(search);
    const searchQuery = query.get('query') || searchValue;

    const { formatMessage } = useIntl();
    const { data: wishlistsData } = useQuery(operations.getWishlistsQuery, {
        fetchPolicy: 'cache-and-network'
    });
    const [, { addToast }] = useToasts();
    const [
        addProductToWishlist,
        { loading: isAddLoading, error: addProductError }
    ] = useMutation(operations.addProductToWishlistMutation, {
        refetchQueries: [{ query: operations.getWishlistsQuery }]
    });

    const handleAddToWishlist = useCallback(
        async e => {
            e.preventDefault();

            if (!wishlistSelected) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'global.addWishlistMessageRequire',
                        defaultMessage: `Please select your wishlist.`
                    }),
                    dismissable: true,
                    timeout: 7000
                });

                return;
            }

            try {
                const { data } = await addProductToWishlist({
                    variables: {
                        wishlistId: wishlistSelected,
                        itemOptions: {
                            sku: itemOptions.sku,
                            quantity: 1
                        }
                    }
                });

                if (data) {

                    setWishlistProducts([...wishlistProducts, itemOptions.sku])

                    addToast({
                        type: 'success',
                        icon: CheckIcon,
                        message: formatMessage(
                            {
                                id: 'wishlist.galleryButton.successMessageNamed',
                                defaultMessage:
                                    'Item successfully added to the "{wishlistName}" list.'
                            },
                            {
                                wishlistName: data.addProductsToWishlist.wishlist.name
                            }
                        ),
                        timeout: 5000
                    })

                    try {
                        ReactGA.event('add_to_wishlist', {
                            category: 'Ecommerce',
                            label: itemOptions.sku,
                            store_id: storeCode,
                            store_name: storeName,
                            items: [
                                {
                                    item_id: `${itemOptions.art_no}_${storeCode}`,
                                    item_name: itemOptions.name,
                                    price: itemOptions.price?.maximum_price?.final_price?.value || 0
                                }
                            ]
                        });


                        const customerPhoneNumber = wishlistsData?.customer.custom_attributes.find(item => item.code === 'company_user_phone_number').value || 0;
                        const customerEmail = wishlistsData?.customer.email || '';
                        const customerName = wishlistsData?.customer.firstname || '';

                        window.web_event.track("product", "add_wish_list", {
                            items: [
                                {
                                    "type": "product", // Fixed Value
                                    "id": `${itemOptions.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                    "name": itemOptions.name,
                                    "sku": itemOptions.sku, // ArtNo + "_" + Barcode
                                    "page_url": `${window.location.origin}/${itemOptions.url}${itemOptions.url_suffix}`,
                                    "image_url": itemOptions.image.url,
                                    "store_id": storeCode,
                                    "store_name": storeName,
                                    "price": itemOptions.price.maximum_price.final_price.value,
                                    "original_price": itemOptions.price?.maximum_price?.final_price?.value || 0,
                                    "main_category": null,
                                    "category_level_1": null, // optional (remove if not existed)
                                    "category_level_2": null, // optional
                                    "brand": "NO BRAND"
                                }
                            ],
                            dims: {
                                customers: {
                                    "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                    "name": customerName,
                                    "phone": customerPhoneNumber,
                                    "email": customerEmail,
                                }
                            },
                            ...(searchQuery && {
                                extra: {
                                    "src_search_term": searchQuery,
                                    "location": `${isSearchSuggestion ? 'Auto Suggestion Panel' : 'Search Result Page'}`, // Auto Suggestion Panel/Search Result Page
                                    "atm_campaign": "ABC",
                                    "atm_term": "hop%20qua"
                                }
                            })

                        })
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (onSuccess) {
                    await onSuccess(data);
                }

                if (onClose) {
                    onClose(true, {
                        wishlistName: data.addProductsToWishlist.wishlist.name
                    });
                }
            } catch (err) {
                console.error(err);
            }
        },
        [addProductToWishlist, itemOptions, onClose, onSuccess, wishlistSelected, isSearchSuggestion, searchQuery]
    );

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    return {
        formErrors: [addProductError],
        handleAddToWishlist,
        handleCancel,
        isLoading: isLoading || isAddLoading,
        wishlistsData,
        setWishlistSelected,
        wishlistSelected,
        setIsHideAddWishlist,
        isHideAddWishlist
    };
};
