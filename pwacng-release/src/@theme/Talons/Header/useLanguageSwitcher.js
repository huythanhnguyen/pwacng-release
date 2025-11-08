import {useCallback, useEffect, useMemo, useState} from "react";
import {useIntl} from "react-intl";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {useLazyQuery, useQuery} from "@apollo/client";
import {useAwaitQuery} from "@magento/peregrine/lib/hooks/useAwaitQuery";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/Header/storeSwitcher.gql";
import {useLocation} from "react-router-dom";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import {GET_STORE_INFORMATION_QUERY} from "../StoreLocation/storeLocation.gql";

const DRAWER_NAME = 'language';

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

const UseLanguageSwitcher = props => {
    const {
        availableRoutes
    } = props;

    const { isDesktop } = useMediaCheck();
    const [ isOpenMobile, setIsOpenMobile ] = useState(false);
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const currentLanguage = storage.getItem('language');
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;
    const { pathname, search: searchParams } = useLocation();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const {
        getRouteData
    } = operations;

    const availableLanguages = [
        {
            label: formatMessage({
                id: 'language.english',
                defaultMessage:
                    'English'
            }),
            key: 'EN',
            code: 'en'
        },
        {
            label: formatMessage({
                id: 'language.vietnamese',
                defaultMessage:
                    'Vietnamese'
            }),
            key: 'VN',
            code: 'vi'
        }
    ]

    const internalRoutes = useMemo(() => {
        return availableRoutes.map(path => {
            if (path.exact) {
                return path.pattern;
            }
        });
    }, [availableRoutes]);

    const [fetchStoreInformation] = useLazyQuery(GET_STORE_INFORMATION_QUERY);

    const fetchRouteData = useAwaitQuery(getRouteData);

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

    const handleSwitcherLanguage = useCallback(async (code, targetRedirect = null) => {
        if (code) {
            const storeCode = storage.getItem('store_view_code');

            if (!storeCode) return;

            storage.setItem('language', code);

            storage.setItem('store_view_code', `${storeCode.slice(0, -2)}${code.code}`);

            const result =  await fetchStoreInformation({
                variables: {
                    storeViewCode: `${storeCode.slice(0, -2)}${code.code}`
                }
            });

            if (result) {
                storage.setItem('store', result.data)
            }

            if (targetRedirect) {
                globalThis.location.assign(targetRedirect);
            } else {
                const pathName = await getPathname(storeCode);

                const newPath = pathName ? `/${pathName}${searchParams}` : '';

                if (process.env.USE_STORE_CODE_IN_URL === 'true') {
                    globalThis.location.assign(`/${storeCode}${newPath || ''}`);
                } else {
                    window.location.reload();
                }
            }

            closeDrawer(DRAWER_NAME)

        }
    }, [closeDrawer, getPathname, searchParams]);

    useEffect(async () => {
        if (!storage.getItem('language')) {
            const storeViewCode = storage.getItem('store_view_code') ? storage.getItem('store_view_code') : process.env.STORE_VIEW_CODE;

            availableLanguages.map(item => {
                if (item.code === storeViewCode.split('_').pop()) {
                    storage.setItem('language', item);
                }
            });
        }
    }, [storage.getItem('language')]);

    const handleTriggerClick = useCallback(() => {
        isDesktop ? toggleDrawer(DRAWER_NAME) : setIsOpenMobile(!isOpenMobile);
    }, [toggleDrawer, isDesktop, isOpenMobile])

    return {
        availableLanguages,
        handleSwitcherLanguage,
        handleTriggerClick,
        currentLanguage,
        isOpen: isDesktop ? isOpen : isOpenMobile
    }
}

export default UseLanguageSwitcher
