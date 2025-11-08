import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import configuredVariant from '@magento/peregrine/lib/util/configuredVariant';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CartPage/ProductListing/product.gql';
import COMMENT_OPERATIONS from '../commentProduct.gql';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import {useToasts} from "@magento/peregrine";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import CryptoJS from "crypto-js";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {MiniCartContext} from "../../../../@theme/Context/MiniCart/MiniCartContext";
import ReactGA from "react-ga4";

/**
 * This talon contains logic for a product component used in a product listing component.
 * It performs effects and returns prop data for that component.
 *
 * This talon performs the following effects:
 *
 * - Manage the updating state of the cart while a product is being updated or removed
 *
 * @function
 *
 * @param {Object} props
 * @param {ProductItem} props.item Product item data
 * @param {ProductMutations} props.operations GraphQL mutations for a product in a cart
 * @param {function} props.setActiveEditItem Function for setting the actively editing item
 * @param {function} props.setIsCartUpdating Function for setting the updating state of the cart
 *
 * @return {ProductTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useProduct } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useProduct';
 */

export const useProduct = props => {
    const {
        item,
        setIsCartUpdating
    } = props;

    const [, { addToast }] = useToasts();
    const [ isNote, setIsNote ] = useState(false);
    const [, { dispatch }] = useEventingContext();
    const [ isShowFormComment, setIsShowFormComment ] = useState(false);
    const storage = new BrowserPersistence();
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const [{ isSignedIn, currentUser }] = useUserContext();
    const { miniCartInfo } = useContext(MiniCartContext);

    const operations = mergeOperations(DEFAULT_OPERATIONS, COMMENT_OPERATIONS, props.operations);
    const {
        removeItemMutation,
        updateItemQuantityMutation,
        getStoreConfigQuery,
        updateCommentOnCartItem,
        removeCommentOnCartItem
    } = operations;

    const { formatMessage } = useIntl();

    const { data: storeConfigData } = useQuery(getStoreConfigQuery, {
        fetchPolicy: 'cache-and-network'
    });

    const [fetchUpdateComment, { loading }] = useMutation(updateCommentOnCartItem);
    const [fetchRemoveComment, { loading: removeCommentLoading }] = useMutation(removeCommentOnCartItem);

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

    const flatProduct = flattenProduct(
        item,
        configurableThumbnailSource,
        storeUrlSuffix
    );

    const [
        removeItemFromCart,
        {
            called: removeItemCalled,
            error: removeItemError,
            loading: removeItemLoading
        }
    ] = useMutation(removeItemMutation);

    const [
        updateItemQuantity,
        {
            loading: updateItemLoading,
            error: updateError,
            called: updateItemCalled
        }
    ] = useMutation(updateItemQuantityMutation);

    const [{ cartId }] = useCartContext();

    // Use local state to determine whether to display errors or not.
    // Could be replaced by a "reset mutation" function from apollo client.
    // https://github.com/apollographql/apollo-feature-requests/issues/170
    const [displayError, setDisplayError] = useState(false);

    const isProductUpdating = useMemo(() => {
        if (updateItemCalled || removeItemCalled) {
            return removeItemLoading || updateItemLoading;
        } else {
            return false;
        }
    }, [
        updateItemCalled,
        removeItemCalled,
        removeItemLoading,
        updateItemLoading
    ]);

    useEffect(() => {
        if (item.errors) {
            setDisplayError(true);
        }
    }, [item.errors]);

    const derivedErrorMessage = useMemo(() => {
        return (
            (displayError &&
                deriveErrorMessage([updateError, removeItemError])) ||
            deriveErrorMessage([...(item.errors || [])]) ||
            ''
        );
    }, [displayError, removeItemError, updateError, item.errors]);

    const handleEditComment = useCallback(() => {
        setIsShowFormComment(true);
    }, [setIsShowFormComment])

    const handleRemoveFromCart = useCallback(async () => {
        try {
            const result = await removeItemFromCart({
                variables: {
                    cartId,
                    itemId: item.uid
                }
            });

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
                    sku: item.product.sku,
                    name: item.product.name,
                    priceTotal: item.prices.price.value,
                    currencyCode: item.prices.price.currency,
                    discountAmount: item.prices.total_item_discount.value,
                    selectedOptions: selectedOptionsLabels,
                    quantity: item.quantity
                }
            });

            if (result) {
                try {
                    ReactGA.event('remove_from_cart', {
                        category: "Ecommerce",
                        label: "Remove from Cart",
                        store_id: storeCode,
                        store_name: storeName,
                        items: [
                            {
                                item_id: `${item.product.art_no}_${storeCode}`,
                                item_name: item.product?.name,
                                price: item.prices?.price?.value || 0,
                                quantity: item.quantity
                            }
                        ]
                    });

                    if (isSignedIn && currentUser) {
                        const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                        window.web_event.track("product", "remove_cart", {
                            items: [
                                {
                                    "type": "product",
                                    "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                    "quantity": item.quantity
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
                                "cart_subtotal": result.data.removeItemFromCart.cart.prices.subtotal_excluding_tax.value,
                                "cart_item_count": result.data.removeItemFromCart.cart.total_quantity,
                                ...(result?.data?.removeItemFromCart?.cart?.prices?.subtotal_with_discount_excluding_tax?.value
                                    ? { revenue: result.data.removeItemFromCart.cart.prices.subtotal_with_discount_excluding_tax.value }
                                    : {})
                            }
                        })
                    } else {
                        window.web_event.track("product", "remove_cart", {
                            items: [
                                {
                                    "type": "product",
                                    "id": `${item.product.art_no}_${storeCode}`, // ArtNo + "_" + Barcode + "_" + StoreCode
                                    "quantity": item.quantity
                                }
                            ],
                            extra: {
                                "cart_subtotal": result.data.removeItemFromCart.cart.prices.subtotal_excluding_tax.value,
                                "cart_item_count": result.data.removeItemFromCart.cart.total_quantity,
                                ...(result?.data?.removeItemFromCart?.cart?.prices?.subtotal_with_discount_excluding_tax?.value
                                    ? { revenue: result.data.removeItemFromCart.cart.prices.subtotal_with_discount_excluding_tax.value }
                                    : {})
                            }
                        })
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (err) {
            // Make sure any errors from the mutation are displayed.
            setDisplayError(true);
        }
    }, [cartId, dispatch, item, removeItemFromCart, storeCode, currentUser, isSignedIn, miniCartInfo]);

    const handleUpdateItemQuantity = useCallback(
        async quantity => {
            try {
                await updateItemQuantity({
                    variables: {
                        cartId,
                        itemId: item.uid,
                        quantity
                    }
                });

                const selectedOptions =
                    item.configurable_options?.map(
                        ({ option_label, value_label }) => ({
                            attribute: option_label,
                            value: value_label
                        })
                    ) || null;

                dispatch({
                    type: quantity ? 'CART_UPDATE_ITEM' : 'CART_REMOVE_ITEM',
                    payload: {
                        cartId,
                        sku: item.product.sku,
                        name: item.product.name,
                        priceTotal: item.prices.price.value,
                        currencyCode: item.prices.price.currency,
                        discountAmount: item.prices.total_item_discount.value,
                        selectedOptions,
                        quantity: quantity || item.quantity
                    }
                });
            } catch (err) {
                // Make sure any errors from the mutation are displayed.
                setDisplayError(true);
            }
        },
        [cartId, dispatch, item, updateItemQuantity]
    );

    const handleSaveNote = useCallback(async values => {
        try {
            if (item && cartId) {
                if (values.note) {
                    const result = await fetchUpdateComment({
                        variables: {
                            cartId: cartId,
                            cartItemUid: item.uid,
                            comment: values.note || ''
                        }
                    });

                    if (result) {
                        setIsShowFormComment(false);
                    }
                } else {
                    if (item.comment) {
                        const result = await fetchRemoveComment({
                            variables: {
                                cartId: cartId,
                                cartItemUid: item.uid
                            }
                        });

                        if (result) {
                            setIsShowFormComment(false);
                            addToast({
                                type: 'info',
                                message: formatMessage({
                                    id: 'cartPage.removeCommentSuccess',
                                    defaultMessage: 'You have successfully deleted the note'
                                }),
                                timeout: 5000
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error)
        }
    }, [item, cartId, setIsShowFormComment])

    useEffect(() => {
        setIsCartUpdating(isProductUpdating);

        // Reset updating state on unmount
        return () => setIsCartUpdating(false);
    }, [setIsCartUpdating, isProductUpdating]);

    const addToWishlistProps = {
        // afterAdd: handleRemoveFromCart,
        buttonText: () =>
            formatMessage({
                id: 'global.addToList',
                defaultMessage: 'Add to wishlist'
            }),
        item: {
            art_no: item.product.art_no,
            quantity: item.quantity,
            selected_options: item.configurable_options
                ? item.configurable_options.map(
                    option => option.configurable_product_option_value_uid
                )
                : [],
            sku: item.product.sku,
            name: item.product.name,
            price: item.product.price_range,
            image: item.product.small_image,
            url: item.product.url_key,
            url_suffix: storeUrlSuffix
        }
    };

    return {
        addToWishlistProps,
        errorMessage: derivedErrorMessage,
        handleRemoveFromCart,
        handleUpdateItemQuantity,
        isEditable: !!flatProduct.options.length,
        product: flatProduct,
        isProductUpdating,
        isNote,
        setIsNote,
        handleSaveNote,
        loading: removeCommentLoading || loading,
        isShowFormComment,
        handleEditComment,
        setIsShowFormComment,
        commentMaxLength: Number(storeConfigData?.storeConfig?.commentMaxLength || 100)
    };
};

const flattenProduct = (item, configurableThumbnailSource, storeUrlSuffix) => {
    const {
        configurable_options: options = [],
        prices,
        product,
        quantity
    } = item;

    const configured_variant = configuredVariant(options, product);

    const { price } = prices;
    const { value: unitPrice, currency } = price;

    const {
        name,
        ecom_name,
        small_image,
        stock_status: stockStatus,
        url_key: urlKey,
        canonical_url
    } = product;
    const { url: image } =
        configurableThumbnailSource === 'itself' && configured_variant
            ? configured_variant.small_image
            : small_image;

    return {
        currency,
        image,
        ecom_name,
        name,
        options,
        quantity,
        stockStatus,
        unitPrice,
        urlKey,
        urlSuffix: storeUrlSuffix,
        canonical_url
    };
};

/** JSDocs type definitions */

/**
 * GraphQL mutations for a product in a cart.
 * This is a type used by the {@link useProduct} talon.
 *
 * @typedef {Object} ProductMutations
 *
 * @property {GraphQLDocument} removeItemMutation Mutation for removing an item in a cart
 * @property {GraphQLDocument} updateItemQuantityMutation Mutation for updating the item quantity in a cart
 *
 * @see [product.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/product.js}
 * to see the mutations used in Venia
 */

/**
 * Object type returned by the {@link useProduct} talon.
 * It provides prop data for rendering a product component on a cart page.
 *
 * @typedef {Object} ProductTalonProps
 *
 * @property {String} errorMessage Error message from an operation perfored on a cart product.
 * @property {function} handleEditItem Function to use for handling when a product is modified.
 * @property {function} handleRemoveFromCart Function to use for handling the removal of a cart product.
 * @property {function} handleUpdateItemQuantity Function to use for handling updates to the product quantity in a cart.
 * @property {boolean} isEditable True if a cart product is editable. False otherwise.
 * @property {ProductItem} product Cart product data
 */

/**
 * Data about a product item in the cart.
 * This type is used in the {@link ProductTalonProps} type returned by the {@link useProduct} talon.
 *
 * @typedef {Object} ProductItem
 *
 * @property {String} currency The currency associated with the cart product
 * @property {String} image The url for the cart product image
 * @property {String} name The name of the product
 * @property {Array<Object>} options A list of configurable option objects
 * @property {number} quantity The quantity associated with the cart product
 * @property {number} unitPrice The product's unit price
 * @property {String} urlKey The product's url key
 * @property {String} urlSuffix The product's url suffix
 */
