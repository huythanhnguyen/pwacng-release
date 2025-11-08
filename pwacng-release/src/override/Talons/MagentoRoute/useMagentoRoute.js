import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { useRootComponents } from '@magento/peregrine/lib/context/rootComponents';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { getComponentData } from '@magento/peregrine/lib/util/magentoRouteData';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { getRootComponent, isRedirect } from '@magento/peregrine/lib/talons/MagentoRoute/helpers';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/MagentoRoute/magentoRoute.gql';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import CryptoJS from "crypto-js";
import {useUserContext} from "@magento/peregrine/lib/context/user";

const getInlinedPageData = () => {
    return globalThis.INLINED_PAGE_TYPE && globalThis.INLINED_PAGE_TYPE.type
        ? globalThis.INLINED_PAGE_TYPE
        : null;
};

const resetInlinedPageData = () => {
    globalThis.INLINED_PAGE_TYPE = false;
};

export const useMagentoRoute = (props = {}) => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { resolveUrlQuery } = operations;
    const { replace } = useHistory();
    const { pathname } = useLocation();
    const [pathnameCheck, setPathnameCheck] = useState('');
    const [componentMap, setComponentMap] = useRootComponents();
    const storage = new BrowserPersistence();
    const storeCodeStorage = storage.getItem('store')?.storeInformation?.source_code.replace('b2c_', '') || '';
    const languageCode = storage.getItem('language')?.key || 'VN';
    const storeName = storage.getItem('store')?.storeInformation?.name || ''

    const initialized = useRef(false);
    const fetchedPathname = useRef(null);

    const [appState, appApi] = useAppContext();
    const { actions: appActions } = appApi;
    const { nextRootComponent } = appState;
    const { setNextRootComponent, setPageLoading } = appActions;

    const setComponent = useCallback(
        (key, value) => {
            setComponentMap(prevMap => new Map(prevMap).set(key, value));
        },
        [setComponentMap]
    );

    const component = componentMap.get(pathname);

    const [runQuery, queryResult] = useLazyQuery(resolveUrlQuery);

    // destructure the query result
    const { data, error, loading } = queryResult;
    const [getRouteData, setRouteData] = useState(data);
    const { route } = getRouteData || {};
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [ isPageView, setIsPageView ] = useState(false);

    // redirect to external url
    useEffect(() => {
        if (route) {
            const external_URL = route.relative_url;
            if (external_URL && external_URL.startsWith('http')) {
                window.location.replace(external_URL);
            }
        }
    }, [route]);

    useEffect(() => {
        let isMounted = true; // Track whether the component is still mounted
        const runInitialQuery = async () => {
            try {
                if (pathname === '/') {
                    const data = {
                        "route": {
                            "__typename": "CmsPage",
                            "relative_url": "home",
                            "redirect_code": 0,
                            "type": "CMS_PAGE",
                            "identifier": "home"
                        }
                    }

                    if (isMounted) {
                        fetchedPathname.current = pathname;
                        setRouteData(data);
                    }
                } else {
                    const { data } = await runQuery({
                        fetchPolicy: 'cache-and-network',
                        nextFetchPolicy: 'cache-first',
                        variables: { url: pathname }
                    });

                    if (isMounted) {
                        fetchedPathname.current = pathname;
                        setRouteData(data);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error running initial query:', error);
                }
            }
        };
        if (initialized.current || !getInlinedPageData()) {
            runInitialQuery();
        }
        // Cleanup function
        return () => {
            isMounted = false; // Mark as unmounted
        };
    }, [initialized, pathname, runQuery]);
    // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (component) {
            return;
        }

        (async () => {
            const { type, ...routeData } = route || {};
            const { id, identifier, uid } = routeData || {};
            const isEmpty = !id && !identifier && !uid;

            if (!type || isEmpty) {
                return;
            }

            try {
                const rootComponent = await getRootComponent(type);
                setComponent(pathname, {
                    component: rootComponent,
                    ...getComponentData(routeData),
                    type
                });
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }

                setComponent(pathname, error);
            }
        })();
    }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

    const { id, identifier, uid, redirect_code, relative_url, type } =
        route || {};

    // evaluate both results and determine the response type
    const empty = !route || !type || (!id && !identifier && !uid);
    const redirect = isRedirect(redirect_code);
    const fetchError = component instanceof Error && component;
    const routeError = fetchError || error;
    const isInitialized = initialized.current || !getInlinedPageData();

    let showPageLoader = false;
    let routeData;

    if (component && !fetchError) {
        // FOUND
        routeData = component;
    } else if (routeError) {
        // ERROR
        routeData = { hasError: true, routeError };
    } else if (empty && fetchedPathname.current === pathname && !loading) {
        // NOT FOUND
        routeData = { isNotFound: true };
    } else if (nextRootComponent) {
        // LOADING with full page shimmer
        showPageLoader = true;
        routeData = { isLoading: true, shimmer: nextRootComponent };
    } else if (redirect) {
        // REDIRECT
        routeData = {
            isRedirect: true,
            relativeUrl: relative_url.startsWith('/')
                ? relative_url
                : '/' + relative_url
        };
    } else {
        // LOADING
        const isInitialLoad = !isInitialized;
        routeData = { isLoading: true, initial: isInitialLoad };
    }

    useEffect(() => {
        (async () => {
            const inlinedData = getInlinedPageData();
            if (inlinedData) {
                try {
                    const componentType = inlinedData.type;
                    const rootComponent = await getRootComponent(componentType);
                    setComponent(pathname, {
                        component: rootComponent,
                        type: componentType,
                        ...getComponentData(inlinedData)
                    });
                } catch (error) {
                    setComponent(pathname, error);
                }
            }
            initialized.current = true;
        })();

        return () => {
            // Unmount
            resetInlinedPageData();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // perform a redirect if necesssary
    useEffect(() => {
        if (routeData && routeData.isRedirect) {
            replace(routeData.relativeUrl);
        }
    }, [pathname, replace, routeData]);

    useEffect(() => {
        if (component) {
            // Reset loading shimmer whenever component resolves
            setNextRootComponent(null);
        }
    }, [component, pathname, setNextRootComponent]);

    useEffect(() => {
        setPageLoading(showPageLoader);
    }, [showPageLoader, setPageLoading]);



    useEffect(() => {
        try {
            let _cdp365Analytics = window._cdp365Analytics  || {};
            _cdp365Analytics.default_event = 0

            if ((pathnameCheck === '' || pathnameCheck !== pathname) && window._cdp365Analytics && !routeData.isLoading) {
                if (routeData && routeData.type && routeData.type !== 'CMS_PAGE') {
                    if (routeData.type === 'CATEGORY') {
                        const formattedUrl = pathname.replace(/^\/|\.html$/g, '');

                        _cdp365Analytics.page = {
                            "page_type": formattedUrl,
                            "page_category": formattedUrl
                        };
                    } else {
                        _cdp365Analytics.page = {
                            "page_type": routeData.type,
                            "page_category": routeData.type
                        };
                    }
                } else {
                    const pathnameCurrent = [
                        {
                            pathname: '/cart',
                            page_type: 'CART'
                        },
                        {
                            pathname: '/checkout',
                            page_type: 'CHECKOUT'
                        },
                        {
                            pathname: '/sign-in',
                            page_type: 'SIGN IN'
                        },
                        {
                            pathname: '/create-account',
                            page_type: 'SIGN UP'
                        },
                        {
                            pathname: '/forgot-password',
                            page_type: 'FORGOT PASSWORD'
                        },
                        {
                            pathname: '/dashboard',
                            page_type: 'DASHBOARD'
                        },
                        {
                            pathname: '/account-information',
                            page_type: 'ACCOUNT INFORMATION'
                        },
                        {
                            pathname: '/address-book',
                            page_type: 'ADDRESS BOOK'
                        },
                        {
                            pathname: '/order-history',
                            page_type: 'ORDER HISTORY'
                        },
                        {
                            pathname: '/wishlist',
                            page_type: 'WISHLIST'
                        },
                        {
                            pathname: '/order-tracking',
                            page_type: 'ORDER TRACKING'
                        },
                        {
                            pathname: '/faq',
                            page_type: 'FAQ'
                        },
                        {
                            pathname: '/contact-us',
                            page_type: 'CONTACT US'
                        },
                        {
                            pathname: '/store-locator',
                            page_type: 'STORE LOCATOR'
                        }
                    ]

                    if (pathname === '/') {
                        _cdp365Analytics.page = {
                            "page_type": 'HOME',
                            "page_category": 'HOME'
                        };
                    } else {
                        pathnameCurrent.forEach(item => {
                            if (pathname.includes(item.pathname)) {
                                _cdp365Analytics.page = {
                                    "page_type": item.page_type,
                                    "page_category": item.page_type
                                };
                            }
                        });
                    }
                }

                _cdp365Analytics.dims = window._cdp365Analytics.dims || {};
                _cdp365Analytics.dims.users = window._cdp365Analytics.dims.users || {};
                _cdp365Analytics.dims.users.language = languageCode; // current chosen language

                _cdp365Analytics.dims.store = window._cdp365Analytics.dims.store || {};
                _cdp365Analytics.dims.store.id = storeCodeStorage; // current store code
                _cdp365Analytics.dims.store.name = storeName; // current store name

                _cdp365Analytics.extra = window._cdp365Analytics.extra || {};
                _cdp365Analytics.extra.language = languageCode;


                setIsPageView(true);
                window.web_event.track("pageview", "view");

                setPathnameCheck(pathname)
            }
        } catch (error) {
            console.log(error);
        }
    }, [routeData, pathname, storeName, languageCode, storeCodeStorage]);

    useEffect(() => {
        try {
            const lastAPICall = storage.getItem('lastAPICallDate');
            const currentDate = new Date().toISOString().split('T')[0];

            if (isSignedIn && isPageView && currentUser?.firstname && lastAPICall !== currentDate) {
                const customerPhoneNumber = currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || 0;

                storage.setItem('lastAPICallDate', currentDate);

                window.web_event.track("user", "identify", {
                    dims: {
                        customers: {
                            "customer_id": CryptoJS.MD5(customerPhoneNumber).toString(), // MD5(phone)
                            "name": currentUser.firstname,
                            "email": currentUser.email,
                            "phone": customerPhoneNumber,
                            "customer_type": "B2C"
                        }
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }, [isSignedIn, currentUser, isPageView]);

    return routeData;
};
