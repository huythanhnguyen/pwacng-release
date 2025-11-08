import React, {useEffect, useState} from "react";
import ProductGalleryGroup from "./productGalleryGroup";
import {FormattedMessage} from "react-intl";
import GalleryItemShimmer from "@magento/venia-ui/lib/components/Gallery/item.shimmer";

const ProductGroupKeywords = props => {
    const {
        classes,
        productKeywords,
        showProducts,
        setShowProducts,
        handleShowFrame,
        handleChatbotOpened,
        processing = false,
        setSignInRedirect
    } = props;

    const [activeKeyword, setActiveKeyword] = useState(null);

    useEffect(() => {
        if (productKeywords && Array.isArray(productKeywords.queries) && productKeywords.queries.length > 0) {
            setActiveKeyword(productKeywords.queries[0]);
        } else {
            setActiveKeyword(null);
        }
    }, [productKeywords]);

    const getProductsForKeyword = (kw) => {
        if (!productKeywords || !Array.isArray(productKeywords.pairs)) return [];
        const pair = productKeywords.pairs.find(p => p && p.query === kw);
        return (pair && Array.isArray(pair.data)) ? pair.data : [];
    };

    return (
        <>
            {productKeywords && Array.isArray(productKeywords.queries) && productKeywords.queries.length > 0 && (
                <div className={classes.keywordListWrapper}>
                    <div className={classes.keywordList}>
                        {productKeywords.queries.map((kw) => {
                            const isActive = (activeKeyword === kw);
                            return (
                                <button
                                    key={kw}
                                    className={`${classes.keyword} ${isActive ? classes.active : ''}`}
                                    onClick={() => {
                                        const products = getProductsForKeyword(kw);
                                        if (products && products.length > 0) {
                                            setShowProducts(products);
                                        } else {
                                            // Nếu không có data map sẵn cho kw này, có thể để nguyên showProducts
                                            // hoặc set [] tuỳ yêu cầu
                                            setShowProducts([]);
                                        }
                                        setActiveKeyword(kw);
                                    }}
                                >
                                    {kw}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {showProducts?.length ? (
                <ProductGalleryGroup showProducts={showProducts} classes={classes} handleShowFrame={handleShowFrame} handleChatbotOpened={handleChatbotOpened} setSignInRedirect={setSignInRedirect}/>
            ) : (
                <>
                    {processing ? (
                        <div className={classes.productGalleryGroupShimmer}>
                            <GalleryItemShimmer classes={classes} />
                            <GalleryItemShimmer classes={classes} />
                            <GalleryItemShimmer classes={classes} />
                            <GalleryItemShimmer classes={classes} />
                            <GalleryItemShimmer classes={classes} />
                            <GalleryItemShimmer classes={classes} />
                            <GalleryItemShimmer classes={classes} />
                        </div>
                    ) : (
                        <div className={classes.sidebarEmpty}>
                            <FormattedMessage
                                id={'chatbot.noProductForKey'}
                                defaultMessage={'No products found matching the keyword'}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    )
};

export default ProductGroupKeywords;
