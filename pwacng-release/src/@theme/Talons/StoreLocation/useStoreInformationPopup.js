import {useAppContext} from "@magento/peregrine/lib/context/app";
import {useCallback, useEffect, useMemo} from "react";
import {useLazyQuery, useQuery} from "@apollo/client";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useLocation} from "react-router-dom";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/Header/storeSwitcher.gql";
import {GET_STORE_INFORMATION_QUERY} from "./storeLocation.gql";

const DRAWER_NAME = 'storeInformation';

const mapAvailableOptions = (config, stores) => {
    const { store_code: configCode } = config;

    return stores.reduce((map, store) => {
        const {
            default_display_currency_code: currency,
            locale,
            secure_base_media_url,
            store_code: storeCode,
            store_group_code: storeGroupCode,
            store_group_name: storeGroupName,
            store_name: storeName,
            store_sort_order: sortOrder
        } = store;

        const isCurrent = storeCode === configCode;
        const option = {
            currency,
            isCurrent,
            locale,
            secure_base_media_url,
            sortOrder,
            storeCode,
            storeGroupCode,
            storeGroupName,
            storeName
        };

        return map.set(storeCode, option);
    }, new Map());
};

const UseStoreInformationPopup = props => {
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;
    const storage = new BrowserPersistence();
    const { pathname, search: searchParams } = useLocation();
    const { availableRoutes = [], storeViewData, storeInformation } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const {
        getRouteData
    } = operations;

    const internalRoutes = useMemo(() => {
        return availableRoutes.map(path => {
            if (path.exact) {
                return path.pattern;
            }
        });
    }, [availableRoutes]);

    const [fetchStoreInformation] = useLazyQuery(GET_STORE_INFORMATION_QUERY, {
        fetchPolicy: 'no-cache'
    });

    const fetchRouteData = useAwaitQuery(getRouteData);

    const handleClose = useCallback(() => {
        toggleDrawer('storeLocation');
    }, [toggleDrawer]);

    const getPathname = useCallback(
        async storeCode => {
            if (pathname === '' || pathname === '/') return '';
            let newPath = '';
            if (internalRoutes.includes(pathname)) {
                newPath = pathname;
            } else {
                const { data: routeData } = await fetchRouteData({
                    fetchPolicy: 'no-cache',
                    variables: {
                        url: pathname
                    },
                    context: { headers: { store: storeCode } }
                });
                if (routeData.route) {
                    newPath = routeData.route.relative_url;
                }
            }
            return newPath.startsWith('/') ? newPath.substr(1) : newPath;
        },
        [pathname, fetchRouteData, internalRoutes]
    );

    const handleSwitchStore = useCallback(
        // Change store view code and currency to be used in Apollo link request headers
        async (storeCode) => {
            // Do nothing when store view is not present in available stores
            if (!storeCode) return;

            const resultStoreInformation =  await fetchStoreInformation({
                variables: {
                    storeViewCode: storeCode
                }
            });

            storage.setItem('store_view_code', storeCode);
            storage.setItem('store', resultStoreInformation.data);

            const customerAddressData = sessionStorage.getItem('customerAddressData');
            sessionStorage.removeItem('customerAddressData');
            if (customerAddressData) {
                storage.setItem('customer_address', JSON.parse(customerAddressData));
            }

            const hasChatbot = typeof document !== 'undefined' && document.body.classList.contains('chatbotOpened')

            const pathName = await getPathname(storeCode);
            const newPath = (pathName === 'sign-in' && hasChatbot) ? '/' : (pathName ? `/${pathName}${searchParams}` : '');
            let target = process.env.USE_STORE_CODE_IN_URL === 'true' ? `/${storeCode}${newPath || ''}` : `${newPath || '/'}`;
            const url = new URL(target, globalThis.location.origin);

            if (hasChatbot) url.searchParams.set('chatbot', 'true');

            globalThis.location.assign(`${url.pathname}${url.search}${url.hash}`);
        },
        [getPathname, searchParams, storeViewData, storeInformation]
    );

    return {
        isOpen,
        handleClose,
        handleSwitchStore
    }
}

export default UseStoreInformationPopup
