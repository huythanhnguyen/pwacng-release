import React, {useCallback, useRef, useState, useMemo, useEffect} from 'react';
import {useApolloClient, useLazyQuery, useMutation, useQuery} from '@apollo/client';

import { useGoogleReCaptcha } from '@magento/peregrine/lib/hooks/useGoogleReCaptcha/useGoogleReCaptcha';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';

import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/SignIn/signIn.gql';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useHistory} from "react-router-dom";
import useEncryptPassword from "../../../@theme/Hooks/EncryptPassword/useEncryptPassword";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useAppContext} from "@magento/peregrine/lib/context/app";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
import ReactGA from "react-ga4";
import CryptoJS from 'crypto-js';
import {GET_STORE_INFORMATION_QUERY} from "@magenest/theme/Talons/StoreLocation/storeLocation.gql";

export const useSignIn = props => {
    const {
        handleTriggerClick,
        getCartDetailsQuery,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        isSigningIn,
        setIsSigningIn,
        redirectPageUrl
    } = props;
    const [, { addToast }] = useToasts();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        createCartMutation,
        getCustomerQuery,
        mergeCartsMutation,
        signInMutation,
        getStoreConfigQuery
    } = operations;
    const history = useHistory();
    const apolloClient = useApolloClient();
    const [ isSaveInformation, setIsSaveInformation ] = useState(false);
    const storage = new BrowserPersistence();
    const cartContext = useCartContext();
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = cartContext;

    const userContext = useUserContext();
    const [
        { isGettingDetails, getDetailsError },
        { getUserDetails, setToken }
    ] = userContext;
    const [appState, { closeDrawer }] = useAppContext();
    const store = storage.getItem('store');
    const storeName = store?.storeInformation?.name || '';
    const storeCode = store?.storeInformation?.source_code.replace('b2c_', '') || '';

    const eventingContext = useEventingContext();
    const [, { dispatch }] = eventingContext;

    const signInMutationResult = useMutation(signInMutation, {
        fetchPolicy: 'no-cache'
    });
    const [signIn, { error: signInError }] = signInMutationResult;

    const [ fetchStoreInformation ] = useLazyQuery(GET_STORE_INFORMATION_QUERY);

    const googleReCaptcha = useGoogleReCaptcha({
        currentForm: 'CUSTOMER_LOGIN',
        formAction: 'signIn'
    });
    const {
        generateReCaptchaData,
        recaptchaLoading,
        recaptchaWidgetProps
    } = googleReCaptcha;

    const { data: storeConfigData } = useQuery(getStoreConfigQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const { customerAccessTokenLifetime } = useMemo(() => {
        const storeConfig = storeConfigData?.storeConfig || {};

        return {
            customerAccessTokenLifetime:
            storeConfig.customer_access_token_lifetime
        };
    }, [storeConfigData]);
    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const formApiRef = useRef(null);
    const setFormApi = useCallback(api => (formApiRef.current = api), []);

    const handleSubmit = useCallback(
        async ({ email, password }) => {
            setIsSigningIn(true);
            // handleTriggerClick();

            try {
                let switchStore = false;
                // Get source cart id (guest cart id).
                const sourceCartId = cartId;

                // Get recaptchaV3 data for login
                const recaptchaData = await generateReCaptchaData();

                // Sign in and set the token.
                const signInResponse = await signIn({
                    variables: {
                        email,
                        password
                    },
                    ...recaptchaData
                });

                const token = signInResponse.data.generateCustomerTokenV2.token;
                const encryptedPassword = useEncryptPassword(password);

                if (isSaveInformation) {
                    storage.setItem('customer_information', {email: email, password: encryptedPassword});
                }

                closeDrawer('ACCOUNT_MENU');

                ReactGA.event('login',{
                    category: "User",
                    label: "Email Login",
                    method: "Email",
                    store_id: storeCode,
                    store_name: storeName
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

                const locationUser = signInResponse.data.generateCustomerTokenV2.location_user;
                if (locationUser) {
                    const street = locationUser.address || '';
                    const ward = locationUser.ward || '';
                    const city = locationUser.city || '';
                    const ward_code = locationUser.ward_code || '';
                    const city_code = locationUser.city_code || '';
                    const addressDefaultLogged = `${street ? `${street}` : ''}${ward ? `, ${ward}` : ''}${city ? `, ${city}` : ''}`;

                    if (city_code && ward_code && street) {
                        storage.setItem('customer_address', {
                            city_code: city_code,
                            ward_code: ward_code,
                            address: street,
                            address_details: addressDefaultLogged
                        });

                        if (locationUser.store_view_code && storage.getItem('store_view_code') !== locationUser.store_view_code) {
                            const resultStoreInformation = await fetchStoreInformation({
                                variables: {
                                    storeViewCode: locationUser.store_view_code
                                }
                            });

                            if (resultStoreInformation.data.storeInformation) {
                                storage.setItem('store_view_code', locationUser.store_view_code);
                                storage.setItem('store', resultStoreInformation.data);
                            }

                            switchStore = true;
                        }
                    }
                }

                if (!switchStore) {
                    history.push(redirectPageUrl);
                }

                await getUserDetails({ fetchUserDetails });

                const { data } = await fetchUserDetails({
                    fetchPolicy: 'cache-only'
                });
                const customerPhoneNumber = data.customer.custom_attributes.find(item => item.code === 'company_user_phone_number').value
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
                            "sign_in_method": "Email"
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
                    })
                } catch (error) {
                    console.log(error);
                }

                dispatch({
                    type: 'USER_SIGN_IN',
                    payload: {
                        ...data.customer
                    }
                });

                await getCartDetails({ fetchCartId, fetchCartDetails });

                if (switchStore) {
                    globalThis.location.assign(redirectPageUrl)
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }

                setIsSigningIn(false);
            }
        },
        [
            customerAccessTokenLifetime,
            cartId,
            generateReCaptchaData,
            signIn,
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
            dispatch,
            isSaveInformation,
            redirectPageUrl
            // handleTriggerClick
        ]
    );

    useEffect(() => {
        if (signInError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: signInError.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [signInError]);

    const handleForgotPassword = useCallback(() => {
        const { current: formApi } = formApiRef;

        if (formApi) {
            setDefaultUsername(formApi.getValue('email'));
        }

        history.push('/forgot-password');
    }, [setDefaultUsername]);

    const forgotPasswordHandleEnterKeyPress = useCallback(
        event => {
            if (event.key === 'Enter') {
                handleForgotPassword();
            }
        },
        [handleForgotPassword]
    );

    const handleCreateAccount = useCallback(() => {
        const { current: formApi } = formApiRef;

        if (formApi) {
            setDefaultUsername(formApi.getValue('email'));
        }

        history.push('/create-account');
    }, [setDefaultUsername, showCreateAccount]);

    const handleEnterKeyPress = useCallback(
        event => {
            if (event.key === 'Enter') {
                handleCreateAccount();
            }
        },
        [handleCreateAccount]
    );

    const signinHandleEnterKeyPress = useCallback(
        event => {
            if (event.key === 'Enter') {
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    const errors = useMemo(
        () =>
            new Map([
                ['getUserDetailsQuery', getDetailsError]
            ]),
        [getDetailsError, signInError]
    );

    return {
        errors,
        handleCreateAccount,
        handleEnterKeyPress,
        signinHandleEnterKeyPress,
        handleForgotPassword,
        forgotPasswordHandleEnterKeyPress,
        handleSubmit,
        isBusy: isGettingDetails || recaptchaLoading,
        setFormApi,
        recaptchaWidgetProps,
        userContext,
        cartContext,
        eventingContext,
        signInMutationResult,
        googleReCaptcha,
        isSigningIn,
        setIsSigningIn,
        fetchCartId,
        mergeCarts,
        fetchUserDetails,
        fetchCartDetails,
        isSaveInformation,
        setIsSaveInformation
    };
};
