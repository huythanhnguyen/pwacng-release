import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useHistory, useLocation} from "react-router-dom";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/Header/accountMenu.gql";
import {useApolloClient, useLazyQuery, useMutation, useQuery} from "@apollo/client";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import MCARD_OPERATIONS from './mCardLogin.gql';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {retrieveCartId} from "@magento/peregrine/lib/store/actions/cart";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import {GET_CART_DETAILS_QUERY} from "@magento/venia-ui/lib/components/SignIn/signIn.gql";
import {WRITE_LOG_CLIENT} from "../../../override/Talons/App/log.gql";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon,
    Check
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {fullPageLoadingIndicator} from "@magento/venia-ui/lib/components/LoadingIndicator";
import {GET_STORE_INFORMATION_QUERY} from "../../Talons/StoreLocation/storeLocation.gql";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
import useLanguageSwitcher from "../../Talons/Header/useLanguageSwitcher";
import {availableRoutes} from "@magento/venia-ui/lib/components/Routes/routes";
import {useIntl} from "react-intl";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
const CheckIcon = <Icon size={20} src={Check} />;

const MCardLogin = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const isMCardPage = currentPath === '/mcard/';

    const [, { addToast }] = useToasts();
    const storage = new BrowserPersistence();
    const { search } = location;
    const query = new URLSearchParams(search);
    const token = query.get('token');
    const hash = query.get('hash');
    const store = query.get('store');
    const phone = query.get('phone');
    const custNo = query.get('cust_no');
    const custName = query.get('cust_name');
    const custNoMM = query.get('cust_no_mm');
    const callbackUrl = query.get('callback_url');
    const lang = query.get('lang');
    const [ isCallMCardLogin, setIsCallMCardLogin ] = useState(true);
    const [ pageLoading, setPageLoading ] = useState(true);

    const operations = mergeOperations(DEFAULT_OPERATIONS, MCARD_OPERATIONS);
    const {
        signOutMutation,
        generateLoginMCardInfo,
        getStoreConfigQuery,
        createCartMutation,
        mergeCartsMutation,
        getCustomerQuery
    } = operations;

    const talonProps = useLanguageSwitcher({
        availableRoutes
    });
    const {
        availableLanguages,
        handleSwitcherLanguage,
        currentLanguage,
    } = talonProps;

    const [
        { currentUser, isSignedIn },
        { getUserDetails, setToken, signOut }
    ] = useUserContext();
    const apolloClient = useApolloClient();

    const cartContext = useCartContext();
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = cartContext;

    const { formatMessage } = useIntl();
    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const [writeLogClient] = useMutation(WRITE_LOG_CLIENT);
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(GET_CART_DETAILS_QUERY);
    const eventingContext = useEventingContext();
    const [, { dispatch }] = eventingContext;

    const history = useHistory();
    const [revokeToken] = useMutation(signOutMutation);
    const [fetchMCardLogin, {data, loading, error} ] = useMutation(generateLoginMCardInfo);
    const { data: storeConfigData } = useQuery(getStoreConfigQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [fetchStoreInformation,
        {
            data: storeInformation,
            loading: storeInformationLoading,
            error: storeInformationError
        }] = useLazyQuery(GET_STORE_INFORMATION_QUERY);

    const { customerAccessTokenLifetime } = useMemo(() => {
        const storeConfig = storeConfigData?.storeConfig || {};

        return {
            customerAccessTokenLifetime:
            storeConfig.customer_access_token_lifetime
        };
    }, [storeConfigData]);

    const handleSubmit = useCallback(async () => {
        setIsCallMCardLogin(false);
        setPageLoading(true);

        try {
            // Get source cart id (guest cart id).
            const sourceCartId = cartId;

            if (isSignedIn) {
                await signOut({ revokeToken });

                dispatch({
                    type: 'USER_SIGN_OUT',
                    payload: {
                        ...currentUser
                    }
                });
            }

            const result = await fetchMCardLogin({
                variables: {
                    ...(hash ? { hash } : { token }),
                    store,
                    phone,
                    custNo,
                    custName,
                    custNoMM
                }
            });

            // if (!hash && !callbackUrl) {
            //     addToast({
            //         type: 'success',
            //         icon: CheckIcon,
            //         message: formatMessage({
            //             id: 'mCardLogin.redirectToHomePage',
            //             defaultMessage: 'Login successful. You will be redirected to the home page.'
            //         }),
            //         dismissable: true,
            //         timeout: 5000
            //     });
            // }

            const customerToken = result.data.generateLoginMcardInfo.customer_token;
            const storeViewCode = result?.data?.generateLoginMcardInfo?.store_view_code ? result.data.generateLoginMcardInfo.store_view_code : process.env.STORE_VIEW_CODE;
            const storeViewCodeUpdate = lang ? storeViewCode.replace(/_[a-z]{2}$/, `_${lang}`) : storeViewCode;

            if (!customerToken) {
                const storeInformationResult = await fetchStoreInformation({
                    variables: {
                        storeViewCode: storeViewCodeUpdate
                    }
                });
                if (storeInformationResult) {
                    storage.setItem('store', storeInformationResult.data)
                }
                storage.setItem('store_view_code', storeViewCodeUpdate);
                setPageLoading(false);

                if (lang && currentLanguage?.code && lang !== currentLanguage.code && availableLanguages?.length) {
                    const targetLangObj = availableLanguages.find(item => item.code === lang);
                    if (targetLangObj) {
                        handleSwitcherLanguage(targetLangObj, `/mcard/update-customer-email${search}`);
                    }
                } else {
                    history.push(`/mcard/update-customer-email${search}`);
                }
            } else {
                await (customerAccessTokenLifetime
                    ? setToken(customerToken, customerAccessTokenLifetime)
                    : setToken(customerToken));

                const storePromise = (async () => {
                    const storeInformationResult = await fetchStoreInformation({
                        variables: {
                            storeViewCode: storeViewCodeUpdate
                        }
                    });
                    if (storeInformationResult) {
                        storage.setItem('store', storeInformationResult.data)
                    }
                    storage.setItem('store_view_code', storeViewCodeUpdate);
                    storage.setItem('isAddressChanged', false);

                    try {
                        if (storeInformationResult?.data?.storeInformation?.name) {
                            ReactGA.event('login', {
                                category: "User",
                                label: 'MCard Login',
                                method: 'MCard',
                                store_id: store,
                                store_name: storeInformationResult?.data?.storeInformation?.name,
                            });
                        }
                    } catch {}
                })();

                // Ensure old stores are updated with any new data.
                const userPromise = (async () => {
                    await getUserDetails({ fetchUserDetails });

                    const { data } = await fetchUserDetails({
                        fetchPolicy: 'cache-only'
                    });

                    if (data?.customer) {
                        const customerPhoneNumber = data.customer.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || phone;
                        const currentDate = new Date().toISOString().split('T')[0];

                        const customerTrackInfo = {
                            "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                            "name": data.customer.firstname || '',
                            "phone": customerPhoneNumber,
                            "email": data.customer.email || '',
                            "customer_type": "B2C"
                        };

                        storage.setItem('lastAPICallDate', currentDate);

                        try {
                            window.web_event.track("user", "sign_in", {
                                dims: {
                                    customers: customerTrackInfo
                                },
                                extra: {
                                    "sign_in_method": "MCard"
                                }
                            });

                            window.web_event.track("user", "identify", {
                                dims: {
                                    customers: customerTrackInfo
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
                                message: 'MCardLogin error: !data?.customer'
                            }
                        });
                    }
                })();

                const cartPromise = (async () => {

                    // Clear all cart/customer data from cache and redux.
                    await apolloClient.clearCacheData(apolloClient, 'cart');
                    await apolloClient.clearCacheData(apolloClient, 'customer');
                    await removeCart();

                    // Create and get the customer's cart id.
                    await createCart({
                        fetchCartId
                    });

                    if (hash && !isSignedIn) {
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
                    }

                    // try {
                    //     await getCartDetails({ fetchCartId, fetchCartDetails });
                    // } catch (error) {
                    //     if (error?.message?.includes("The cart isn't active")) {
                    //         // Ignore this error
                    //     } else {
                    //         throw error; // Re-throw unexpected errors
                    //     }
                    // }
                })();

                await Promise.allSettled([storePromise, userPromise, cartPromise]);

                setPageLoading(false);

                let targetUrl = window.location.origin;
                if (hash) {
                    targetUrl += '/cart';
                } else if (callbackUrl) {
                    targetUrl = decodeURIComponent(callbackUrl);
                }
                if (lang && currentLanguage?.code && lang !== currentLanguage.code) {
                    const targetLangObj = availableLanguages.find(item => item.code === lang);
                    if (targetLangObj) {
                        handleSwitcherLanguage(targetLangObj, targetUrl);
                    } else {
                        window.location.href = targetUrl;
                    }
                } else {
                    window.location.href = targetUrl;
                }
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 5000
            });
            try {
                await writeLogClient({
                    variables: {
                        message: `MCardLogin error: msg - ${error?.message}. stack - ${error?.stack}`
                    }
                });
            } catch {}
            setPageLoading(false);

            if (lang && currentLanguage?.code && lang !== currentLanguage.code) {
                const targetLangObj = availableLanguages.find(item => item.code === lang);
                if (targetLangObj) {
                    handleSwitcherLanguage(targetLangObj, '/sign-in');
                }
            } else {
                history.push('/sign-in');
            }
        }
    }, [
        customerAccessTokenLifetime,
        cartId,
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
        fetchMCardLogin,
        callbackUrl,
        lang,
        currentLanguage,
        availableLanguages,
        handleSwitcherLanguage
    ]);
    useEffect(() => {
        const runLogin = async () => {
            if (isMCardPage && isCallMCardLogin && cartId) {
                await handleSubmit();
            }
        };

        runLogin();
    }, [isMCardPage, isCallMCardLogin, cartId]);

    if (pageLoading || loading) return fullPageLoadingIndicator

    return (
        <></>
    )
}

export default MCardLogin
