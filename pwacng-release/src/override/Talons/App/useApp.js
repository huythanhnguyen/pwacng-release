import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import errorRecord from '@magento/peregrine/lib/util/createErrorRecord';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import {useLazyQuery, useQuery} from "@apollo/client";
import {GET_AVAILABLE_STORES_DATA} from "@magento/peregrine/lib/talons/Header/storeSwitcher.gql";
import {GET_STORE_INFORMATION_QUERY, REMOVE_ITEM_NOT_VISIBLE_FROM_CART} from "../../../@theme/Talons/StoreLocation/storeLocation.gql";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import { useLocation } from 'react-router-dom';
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import {GET_CUSTOMER} from "@magento/peregrine/lib/talons/Navigation/navigation.gql";
import {useRootComponents} from "@magento/peregrine/lib/context/rootComponents";
import CryptoJS from "crypto-js";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useToasts} from "@magento/peregrine";
const dismissers = new WeakMap();
import ReactGA from "react-ga4";
import {useCustomerWishlistSkus} from "@magento/peregrine/lib/hooks/useCustomerWishlistSkus/useCustomerWishlistSkus";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

// Memoize dismisser funcs to reduce re-renders from func identity change.
const getErrorDismisser = (error, onDismissError) => {
    return dismissers.has(error)
        ? dismissers.get(error)
        : dismissers.set(error, () => onDismissError(error)).get(error);
};

/**
 * Talon that handles effects for App and returns props necessary for rendering
 * the app.
 *
 * @param {Function} props.handleError callback to invoke for each error
 * @param {Function} props.handleIsOffline callback to invoke when the app goes offline
 * @param {Function} props.handleIsOnline callback to invoke wen the app goes online
 * @param {Function} props.handleHTMLUpdate callback to invoke when a HTML update is available
 * @param {Function} props.markErrorHandled callback to invoke when handling an error
 * @param {Function} props.renderError an error that occurs during rendering of the app
 * @param {Function} props.unhandledErrors errors coming from the error reducer
 *
 * @returns {{
 *  hasOverlay: boolean
 *  handleCloseDrawer: function
 * }}
 */
export const useApp = props => {
    const {
        handleError,
        handleIsOffline,
        handleIsOnline,
        markErrorHandled,
        renderError,
        unhandledErrors
    } = props;
    const history = useHistory();
    const location = useLocation();
    const { pathname, search } = location;
    const query = new URLSearchParams(search);
    const storeCode = query.get('store_code');
    const storage = new BrowserPersistence();
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(GET_CUSTOMER);
    const [{ cartId }] = useCartContext();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [, { addToast }] = useToasts();

    if (!pathname.includes('/mcard/')) {
        useCustomerWishlistSkus();
    }

    const { data: availableStoresData } = useQuery(GET_AVAILABLE_STORES_DATA, {
        fetchPolicy: 'cache-and-network'
    });

    const [fetchRemoveItemNotVisible] = useLazyQuery(REMOVE_ITEM_NOT_VISIBLE_FROM_CART, {
        fetchPolicy: 'cache-and-network'
    });

    const [fetchStoreInformation,
        {
            data: storeInformation,
            loading: storeInformationLoading,
            error: storeInformationError
        }] = useLazyQuery(GET_STORE_INFORMATION_QUERY);

    // request data from server
    useEffect(() => {
        getUserDetails({ fetchUserDetails });
    }, [fetchUserDetails, getUserDetails]);

    useEffect(() => {
        (async () => {
            if (isSignedIn && !storage.getItem('signin_token')) {
                history.go(0);
            }
        })();
    }, [isSignedIn, pathname]);

    const prevCartIdRef = useRef(null);
    useEffect(async () => {
        const shouldRun =
            (cartId && (pathname.includes('/cart') || pathname.includes('/checkout'))) ||
            (cartId && prevCartIdRef.current !== cartId);

        if (!shouldRun || pathname.includes('/mcard/')) return;

        const checkItemNotVisible = async () => {
            try {
                const result = await fetchRemoveItemNotVisible({
                    variables: { cartId }
                });

                if (result?.data?.removeItemNotVisibleFromCart?.is_removed) {
                    addToast({
                        type: 'info',
                        message: result.data.removeItemNotVisibleFromCart.messages,
                        timeout: 7000
                    });
                }
            } catch (e) {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: e.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        };

        checkItemNotVisible();
        prevCartIdRef.current = cartId;
    }, [cartId, pathname]);

    useEffect(async () => {
        if (storeCode && availableStoresData?.availableStores?.length > 0) {
            const isStoreGroupCodeAvailable = availableStoresData.availableStores.find(store => store.store_group_code === storeCode);
            const isStoreCodeAvailable = availableStoresData.availableStores.find(store => store.store_code === storeCode);

            if (isStoreCodeAvailable) {
                storage.setItem('store_view_code', storeCode);
            } else if (isStoreGroupCodeAvailable) {
                storage.setItem('store_view_code', `${storeCode}_vi`);
            } else {
                storage.setItem('store_view_code', process.env.STORE_VIEW_CODE);
            }

            const result = await fetchStoreInformation({
                variables: {
                    storeViewCode: isStoreCodeAvailable?.store_code || `${isStoreGroupCodeAvailable?.store_group_code}_vi`
                }
            });

            if (result) {
                storage.setItem('store', '');
                storage.removeItem('language');

                window.location.href = window.location.origin
            }
        }
    }, [storeCode, availableStoresData]);

    const reload = useCallback(() => {
        if (process.env.NODE_ENV !== 'development') {
            history.go(0);
        }
    }, [history]);

    const renderErrors = useMemo(
        () =>
            renderError
                ? [
                    errorRecord(
                        renderError,
                        globalThis,
                        useApp,
                        renderError.stack
                    )
                ]
                : [],
        [renderError]
    );

    const errors = renderError ? renderErrors : unhandledErrors;
    const handleDismissError = renderError ? reload : markErrorHandled;

    // Only add toasts for errors if the errors list changes. Since `addToast`
    // and `toasts` changes each render we cannot add it as an effect dependency
    // otherwise we infinitely loop.
    useEffect(() => {
        for (const { error, id, loc } of errors) {
            handleError(
                error,
                id,
                loc,
                getErrorDismisser(error, handleDismissError)
            );
        }
    }, [errors, handleDismissError, handleError]);

    const [appState, appApi] = useAppContext();
    const { closeDrawer } = appApi;
    const { hasBeenOffline, isOnline, overlay } = appState;

    useEffect(() => {
        if (hasBeenOffline) {
            if (isOnline) {
                handleIsOnline();
            } else {
                handleIsOffline();
            }
        }
    }, [handleIsOnline, handleIsOffline, hasBeenOffline, isOnline]);

    useEffect(() => {
        ReactGA.event('store',{
            store_id: storage.getItem('store')?.storeInformation?.source_code?.replace('b2c', '') || '',
            store_name: storage.getItem('store')?.storeInformation?.name || '',
        });
    }, [storage.getItem('store')]);

    const handleCloseDrawer = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    return {
        hasOverlay: !!overlay,
        handleCloseDrawer
    };
};
