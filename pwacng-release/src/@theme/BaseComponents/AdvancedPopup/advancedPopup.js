import React, {useEffect, useCallback} from "react";
import { useMagentoRoute } from '@magento/peregrine/lib/talons/MagentoRoute';
import { useLazyQuery } from '@apollo/client';
import GET_POPUP from "./advancedPopup.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './advancedPopup.module.scss';
import ContentPopup from "./contentPopup";

const AdvancedPopup = props => {
    const talonProps = useMagentoRoute();
    const {
        component: RootComponent,
        isLoading,
        isNotFound,
        isRedirect,
        shimmer,
        initial,
        ...componentData
    } = talonProps;

    const classes = useStyle(defaultClasses, props.classes);

    const uid = componentData?.type === 'CATEGORY' ? componentData.uid : "";
    const urlKey = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';

    const [fetchPopup, { data, error, loading }] = useLazyQuery(GET_POPUP);
    const fetchPopupCallback = useCallback(() => {
        if (!isLoading && !isRedirect) {
            fetchPopup({
                variables: {
                    category_uid: uid,
                    link_popup: urlKey
                }
            });
        }
    }, [isLoading, isRedirect, uid, urlKey, fetchPopup]);
    useEffect(() => {
        fetchPopupCallback();
    }, [fetchPopupCallback]);

    if (isLoading || isRedirect) return null;
    if (loading || error) return null;

    const popups = Array.isArray(data?.getPopup) ? data.getPopup : [];
    return (
        <>
            {popups.length > 0 && popups.map((item, index) => (
                <ContentPopup popupData={item} key={index} />
            ))}
        </>
    );
};

export default AdvancedPopup;
