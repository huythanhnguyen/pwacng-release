import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/Header/accountMenu.gql";
import LOGIN_AS_CUSTOMER_OPERATIONS from "./loginAsCustomer.gql";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useApolloClient, useMutation, useQuery} from "@apollo/client";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import {GET_CART_DETAILS_QUERY} from "@magento/venia-ui/lib/components/SignIn/signIn.gql";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import ReactGA from "react-ga4";
import {retrieveCartId} from "@magento/peregrine/lib/store/actions/cart";
import CryptoJS from "crypto-js";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useToasts} from "@magento/peregrine";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon,
    Check
} from 'react-feather';
const CheckIcon = <Icon size={20} src={Check} />;
import {fullPageLoadingIndicator} from "@magento/venia-ui/lib/components/LoadingIndicator";
import {useIntl} from "react-intl";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const LoginAsCustomer = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    if (!currentPath.includes('/loginascustomer/login/index/secret/')) return null;

    const [, { addToast }] = useToasts();
    const storage = new BrowserPersistence();
    const operations = mergeOperations(DEFAULT_OPERATIONS, LOGIN_AS_CUSTOMER_OPERATIONS);
    const [ isLoginAsCustomer, setIsLoginAsCustomer ] = useState(true);
    const [ pageLoading, setPageLoading ] = useState(true);

    const token = currentPath.split('/secret/')[1].split('/')[0];
    const { formatMessage } = useIntl();

    const {
        signOutMutation,
        generateCustomerTokenBySecret,
        getStoreConfigQuery,
        createCartMutation,
        getCustomerQuery
    } = operations;

    const userContext = useUserContext();
    const apolloClient = useApolloClient();

    const [
        { currentUser, isGettingDetails, getDetailsError, isSignedIn },
        { getUserDetails, setToken, signOut }
    ] = userContext;

    const cartContext = useCartContext();
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = cartContext;

    const [fetchCartId] = useMutation(createCartMutation);
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(GET_CART_DETAILS_QUERY);
    const eventingContext = useEventingContext();
    const [, { dispatch }] = eventingContext;
    const storeCode = storage.getItem('store')?.storeInformation?.source_code?.replace('b2c_', '') || '';
    const storeName = storage.getItem('store')?.storeInformation?.name || '';

    const history = useHistory();
    const [revokeToken] = useMutation(signOutMutation);
    const [fetchLoginAsCustomer, {data, loading, error} ] = useMutation(generateCustomerTokenBySecret);
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

    const handleSubmit = useCallback(async () => {
        setIsLoginAsCustomer(false);
        setPageLoading(true);

        try {
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

            const result = await fetchLoginAsCustomer({
                variables: {
                    input: {
                        secret: token
                    }
                }
            });

            const customerToken = result.data.generateCustomerTokenBySecret.customer_token;

            storage.setItem('isAddressChanged', false);

            ReactGA.event('login',{
                category: "User",
                label: 'MCard Login',
                method: 'MCard',
                store_id: storeCode,
                store_name: storeName
            });

            await (customerAccessTokenLifetime
                ? setToken(customerToken, customerAccessTokenLifetime)
                : setToken(customerToken));

            // Clear all cart/customer data from cache and redux.
            await apolloClient.clearCacheData(apolloClient, 'cart');
            await apolloClient.clearCacheData(apolloClient, 'customer');
            await removeCart();

            // Create and get the customer's cart id.
            await createCart({
                fetchCartId
            });

            // Ensure old stores are updated with any new data.

            await getUserDetails({ fetchUserDetails });

            const { data } = await fetchUserDetails({
                fetchPolicy: 'cache-only'
            });

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
                        "sign_in_method": "MCard"
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

            addToast({
                type: 'success',
                icon: CheckIcon,
                message: formatMessage({
                        id: 'loginAsCustomer.message',
                        defaultMessage: 'Bạn đã đăng nhập với tư cách là khách hàng: {value}'
                    },
                    { value: data?.customer?.email || '' }),
                dismissable: true,
                timeout: 5000
            });

            try {
                await getCartDetails({ fetchCartId, fetchCartDetails });
            } catch (error) {
                if (error?.message?.includes("The cart isn't active")) {
                    // Ignore this error
                } else {
                    throw error; // Re-throw unexpected errors
                }
            }

            setPageLoading(false);
            window.location.href = window.location.origin
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 5000
            });
            setPageLoading(false);
            history.push('/sign-in');
        }
    }, [
        customerAccessTokenLifetime,
        cartId,
        setToken,
        apolloClient,
        removeCart,
        createCart,
        fetchCartId,
        getUserDetails,
        fetchUserDetails,
        getCartDetails,
        fetchCartDetails,
        dispatch,
        fetchLoginAsCustomer
    ]);

    useEffect(async () => {
        if (isLoginAsCustomer && cartId) {
            await handleSubmit();
        }
    }, [isLoginAsCustomer, cartId]);

    if (pageLoading || loading) return fullPageLoadingIndicator

    return (
        <></>
    )
}

export default LoginAsCustomer
