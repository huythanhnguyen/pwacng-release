import React, {Suspense, useState} from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_BY_SKU } from '../Product/products.gql';
import Gallery from "@magento/venia-ui/lib/components/Gallery";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import {useHistory} from "react-router-dom";

const ProductGalleryBySkus = props => {
    const {
        skus,
        classes,
        handleShowFrame,
        handleChatbotOpened,
        setSignInRedirect
    } = props;

    const { data } = useQuery(GET_PRODUCTS_BY_SKU, {
        variables: { skus, pageSize: 20 },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first"
    });

    const items = data?.products?.items || [];

    if (!items?.length) return null;

    return (
        <Gallery items={items} classes={{ items: classes.galleryItems }} handleShowFrame={handleShowFrame} handleChatbotOpened={handleChatbotOpened} handleSignInRedirect={() => setSignInRedirect(true)}/>
    );
};

export default ProductGalleryBySkus;
