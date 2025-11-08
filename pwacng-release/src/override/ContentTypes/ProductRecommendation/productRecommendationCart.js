import React, {useState, useEffect} from "react";
import { useQuery } from '@apollo/client';
import GET_PRODUCTS_RECOMMENDATION from "./productRecommendation.gql";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import CryptoJS from "crypto-js";

const useProductRecommendationCart = ({artNoList, cartSubtotal, cartItemCount}) => {
    const [{ isSignedIn, currentUser }] = useUserContext();
    const phoneNumber = isSignedIn ? currentUser?.custom_attributes?.find(item => item.code === 'company_user_phone_number')?.value || null : null;
    const currentURL = window.location.href;

    const shouldSkip = !artNoList || artNoList.length === 0;

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const asmUid = getCookie('_asm_uid') || localStorage.getItem('_asm_uid') || '';
    const items = !!artNoList ? {
        art_no: artNoList
    } : null;
    const extra = {
        page_type: null,
        page_category: null,
        location_url: currentURL,
        cart_subtotal: cartSubtotal,
        cart_item_count: cartItemCount
    };

    const { loading, error, data } = useQuery(GET_PRODUCTS_RECOMMENDATION, {
            variables: {
                asmUid,
                asmJourneyId: "38214403",
                pageSize: 12,
                dims: { phone_number: phoneNumber },
                items,
                extra,
                ec: "product",
                ea: "view_cart"
            },
            skip: shouldSkip,
            fetchPolicy: 'no-cache'
        }
    );

    const productItems = !error && data?.productsV2?.items ? data.productsV2.items : [];

    useEffect(() => {
        if (data?.productsV2?.globalTracking?.impression) {
            try {
                window.web_event.trackEventWithUri(data.productsV2.globalTracking.impression);
            } catch (error) {
                console.log(error);
            }
        }
    },[data])

    return {
        data,
        items: productItems,
        loading
    }
};

export default useProductRecommendationCart;
