import React from "react";
import { useQuery } from '@apollo/client';
import {GET_PRODUCTS_BY_SKU} from '../Product/products.gql';
import Gallery from "@magento/venia-ui/lib/components/Gallery";
import GalleryItemShimmer from "@magento/venia-ui/lib/components/Gallery/item.shimmer";

const ProductGalleryGroup = props => {
    const {
        showProducts,
        handleShowFrame,
        handleChatbotOpened,
        setSignInRedirect,
        classes
    } = props;

    const skus = (showProducts || [])
        .map(p => p?.sku)
        .filter(Boolean);

    const { data, loading } = useQuery(GET_PRODUCTS_BY_SKU, {
        variables: { skus, pageSize: 20 },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first"
    });

    const items = (data && data.products && data.products.items) ? data.products.items : [];

    if (loading) return (
        <div className={classes.productGalleryGroupShimmer}>
            <GalleryItemShimmer classes={classes} />
            <GalleryItemShimmer classes={classes} />
            <GalleryItemShimmer classes={classes} />
            <GalleryItemShimmer classes={classes} />
        </div>
    )

    if (!items.length) return null;

    return (
        <>
            <Gallery
                items={items}
                classes={{items: classes.galleryItems}}
                handleShowFrame={handleShowFrame}
                handleChatbotOpened={handleChatbotOpened}
                handleSignInRedirect={() => setSignInRedirect(true)}
            />
        </>
    );
};

export default ProductGalleryGroup;
