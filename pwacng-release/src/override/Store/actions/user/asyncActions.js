import BrowserPersistence from '@magento/peregrine/lib/util/simplePersistence';
import { removeCart } from '@magento/peregrine/lib/store/actions/cart';
import { clearCheckoutDataFromStorage } from '@magento/peregrine/lib/store/actions/checkout';

import actions from '@magento/peregrine/lib/store/actions/user/actions';
import Cookies from "js-cookie";

const storage = new BrowserPersistence();

export const signOut = (payload = {}) =>
    async function thunk(dispatch, getState, { apolloClient }) {
        const { revokeToken } = payload;

        if (revokeToken) {
            // Send mutation to revoke token.
            try {
                await revokeToken();
            } catch (error) {
                console.error('Error Revoking Token', error);
            }
        }

        // Remove token from local storage and Redux.
        await dispatch(clearToken());
        await dispatch(actions.reset());
        await clearCheckoutDataFromStorage();
        Cookies.remove('ageConfirmed');
        await apolloClient.clearCacheData(apolloClient, 'cart');
        await apolloClient.clearCacheData(apolloClient, 'customer');

        // Now that we're signed out, forget the old (customer) cart.
        // We don't need to create a new cart here because we're going to refresh
        // the page immediately after.
        await dispatch(removeCart());

        sessionStorage.removeItem('aiBrowserSession');
        storage.removeItem('ai_session_ids');
        storage.setItem('isAddressChanged', false);
        storage.setItem('customer_no', '');
        storage.setItem('store_view_code', `${process.env.STORE_VIEW_CODE.slice(0, -2)}${storage.getItem('language')?.code || 'vi'}`);
        storage.setItem('store', '');
    };

export const getUserDetails = ({ fetchUserDetails }) =>
    async function thunk(...args) {
        const [dispatch, getState] = args;
        const { user } = getState();

        if (user.isSignedIn) {
            dispatch(actions.getDetails.request());

            try {
                const { data } = await fetchUserDetails();

                dispatch(actions.getDetails.receive(data.customer));
            } catch (error) {
                dispatch(actions.getDetails.receive(error));
            }
        }
    };

export const resetPassword = ({ email }) =>
    async function thunk(...args) {
        const [dispatch] = args;

        dispatch(actions.resetPassword.request());

        // TODO: actually make the call to the API.
        // For now, just return a resolved promise.
        await Promise.resolve(email);

        dispatch(actions.resetPassword.receive());
    };

export const setToken = (token, customerAccessTokenLifetime = 1) =>
    async function thunk(...args) {
        const [dispatch] = args;

        // Store token in local storage.
        // TODO: Get correct token expire time from API
        storage.setItem(
            'signin_token',
            token,
            customerAccessTokenLifetime * 3600
        );

        // Persist in store
        dispatch(actions.setToken(token));
    };

export const clearToken = () =>
    async function thunk(...args) {
        const [dispatch] = args;

        // Clear token from local storage
        storage.removeItem('signin_token');

        // Remove from store
        dispatch(actions.clearToken());
    };
