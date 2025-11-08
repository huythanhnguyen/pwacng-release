import React, {useState, useCallback, useMemo, useEffect, useRef, useContext} from 'react';
import { useMutation, useQuery } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import DEFAULT_OPERATIONS from './createWishlist.gql';
import WISHLIST_PAGE_OPERATIONS from './wishlistPage.gql';
import {ADD_TO_WISHLIST, GET_WISHLISTS} from '../Wishlist/WishlistDialog/wishlistDialog.gql';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon,
    Check
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const CheckIcon = <Icon size={20} src={Check} />;
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useIntl} from "react-intl";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
import {WishlistContext} from "../../../@theme/Context/Wishlist/wishlistContext";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 * @function
 * @param {number} props.numberOfWishlists - The current number of wishlists created
 *
 * @returns {CreateWishListProps}
 */
export const useCreateWishlist = props => {
    const {
        setIsHideAddWishlist,
        handleHideAddWishlist,
        itemOptions
    } = props;
    const [, { addToast }] = useToasts();
    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const [ showCreateWishlist, setShowCreateWishlist ] = useState(false);
    const [ showModalWarning, setShowModalWarning ] = useState(false);
    const [ wishlistName, setWishlistName ] = useState('');
    const [{ isSignedIn }] = useUserContext();
    const operations = mergeOperations(
        DEFAULT_OPERATIONS,
        WISHLIST_PAGE_OPERATIONS
    );
    const { wishlistProducts, setWishlistProducts } = useContext(WishlistContext);
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';

    const {
        createWishlistMutation,
        getCustomerWishlistQuery,
        getStoreConfig
    } = operations;

    const [
        createWishlist,
        { error: createWishlistError, loading, called }
    ] = useMutation(createWishlistMutation);

    const { data: storeConfigData, loading: storeConfigLoading, error: storeConfigError } = useQuery(getStoreConfig)

    const { data: wishlists } = useQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const { data: wishlistsData } = useQuery(GET_WISHLISTS, {
        fetchPolicy: 'cache-and-network'
    });
    const [
        addProductToWishlist,
        { loading: isAddLoading, error: addProductError }
    ] = useMutation(ADD_TO_WISHLIST, {
        refetchQueries: [{ query: GET_WISHLISTS }],
        skip: !itemOptions
    });

    const handleShowModal = useCallback(() => {
        if (setIsHideAddWishlist) {
            setIsHideAddWishlist(true);
        }

        if (wishlists?.customer?.wishlists.length >= Number(storeConfigData?.storeConfig?.wishlist_limit || 0)) {
            setShowModalWarning(true);
        } else {
            setShowCreateWishlist(true);
        }
    }, [setShowModalWarning, wishlists, storeConfigData, setShowCreateWishlist, setIsHideAddWishlist]);

    const handleCloseMaximumModal = useCallback(() => {
        setShowModalWarning(false);

        if (setIsHideAddWishlist) {
            setIsHideAddWishlist(false);
        }

        if (handleHideAddWishlist) {
            handleHideAddWishlist();
        }
    }, [setShowModalWarning, setIsHideAddWishlist, handleHideAddWishlist])

    const handleHideModal = useCallback(() => {
        setShowCreateWishlist(false);

        // if (setIsHideAddWishlist) {
        //     setIsHideAddWishlist(false);
        // }
        //
        // if (handleHideAddWishlist) {
        //     handleHideAddWishlist();
        // }

    }, [setIsHideAddWishlist, handleHideAddWishlist, setShowCreateWishlist]);

    const handleCreateList = useCallback(
        async e => {
            e.preventDefault();
            if (!wishlistName) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'global.createWishlistMessageRequire',
                        defaultMessage: `Please enter the name of your favorite list.`
                    }),
                    dismissable: true,
                    timeout: 7000
                });

                return;
            }

            try {
                const result = await createWishlist({
                    variables: {
                        input: {
                            name: wishlistName
                        }
                    },
                    refetchQueries: [{ query: getCustomerWishlistQuery }],
                    awaitRefetchQueries: true
                });

                addToast({
                    type: 'success',
                    icon: CheckIcon,
                    message: `${wishlistName} ${
                        formatMessage({
                            id: 'global.createWishlistSuccess',
                            defaultMessage: ' has been created successfully',
                        })
                    }`,
                    dismissable: true,
                    timeout: 7000
                });
                setWishlistName('');
                formApiRef.current.reset();
                setShowCreateWishlist(false);

                if (setIsHideAddWishlist) {
                    setIsHideAddWishlist(false);
                }

                if (handleHideAddWishlist) {
                    handleHideAddWishlist();
                }

                if (result?.data?.createWishlist?.wishlist?.wishlist_id && itemOptions?.sku) {
                    try {
                        const {data} = await addProductToWishlist({
                            variables: {
                                wishlistId: result.data.createWishlist.wishlist.wishlist_id,
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
                                        wishlistName: data.addProductsToWishlist?.wishlist?.name || ''
                                    }
                                ),
                                timeout: 7000
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
                                    }
                                })
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    if (setIsHideAddWishlist) {
                        setIsHideAddWishlist(false);
                    }

                    if (handleHideAddWishlist) {
                        handleHideAddWishlist();
                    }
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
            }
        },
        [createWishlist, setShowCreateWishlist, getCustomerWishlistQuery, formApiRef, wishlistName, setIsHideAddWishlist, handleHideAddWishlist, itemOptions]
    );

    return {
        formErrors: [createWishlistError],
        handleCreateList,
        handleHideModal,
        handleShowModal,
        loading: loading && called,
        showCreateWishlist,
        setFormApi,
        showModalWarning,
        handleCloseMaximumModal,
        setWishlistName
    };
};

/**
 * JSDoc type definitions
 */

/**
 * Props data to use when rendering the Create Wishlist component.
 *
 * @typedef {Object} CreateWishListProps
 *
 * @property {Function} handleCreateList Callback to be called while creating new list
 * @property {Function} handleHideModal Callback to hide the create modal by modifying the value of isModalOpen
 * @property {Function} handleShowModal Callback to show the create modal by modifying the value of isModalOpen
 * @property {Boolean} isModalOpen Boolean which represents if the create modal is open or not
 */
