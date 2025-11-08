import React, {useEffect, useState} from 'react';
import { useQuery } from '@apollo/client';
import defaultClasses from './storeLocator.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import StaticBreadcrumbs from "../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import {FormattedMessage, useIntl} from "react-intl";

import { GET_STORE_LOCATOR } from './storeLocator.gql';
import StoreItem from "./storeItem";
import StoreFilter from "./storeFilter";
import StoreMap from "./storeMap";

const StoreLocatorPage = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const searchParams = new URLSearchParams(location.search);
    const storeSourceDefault = searchParams.get('source') || null;

    const [storeCount, setStoreCount] = useState(0);
    const [storeCurrent, setStoreCurrent] = useState(null);
    const [storeSource, setStoreSource] = useState(storeSourceDefault);
    const [storeCity, setStoreCity] = useState();
    const [storeWard, setStoreWard] = useState();

    const { data: storeData, error: storeError, loading: storeLoading, refetch: storeRefetch } = useQuery(GET_STORE_LOCATOR, {
        variables: {
            ...(storeSource && { store_source_type: Number(storeSource) }),
            ...(storeCity && { store_city: Number(storeCity) }),
            ...(storeWard && { store_ward: Number(storeWard) })
        },
    });
    useEffect(() => {
        storeRefetch({
            ...(storeSource && { store_source_type: Number(storeSource) }),
            ...(storeCity && { store_city: Number(storeCity) }),
            ...(storeWard && { store_ward: Number(storeWard) })
        });
    }, [storeSource, storeCity, storeWard, storeRefetch]);
    useEffect(() => {
        setStoreCount(storeData?.StoreLocators?.length || 0)
    }, [storeData]);

    const handleStoreSelect = (store) => {
        setStoreCurrent(store);
    };

    return (
        <>
            <StaticBreadcrumbs pageTitle={
                formatMessage(
                    {
                        id: "global.storeLocatorTitle",
                        defaultMessage: 'Store List'
                    }
                )
            } />
            <div className={classes.root}>
                <div className={classes.pageTitleWrapper}>
                    <div className={classes.pageTitle}>
                        <strong>
                            <FormattedMessage
                                id={'global.storeLocatorTitle'}
                                defaultMessage={'Store List'}
                            />
                        </strong>
                        <span className={classes.count}>
                            {`(${storeCount} `}
                            <FormattedMessage
                                id={'storeLocator.store'}
                                defaultMessage={storeCount > 1 ? 'Stores' : 'Store'}
                            />
                            {')'}
                        </span>
                    </div>
                    <div className={classes.storeFilter}>
                        <StoreFilter
                            storeSourceDefault={storeSourceDefault}
                            setStoreSource={setStoreSource}
                            setStoreCity={setStoreCity}
                            setStoreWard={setStoreWard}
                        />
                    </div>
                </div>
                <div className={classes.storeListWrapper}>
                    <div className={classes.storeListContainer}>
                        <div className={classes.storeList}>
                            <ul>
                                {storeData?.StoreLocators?.length > 0 ? (
                                    storeData.StoreLocators.map((item, index) => (
                                        <StoreItem store={item} key={index} onSelect={handleStoreSelect}/>
                                    ))
                                ) : (
                                    <li className={classes.noResult}>
                                        <span>
                                            <FormattedMessage
                                                id={'storeLocator.noResult'}
                                                defaultMessage={'No stores found'}
                                            />
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className={classes.mapContainer}>
                        <div className={classes.map}>
                            <StoreMap stores={storeData?.StoreLocators || []} storeCurrent={storeCurrent} setStoreCurrent={setStoreCurrent}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StoreLocatorPage;
