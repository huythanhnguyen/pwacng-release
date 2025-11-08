import { useCallback, useMemo, useState, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import { WishlistContext } from "@magenest/theme/Context/Wishlist/wishlistContext";

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import defaultOperations from '@magento/peregrine/lib/talons/Wishlist/AddToListButton/addToListButton.gql';

export const useSingleWishlist = props => {
    const { afterAdd, beforeAdd, item } = props;

    const operations = mergeOperations(defaultOperations, props.operations);

    const { wishlistProducts, setWishlistProducts, client } = useContext(WishlistContext);
    const [showLoginToast, setShowLoginToast] = useState(0);
    const { formatMessage } = useIntl();
    const [{ isSignedIn }] = useUserContext();

    const [
        addProductToWishlist,
        {
            data: addProductData,
            error: errorAddingProduct,
            loading: isAddingToWishlist
        }
    ] = useMutation(operations.addProductToWishlistMutation);

    const isSelected = useMemo(() => {
        return (
            wishlistProducts.includes(item.sku) || isAddingToWishlist
        );
    }, [wishlistProducts, isAddingToWishlist, item.sku]);

    const handleClick = useCallback(async () => {
        if (!isSignedIn) {
            setShowLoginToast(current => ++current);
        } else {
            try {
                if (beforeAdd) {
                    await beforeAdd();
                }

                await addProductToWishlist({
                    variables: { wishlistId: '0', itemOptions: item }
                });

                const updatedProducts = [...new Set([...wishlistProducts, item.sku])];
                client.writeQuery({
                    query: operations.getProductsInWishlistsQuery,
                    data: {
                        customerWishlistProducts: updatedProducts
                    }
                });
                setWishlistProducts(updatedProducts);

                if (afterAdd) {
                    afterAdd();
                }
            } catch (error) {
                console.error(error);
            }
        }
    }, [
        addProductToWishlist,
        afterAdd,
        beforeAdd,
        client,
        isSignedIn,
        item,
        operations.getProductsInWishlistsQuery,
        wishlistProducts,
        setWishlistProducts
    ]);

    const loginToastProps = useMemo(() => {
        if (showLoginToast) {
            return {
                type: 'info',
                message: formatMessage({
                    id: 'wishlist.galleryButton.loginMessage',
                    defaultMessage:
                        'Please sign-in to your Account to save items for later.'
                }),
                timeout: 5000
            };
        }

        return null;
    }, [formatMessage, showLoginToast]);

    const successToastProps = useMemo(() => {
        if (addProductData) {
            return {
                type: 'success',
                message: formatMessage({
                    id: 'wishlist.galleryButton.successMessageGeneral',
                    defaultMessage:
                        'Item successfully added to your favorites list.'
                }),
                timeout: 5000
            };
        }

        return null;
    }, [addProductData, formatMessage]);

    const errorToastProps = useMemo(() => {
        if (errorAddingProduct) {
            return {
                type: 'error',
                message: formatMessage({
                    id: 'wishlist.galleryButton.addError',
                    defaultMessage:
                        'Something went wrong adding the product to your wishlist.'
                }),
                timeout: 5000
            };
        }

        return null;
    }, [errorAddingProduct, formatMessage]);

    const buttonProps = useMemo(
        () => ({
            'aria-label': formatMessage({
                id: 'wishlistButton.addText',
                defaultMessage: 'Add to Favorites'
            }),
            isDisabled: isSelected,
            onPress: handleClick,
            type: 'button'
        }),
        [formatMessage, handleClick, isSelected]
    );

    return {
        buttonProps,
        buttonText: props.buttonText && props.buttonText(isSelected),
        customerWishlistProducts: wishlistProducts,
        errorToastProps,
        handleClick,
        isSelected,
        loginToastProps,
        successToastProps
    };
};
