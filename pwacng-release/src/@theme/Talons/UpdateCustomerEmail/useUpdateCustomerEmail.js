import React, {useCallback, useMemo} from "react";
import MCARD_OPERATIONS from '@magenest/theme/BaseComponents/MCardLogin/mCardLogin.gql';
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/Header/accountMenu.gql";
import {useApolloClient, useMutation, useQuery} from "@apollo/client";
import { useToasts } from '@magento/peregrine';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
import {useLocation} from "react-router-dom";
import {retrieveCartId} from "@magento/peregrine/lib/store/actions/cart";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import {GET_CART_DETAILS_QUERY} from "@magento/venia-ui/lib/components/SignIn/signIn.gql";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const UseUpdateCustomerEmail = props => {
    const storage = new BrowserPersistence();

    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const phone = query.get('phone');
    const custNo = query.get('cust_no');
    const custName = query.get('cust_name');
    const custNoMM = query.get('cust_no_mm');

    const operations = mergeOperations(DEFAULT_OPERATIONS, MCARD_OPERATIONS);
    const {
        getStoreConfigQuery,
        createCartMutation,
        mergeCartsMutation,
        getCustomerQuery,
        createCustomerFromMCard,
        signOutMutation
    } = operations;

    const [, { addToast }] = useToasts();

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

    const [revokeToken] = useMutation(signOutMutation);
    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(GET_CART_DETAILS_QUERY);
    const eventingContext = useEventingContext();
    const [, { dispatch }] = eventingContext;
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';

    const [fetchCreateCustomerFormMCard, {loading}] = useMutation(createCustomerFromMCard);

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

    const handleSubmit = useCallback(async (values) => {
        try {
            const sourceCartId = cartId;

            const result = await fetchCreateCustomerFormMCard({
                variables: {
                    input: {
                        email: values.email,
                        firstname: custName,
                        lastname: '',
                        is_subscribed: false,
                        custom_attributes: [
                            {
                                attribute_code: 'company_user_phone_number',
                                value: phone
                            },
                            {
                                attribute_code: 'customer_no',
                                value: custNoMM
                            },
                            {
                                attribute_code: 'mcard_no',
                                value: custNo
                            }
                        ]
                    }
                }
            });

            if (result?.data?.createCustomerFromMcard?.customer_token) {
                const customerToken = result.data.createCustomerFromMcard.customer_token;

                storage.setItem('isAddressChanged', false);

                try {
                    window.web_event.track("user", "sign_up", {
                        dims: {
                            customers: {
                                "customer_id": CryptoJS.MD5(phone).toString(), // MD5(phone)
                                "name": custName,
                                "phone": phone,
                                "email": values.email,
                                "customer_type": "B2C"
                            }
                        },
                        extra: {
                            "sign_up_method": "MCard"
                        }
                    });

                    ReactGA.event('signup', {
                        category: "User",
                        label: 'MCard Signup',
                        store_id: storeCode,
                        store_name: storeName,
                        method: "MCard"
                    });
                } catch (error) {
                    console.log(error);
                }

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

                dispatch({
                    type: 'USER_SIGN_IN',
                    payload: {
                        ...data.customer
                    }
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

                window.location.href = window.location.origin
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
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
        dispatch
    ]);

    return {
        handleSubmit,
        loading
    }
}

export default UseUpdateCustomerEmail
