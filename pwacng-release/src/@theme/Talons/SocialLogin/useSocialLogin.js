import React, {useCallback, useEffect, useMemo, useState} from 'react';
import DEFAULT_OPERATIONS from './socialLogin.gql';
import { GET_CART_DETAILS_QUERY } from '@magento/venia-ui/lib/components/SignIn/signIn.gql';
import {WRITE_LOG_CLIENT} from "../../../override/Talons/App/log.gql";
import {useApolloClient, useMutation, useQuery} from '@apollo/client';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {retrieveCartId} from "@magento/peregrine/lib/store/actions/cart";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import {useHistory} from "react-router-dom";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";

const UseSocialLogin = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const history = useHistory();
    const storage = new BrowserPersistence();
    const [appState, { closeDrawer }] = useAppContext();
    const {
        socialLoginMutation,
        socialCreateMutation,
        getStoreConfigQuery,
        createCartMutation,
        mergeCartsMutation,
        getCustomerQuery
    } = operations;

    const userContext = useUserContext();
    const apolloClient = useApolloClient();
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const [
        { isGettingDetails, getDetailsError },
        { getUserDetails, setToken }
    ] = userContext;

    const cartContext = useCartContext();
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = cartContext;

    const [fetchSocialLogin] = useMutation(socialLoginMutation, {
        fetchPolicy: 'no-cache'
    });

    const { data: storeConfigData } = useQuery(getStoreConfigQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const [writeLogClient] = useMutation(WRITE_LOG_CLIENT);
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(GET_CART_DETAILS_QUERY);
    const eventingContext = useEventingContext();
    const [, { dispatch }] = eventingContext;

    const onLogoutSuccess = useCallback(() => {
        storage.removeItem('provider');
    }, []);

    const { customerAccessTokenLifetime } = useMemo(() => {
        const storeConfig = storeConfigData?.storeConfig || {};

        return {
            customerAccessTokenLifetime:
            storeConfig.customer_access_token_lifetime
        };
    }, [storeConfigData]);

    const handleResolve = useCallback(async (provider, profile) => {
        if (!provider || !profile) return;

        try {
            let tokenApp = '';

            if (provider === 'google') {
                tokenApp = profile.code
            } else if (provider === 'facebook') {
                tokenApp = profile.accessToken
            }

            const signInResponse = await fetchSocialLogin({
                variables: {
                    provider,
                    token: tokenApp
                }
            });

            if (signInResponse) {
                storage.setItem('social_info', {
                    provider: provider,
                    user_info: {
                        id: signInResponse.data.socialLogin.customer.id,
                        firstname: signInResponse.data.socialLogin.customer.firstname,
                        email: signInResponse.data.socialLogin.customer.email,
                        lastname: signInResponse.data.socialLogin.customer.lastname
                    }
                })
            }

            const token = signInResponse.data.socialLogin.token;

            if (!token) {
                history.push('/update-phone-number');
            } else {
                // Get source cart id (guest cart id).
                const sourceCartId = cartId;
                storage.setItem('isAddressChanged', false);
                closeDrawer('ACCOUNT_MENU');

                ReactGA.event('login',{
                    category: "User",
                    label: 'Social Login',
                    store_id: storeCode,
                    store_name: storeName,
                    method: 'Social'
                });

                await (customerAccessTokenLifetime
                    ? setToken(token, customerAccessTokenLifetime)
                    : setToken(token));

                // Clear all cart/customer data from cache and redux.
                await apolloClient.clearCacheData(apolloClient, 'cart');
                await apolloClient.clearCacheData(apolloClient, 'customer');
                await removeCart();

                // Create and get the customer's cart id.
                await createCart({
                    fetchCartId
                });
                const destinationCartId = await retrieveCartId();

                // Merge the guest cart into the customer cart.
                if (sourceCartId) {
                    try {
                        await mergeCarts({
                            variables: {
                                destinationCartId,
                                sourceCartId
                            }
                        });
                    } catch (error) {
                        if (process.env.NODE_ENV !== 'production') {
                            console.error(error);
                        }
                    }
                }

                // Ensure old stores are updated with any new data.

                await getUserDetails({ fetchUserDetails });

                const { data } = await fetchUserDetails({
                    fetchPolicy: 'cache-only'
                });

                if (data?.customer) {
                    const customerPhoneNumber = data.customer.custom_attributes.find(item => item.code === 'company_user_phone_number').value;
                    const currentDate = new Date().toISOString().split('T')[0];

                    storage.setItem('lastAPICallDate', currentDate);

                    try {
                        window.web_event.track("user", "sign_in", {
                            dims: {
                                customers: {
                                    "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                    "name": data.customer.firstname,
                                    "phone": customerPhoneNumber,
                                    "email": data.customer.email,
                                    "customer_type": "B2C"
                                }
                            },
                            extra: {
                                "sign_in_method": provider
                            }
                        });

                        window.web_event.track("user", "identify", {
                            dims: {
                                customers: {
                                    "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                                    "name": data.customer.firstname,
                                    "phone": customerPhoneNumber,
                                    "email": data.customer.email,
                                    "customer_type": "B2C"
                                }
                            }
                        });
                    } catch (error) {
                        console.log(error);
                    }

                    dispatch({
                        type: 'USER_SIGN_IN',
                        payload: {
                            ...data.customer
                        }
                    });
                } else {
                    await writeLogClient({
                        variables: {
                            message: 'SocialLogin error: !data?.customer'
                        }
                    });
                }

                getCartDetails({ fetchCartId, fetchCartDetails });
            }
        } catch (error) {
            console.error(error);
        }
    }, [
        customerAccessTokenLifetime,
        cartId,
        fetchSocialLogin,
        setToken,
        apolloClient,
        removeCart,
        createCart,
        fetchCartId,
        mergeCarts,
        getUserDetails,
        fetchUserDetails,
        getCartDetails,
        fetchCartDetails,
        dispatch
    ]);

    return {
        handleResolve,
        onLogoutSuccess
    }
}

export default UseSocialLogin
