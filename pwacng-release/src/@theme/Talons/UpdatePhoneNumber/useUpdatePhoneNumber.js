import {useApolloClient, useMutation, useQuery} from "@apollo/client";
import {useCallback, useEffect, useMemo, useState} from "react";
import {retrieveCartId} from "@magento/peregrine/lib/store/actions/cart";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import {GET_CART_DETAILS_QUERY} from "@magento/venia-ui/lib/components/SignIn/signIn.gql";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "../SocialLogin/socialLogin.gql";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useHistory, useLocation} from "react-router-dom";
import ReactGA from "react-ga4";
import CryptoJS from "crypto-js";

const UseUpdatePhoneNumber = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const storage = new BrowserPersistence();
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
    const [
        { isGettingDetails, getDetailsError },
        { getUserDetails, setToken }
    ] = userContext;
    const history = useHistory();
    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const socialInfo = storage.getItem('social_info');

    const [{ isSignedIn }] = useUserContext();
    const redirectUrl = query.get('referer') ? atob(query.get('referer')) : '/dashboard';

    // Redirect if user is signed in
    useEffect(() => {
        if (isSignedIn && redirectUrl) {
            history.push(redirectUrl);
        }
    }, [history, isSignedIn, redirectUrl]);

    const cartContext = useCartContext();
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = cartContext;

    const [fetchSocialCreate] = useMutation(socialCreateMutation, {
        fetchPolicy: 'no-cache'
    });

    const [fetchSocialLogin] = useMutation(socialLoginMutation, {
        fetchPolicy: 'no-cache'
    });

    const { data: storeConfigData } = useQuery(getStoreConfigQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts] = useMutation(mergeCartsMutation);
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(GET_CART_DETAILS_QUERY);
    const eventingContext = useEventingContext();
    const [, { dispatch }] = eventingContext;
    const storeName = storage.getItem('store')?.storeInformation?.name || '';
    const storeCode = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';

    const { customerAccessTokenLifetime } = useMemo(() => {
        const storeConfig = storeConfigData?.storeConfig || {};

        return {
            customerAccessTokenLifetime:
            storeConfig.customer_access_token_lifetime
        };
    }, [storeConfigData]);

    const handleSubmit = useCallback(async formValues => {
        if (!socialInfo) return;

        try {
            // Get source cart id (guest cart id).
            const sourceCartId = cartId;

            const createResponse = await fetchSocialCreate({
                variables: {
                    ...socialInfo,
                    custom_attributes: [
                        {
                            attribute_code: "company_user_phone_number",
                            value: formValues.telephone
                        }
                    ]
                }
            });

            const token = createResponse.data.socialLogin.token;
            storage.setItem('isAddressChanged', false);

            try {
                window.web_event.track("user", "sign_up", {
                    dims: {
                        customers: {
                            "customer_id": CryptoJS.MD5(formValues.telephone).toString(), // MD5(phone)
                            "name": socialInfo.user_info.firstname,
                            "phone": formValues.telephone,
                            "email": socialInfo.user_info.email,
                            "customer_type": "B2C"
                        }
                    },
                    extra: {
                        "sign_up_method": socialInfo.provider
                    }
                });

                ReactGA.event('signup', {
                    category: "User",
                    label: 'Social SignUp',
                    method: "Social",
                    store_id: storeCode,
                    store_name: storeName
                });
            } catch (error) {
                console.log(error);
            }

            storage.removeItem('social_info');

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

            dispatch({
                type: 'USER_SIGN_IN',
                payload: {
                    ...data.customer
                }
            });

            getCartDetails({ fetchCartId, fetchCartDetails });
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
        handleSubmit
    }
}

export default UseUpdatePhoneNumber
