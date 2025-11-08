import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useMutation, useQuery, useLazyQuery} from '@apollo/client';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import defaultOperations from './wishlistPage.gql';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {WishlistContext} from "../../../@theme/Context/Wishlist/wishlistContext";

const RENAME = 'rename';
const DELETE = 'delete'

/**
 * @function
 *
 * @returns {WishlistPageProps}
 */
export const useWishlistPage = (props = {}) => {
    const operations = mergeOperations(defaultOperations, props.operations);
    const {
        getCustomerWishlistQuery,
        updateWishlistMutation,
        deleteWishlistMutation,
        getRelatedProduct
    } = operations;
    const [ wishlistSelected, setWishlistSelected ] = useState({
        id: '',
        name: '',
        itemsCount: ''
    });
    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const {wishlistProducts} = useContext(WishlistContext);

    const renameModalOpen = drawer === RENAME;
    const deleteModalOpen = drawer === DELETE;

    const [{ isSignedIn }] = useUserContext();

    const { data, error, loading } = useQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const [fetchRelatedProduct, { data: relatedProductData, called: relatedProductCalled, loading: relatedProductLoading }] = useLazyQuery(getRelatedProduct);

    useEffect(() => {
        if (!relatedProductCalled && wishlistProducts) {
            fetchRelatedProduct({
                variables: {
                    wishlistProducts
                },
                fetchPolicy: 'cache-and-network'
            })
        }
    }, [wishlistProducts, relatedProductCalled, fetchRelatedProduct]);

    const relatedProducts =
        relatedProductData &&
        relatedProductData?.products?.items.flatMap(item => item.related_products).filter((product, index, self) =>
            index === self.findIndex((p) => (
                p.sku === product.sku
            )));

    const [fetchUpdateWishlist, {loading: updateWishlistLoading, error: updateWishlistError}] = useMutation(updateWishlistMutation);
    const [fetchDeleteWishlist, {loading: deleteWishlistLoading, error: deleteWishlistError}] = useMutation(deleteWishlistMutation);

    const derivedWishlists = useMemo(() => {
        return (data && data.customer.wishlists) || [];
    }, [data]);

    const handleRename = useCallback((id, name, itemsCount) => {
        toggleDrawer(RENAME);
        setWishlistSelected({
            id,
            name,
            itemsCount
        });
    }, [toggleDrawer, setWishlistSelected]);

    const handleDelete = useCallback((id, name, itemsCount) => {
        toggleDrawer(DELETE);
        setWishlistSelected({
            id,
            name,
            itemsCount
        });
    }, [toggleDrawer, setWishlistSelected]);

    const handleRenameModalClose = useCallback(() => {
        closeDrawer(RENAME);
    }, [closeDrawer]);

    const handleDeleteModalClose = useCallback(() => {
        closeDrawer(DELETE);
    }, [closeDrawer]);

    const handleRenameSubmit = useCallback(async (values) => {
        try {
            await fetchUpdateWishlist({
                variables: {
                    wishlistId: wishlistSelected.id,
                    name: values.new_name
                },
                refetchQueries: [{query: getCustomerWishlistQuery}]
            });

            formApiRef.current.reset();

            setWishlistSelected({
                id: '',
                name: '',
                itemsCount: ''
            });
            closeDrawer(RENAME);
        } catch (error) {
            console.error(error);
        }
    }, [wishlistSelected, fetchUpdateWishlist, closeDrawer, formApiRef]);

    const handleDeleteWishlist = useCallback(async () => {
        try {
            await fetchDeleteWishlist({
                variables: {
                    wishlistId: wishlistSelected.id
                },
                refetchQueries: [{query: getCustomerWishlistQuery}]
            });

            setWishlistSelected({
                id: '',
                name: '',
                itemsCount: ''
            });

            closeDrawer(DELETE);
        } catch (error) {
            console.error(error)
        }
    }, [wishlistSelected, fetchDeleteWishlist, closeDrawer])

    return {
        errors: error || updateWishlistError || deleteWishlistError,
        loading,
        fetchLoading: updateWishlistLoading || deleteWishlistLoading,
        wishlists: derivedWishlists,
        wishlistSelected,
        setWishlistSelected,
        handleRename,
        handleDelete,
        handleRenameModalClose,
        handleDeleteModalClose,
        renameModalOpen,
        deleteModalOpen,
        handleRenameSubmit,
        setFormApi,
        handleDeleteWishlist,
        relatedProducts
    };
};

/**
 * JSDoc type definitions
 */

/**
 * GraphQL mutations for the Wishlist Page
 *
 * @typedef {Object} WishlistQueries
 *
 * @property {GraphQLDocument} getCustomerWishlistQuery Query to get customer wish lists
 *
 * @see [`wishlistPage.gql.js`]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/WishlistPage/wishlistPage.gql.js}
 * for queries used in Venia
 */

/**
 * GraphQL types for the Wishlist Page
 *
 * @typedef {Object} WishlistTypes
 *
 * @property {Function} Customer.fields.wishlists.read
 *
 * @see [`wishlistPage.gql.js`]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/WishlistPage/wishlistPage.gql.js}
 * for queries used in Venia
 */

/**
 * Props data to use when rendering the Wishlist Item component
 *
 * @typedef {Object} WishlistPageProps
 *
 * @property {Map} errors A map of all the GQL query errors
 * @property {Boolean} loading is the query loading
 * @property {Boolean} shouldRenderVisibilityToggle true if wishlists length is > 1.
 * @property {Object} wishlists List of all customer wishlists
 */
