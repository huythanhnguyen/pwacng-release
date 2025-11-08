import React, {useCallback, useEffect, useState} from "react";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import {useHistory} from "react-router-dom";
import DEFAULT_OPERATIONS from "../quickOrder.gql";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useMutation} from "@apollo/client";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useIntl} from "react-intl";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const UNSUPPORTED_PRODUCT_TYPES = [
    'VirtualProduct',
    'BundleProduct',
    'GroupedProduct',
    'DownloadableProduct'
];

const UseProduct = props => {
    const {
        item
    } = props;

    const { formatMessage } = useIntl();

    const [, { addToast }] = useToasts();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const history = useHistory();
    const [ isLoading, setIsLoading ] = useState(false);
    const isInStock = item.product.stock_status === 'IN_STOCK';
    const [quantityUpdate, setQuantityUpdate] = useState(item.qty);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [ isShowFormComment, setIsShowFormComment ] = useState(false);

    const {
        updateItemQuickOrder,
        getQuickOrder,
        removeItemQuickOrder,
        updateItemCommentQuickOrder
    } = operations;

    const [ fetchUpdateItemQuickOrder ] = useMutation(updateItemQuickOrder);
    const [ fetchRemoveItemQuickOrder, {loading: removeItemLoading} ] = useMutation(removeItemQuickOrder);
    const [fetchUpdateComment, { loading: updateCommentLoading }] = useMutation(updateItemCommentQuickOrder);

    const productType = item
        ? item.product.__typename !== undefined
            ? item.product.__typename
            : item.product.type
        : null;

    const isUnsupportedProductType = UNSUPPORTED_PRODUCT_TYPES.includes(
        productType
    );

    const isDisabled = isLoading || !isInStock || isUnsupportedProductType;

    useEffect(() => {
        setQuantityUpdate(item.qty)
    }, [item.qty]);

    const addToWishlistProps = {
        // afterAdd: handleRemoveFromCart,
        buttonText: () =>
            formatMessage({
                id: 'global.addToList',
                defaultMessage: 'Add to wishlist'
            }),
        item: {
            art_no: item.product.art_no,
            quantity: item.qty,
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
            url_suffix: item.product.url_suffix
        }
    };

    const handleUpdateCartItem = useCallback(async (itemId, newQuantity) => {
        try {
            if (Number(newQuantity) === 0) {
                await handleRemoveFromCart(itemId);
            } else {
                if (productType === 'SimpleProduct' || productType === 'simple') {
                    setIsLoading(true);

                    const result = await fetchUpdateItemQuickOrder({
                        variables: {
                            itemId,
                            qty: parseFloat(newQuantity)
                        },
                        refetchQueries: [{query: getQuickOrder}],
                        awaitRefetchQueries: true
                    })

                    if (result?.data?.updateItemQuickOrder?.success) {
                        setQuantityUpdate(newQuantity);
                    } else {
                        const error = result?.data?.updateItemQuickOrder?.message || [];

                        addToast({
                            type: 'error',
                            icon: errorIcon,
                            message: error,
                            dismissable: true,
                            timeout: 7000
                        })
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
    }, [setQuantityUpdate, isLoading, productType, item]);

    const handleBlur = useCallback(async (event) => {
        let value = Number(event.target.value);
        if (value === 0) {
            setQuantityUpdate(0);
        } else {
            value = parseInt(event.target.value, 10);
            if (item.product.mm_product_type && item.product.mm_product_type === 'F') {
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
            await handleUpdateCartItem(item.item_id, value);
        } catch (error) {
            console.error(error);
        }
    }, [quantityUpdate, handleUpdateCartItem, item]);

    const handleKeyPress = useCallback(async (event) => {
        let value = Number(event.target.value);
        if (value === 0) {
            setQuantityUpdate(0);
        } else {
            value = parseInt(event.target.value, 10);
            if (item.product.mm_product_type && item.product.mm_product_type === 'F') {
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
                await handleUpdateCartItem(item.item_id, value);
            } catch (error) {
                console.error(error);
            }
        }
    }, [quantityUpdate, item, handleUpdateCartItem]);

    const handleRemoveFromCart = useCallback(async (itemId) => {
        try {
            const result = await fetchRemoveItemQuickOrder({
                variables: {
                    itemId: itemId
                },
                refetchQueries: [{query: getQuickOrder}],
                awaitRefetchQueries: true
            });

            if (result && !result.data.removeItemQuickOrder.success) {
                const error = result.data.removeItemQuickOrder.message;

                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error,
                    dismissable: true,
                    timeout: 7000
                })
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            })
        }
    }, [fetchRemoveItemQuickOrder]);

    const handleEditComment = useCallback(() => {
        setIsShowFormComment(true);
    }, [setIsShowFormComment])

    const handleSaveNote = useCallback(async (values) => {
        try {
            if (item) {
                if (values.note) {
                    const result = await fetchUpdateComment({
                        variables: {
                            itemId: item.item_id,
                            comment: values.note
                        },
                        refetchQueries: [{query: getQuickOrder}]
                    });

                    if (result) {
                        setIsShowFormComment(false);
                    }
                } else {
                    if (item.comment) {
                        const result = await fetchUpdateComment({
                            variables: {
                                itemId: item.item_id,
                                comment: ''
                            },
                            refetchQueries: [{query: getQuickOrder}]
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
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            })
        }
    }, [item])

    return {
        handleUpdateCartItem,
        isDisabled,
        quantityUpdate,
        isInputFocused,
        setIsInputFocused,
        handleBlur,
        handleKeyPress,
        handleRemoveFromCart,
        isProductUpdating: removeItemLoading,
        addToWishlistProps,
        isShowFormComment,
        setIsShowFormComment,
        handleEditComment,
        handleSaveNote,
        updateCommentLoading
    }
}

export default UseProduct
