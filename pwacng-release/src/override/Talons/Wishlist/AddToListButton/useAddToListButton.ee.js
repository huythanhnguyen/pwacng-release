import React, {useCallback, useContext, useMemo, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useApolloClient, useMutation, useQuery, useLazyQuery} from '@apollo/client';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import { GET_PRODUCTS_IN_WISHLISTS } from '@magento/peregrine/lib/talons/Wishlist/AddToListButton/addToListButton.gql';
import { useSingleWishlist } from '@magento/peregrine/lib/talons/Wishlist/AddToListButton/helpers/useSingleWishlist';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import defaultOperations from "@magento/peregrine/lib/talons/WishlistPage/wishlistItem.gql";
import {WishlistContext} from "../../../../@theme/Context/Wishlist/wishlistContext";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useAddToListButton = props => {
    const { afterAdd, beforeAdd, item, setPopupSearchVisible } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successToastName, setSuccessToastName] = useState();
    const [{ isSignedIn }] = useUserContext();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const operations = mergeOperations(defaultOperations, props.operations);
    const {derivedWishlists, wishlistProducts, setWishlistProducts} = useContext(WishlistContext);

    const singleWishlistProps = useSingleWishlist(props);

    const apolloClient = useApolloClient();

    const {
        removeProductsFromWishlistMutation,
        getWishlistIdByProductQuery
    } = operations;

    const buttonProps = useMemo(() => {
        const singleButtonProps = singleWishlistProps.buttonProps;
        if (isSignedIn) {
            return {
                ...singleButtonProps,
                'aria-haspopup': 'dialog',
                onPress: () => {
                    setIsModalOpen(true);
                    if (setPopupSearchVisible) {
                        setPopupSearchVisible(false);
                    }

                    if (beforeAdd) {
                        beforeAdd();
                    }
                }
            };
        }

        return singleButtonProps;
    }, [
        singleWishlistProps.buttonProps,
        isSignedIn,
        beforeAdd,
        setPopupSearchVisible
    ]);

    const handleModalClose = useCallback(
        (success, additionalData) => {
            setIsModalOpen(false);

            // only set item added true if someone calls handleModalClose(true)
            if (success === true) {
                apolloClient.writeQuery({
                    query: GET_PRODUCTS_IN_WISHLISTS,
                    data: {
                        customerWishlistProducts: [
                            ...singleWishlistProps.customerWishlistProducts,
                            item.sku
                        ]
                    }
                });

                setSuccessToastName(additionalData.wishlistName);

                if (afterAdd) {
                    afterAdd();
                }
            }
        },
        [
            afterAdd,
            apolloClient,
            item.sku,
            singleWishlistProps.customerWishlistProducts
        ]
    );

    const modalProps = useMemo(() => {
        if (isSignedIn) {
            return {
                isOpen: isModalOpen,
                itemOptions: item,
                onClose: handleModalClose
            };
        }

        return null;
    }, [
        handleModalClose,
        isModalOpen,
        isSignedIn,
        item
    ]);

    const successToastProps = useMemo(() => {
        if (successToastName) {
            return {
                type: 'success',
                message: formatMessage(
                    {
                        id: 'wishlist.galleryButton.successMessageNamed',
                        defaultMessage:
                            'Item successfully added to the "{wishlistName}" list.'
                    },
                    {
                        wishlistName: successToastName
                    }
                ),
                timeout: 5000
            };
        }

        return singleWishlistProps.successToastProps;
    }, [
        singleWishlistProps.successToastProps,
        formatMessage,
        successToastName
    ]);

    const [removeProductsFromWishlist] = useMutation(removeProductsFromWishlistMutation);
    const [getWishlistId] = useLazyQuery(getWishlistIdByProductQuery);

    const handleRemoveProductFromWishlist = useCallback(async () => {
        try {
            const { data } = await getWishlistId({ variables: { sku: item.sku } });

            const wishlistId = data?.getWishlistIdByProduct?.wishlist_id || null;
            const itemId = data?.getWishlistIdByProduct?.wishlist_item_id || null;
            if (!wishlistId || !itemId) throw new Error('Wishlist/Item ID not found');

            const result = await removeProductsFromWishlist({
                update: cache => {
                    // clean up for cache fav product on category page
                    cache.modify({
                        id: 'ROOT_QUERY',
                        fields: {
                            customerWishlistProducts: cachedProducts =>
                                cachedProducts.filter(
                                    productSku => productSku !== item.sku
                                )
                        }
                    });

                    cache.modify({
                        id: `CustomerWishlist:${wishlistId}`,
                        fields: {
                            items_v2: (cachedItems, { readField, Remove }) => {
                                for (var i = 0; i < cachedItems.items.length; i++) {
                                    if (readField('id', item) === itemId) {
                                        return Remove;
                                    }
                                }

                                return cachedItems;
                            }
                        }
                    });
                },
                variables: {
                    wishlistId: wishlistId,
                    wishlistItemsId: [itemId]
                }
            });

            setWishlistProducts(wishlistProducts.filter(sku => sku !== item.sku));

            if (result) {
                addToast({
                    type: 'success',
                    message: formatMessage({
                        id: 'addToListButton.removeWishlistText',
                        defaultMessage: 'The product has been successfully removed from your wishlist.'
                    }),
                    dismissable: true,
                    timeout: 5000
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 5000
            });
        }
    }, [removeProductsFromWishlist, item]);

    return {
        ...singleWishlistProps,
        buttonProps,
        modalProps,
        successToastProps,
        setIsModalOpen,
        handleRemoveProductFromWishlist
    };
};
