import React, { useMemo, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
export { default as HeadProvider } from '@magento/venia-ui/lib/components/Head/headProvider';
import { Helmet } from 'react-helmet-async';
import {BrowserPersistence} from "@magento/peregrine/lib/util";
import {useLocation} from "react-router-dom";

Helmet.defaultProps.defer = false;

const storage = new BrowserPersistence();

export const Link = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <link {...tagProps}>{children}</link>
        </Helmet>
    );
};

export const Meta = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <meta {...tagProps}>{children}</meta>
        </Helmet>
    );
};

export const Style = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <style {...tagProps}>{children}</style>
        </Helmet>
    );
};

export const Title = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <title {...tagProps}>{children}</title>
        </Helmet>
    );
};

const STORE_NAME_QUERY = gql`
    query getStoreName {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            store_name
        }
    }
`;

export const StoreTitle = props => {
    const {
        children,
        isLazyContent = true,
        ...tagProps
    } = props;

    if (isLazyContent) {
        if (children) {
            return (
                <Helmet>
                    <title {...tagProps}>{`${children} - MM Mega Market`}</title>
                </Helmet>
            );
        }
        return (
            <Helmet>
                <title {...tagProps}>{'MM Mega Market'}</title>
            </Helmet>
        );
    }

    const { data: storeNameData, error: storeNameError } = useQuery(STORE_NAME_QUERY, {
        fetchPolicy: 'cache-and-network'
    });

    useEffect(() => {
        const sessionFlag = sessionStorage.getItem('store_check_done');
        const storeCode = storage.getItem('store_view_code');

        if (!sessionFlag && storeCode && storeNameError) {
            console.error('Store Name Query Error:', storeNameError);
            storage.removeItem('store_view_code');
            sessionStorage.setItem('store_check_done', 'true');
            window.location.reload();
        }
    }, [storeNameError]);

    const storeName = useMemo(() => {
        return storeNameData
            ? storeNameData.storeConfig.store_name
            : STORE_NAME;
    }, [storeNameData]);

    let titleText;
    if (children) {
        titleText = `${children} - ${storeName}`;
    } else {
        titleText = storeName;
    }

    return (
        <Helmet>
            <title {...tagProps}>{titleText}</title>
        </Helmet>
    );
};
