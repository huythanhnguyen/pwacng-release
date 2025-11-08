import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Gallery from "../Gallery/gallery";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import RELATED_UPSELL_PRODUCTS from "../Product/relatedUpsellProducts.gql";
import {useQuery} from "@apollo/client";

const RelatedUpsellProducts = props => {
    const {
        classes,
        productDetails
    } = props;

    const { isMobile } = useMediaCheck();

    const [upsellActive, setUpsellActive] = useState(false);
    const [relatedActive, setRelatedActive] = useState(false);

    const { data: relatedUpsellData, error, loading } = useQuery(RELATED_UPSELL_PRODUCTS, {
        variables: {
            sku: productDetails.sku
        }
    });
    const upsellProducts = relatedUpsellData?.products?.items[0]?.upsell_products ? relatedUpsellData.products.items[0].upsell_products : [];
    const relatedProducts = relatedUpsellData?.products?.items[0]?.related_products ? relatedUpsellData.products.items[0].related_products : [];

    const upsellProductsClasses = upsellProducts.length < 4 ? (' productsLength' + upsellProducts.length) : '';
    const relatedProductsClasses = relatedProducts.length < 4 ? (' productsLength' + relatedProducts.length) : '';

    return (
        <>
            {
                upsellProducts.length > 0 && (
                    <div className={classes.upsellProducts + upsellProductsClasses}>
                        <div className={upsellActive ? classes.upsellProductsTitle + ' active' : classes.upsellProductsTitle} onClick={() => setUpsellActive(!upsellActive)}>
                            <FormattedMessage
                                id={'productFullDetail.upsell'}
                                defaultMessage={'Upsell products'}
                            />
                        </div>
                        {
                            (!isMobile || upsellActive) && (
                                <div className={classes.productsGallery}>
                                    <Gallery
                                        isSeo={true}
                                        items={upsellProducts}
                                        isSlider={true}
                                        slideToShow={upsellProducts.length < 4 ? upsellProducts.length : 4}
                                        sliderConfig={[
                                            {
                                                breakpoint: 1480,
                                                settings: {
                                                    slidesToShow: upsellProducts.length < 3 ? upsellProducts.length : 3,
                                                    slidesToScroll: upsellProducts.length < 3 ? upsellProducts.length : 3
                                                }
                                            },
                                            {
                                                breakpoint: 1023,
                                                settings: {
                                                    slidesToShow: upsellProducts.length < 2 ? upsellProducts.length : 2,
                                                    slidesToScroll: upsellProducts.length < 2 ? upsellProducts.length : 2
                                                }
                                            },
                                            {
                                                breakpoint: 768,
                                                settings: "unslick"
                                            }
                                        ]}
                                    />
                                </div>
                            )
                        }
                    </div>
                )
            }
            {
                relatedProducts.length > 0 && (
                    <div className={classes.relatedProducts + relatedProductsClasses}>
                        <div className={relatedActive ? classes.relatedProductsTitle + ' active' : classes.relatedProductsTitle} onClick={() => setRelatedActive(!relatedActive)}>
                            <FormattedMessage
                                id={'productFullDetail.related'}
                                defaultMessage={'Related products'}
                            />
                        </div>
                        {
                            (!isMobile || relatedActive) && (
                                <div className={classes.productsGallery}>
                                    <Gallery
                                        isSeo={true}
                                        items={relatedProducts}
                                        isSlider={true}
                                        slideToShow={relatedProducts.length < 4 ? relatedProducts.length : 4}
                                        sliderConfig={[
                                            {
                                                breakpoint: 1480,
                                                settings: {
                                                    slidesToShow: relatedProducts.length < 3 ? relatedProducts.length : 3,
                                                    slidesToScroll: relatedProducts.length < 3 ? relatedProducts.length : 3
                                                }
                                            },
                                            {
                                                breakpoint: 1023,
                                                settings: {
                                                    slidesToShow: relatedProducts.length < 2 ? relatedProducts.length : 2,
                                                    slidesToScroll: relatedProducts.length < 2 ? relatedProducts.length : 2
                                                }
                                            },
                                            {
                                                breakpoint: 768,
                                                settings: "unslick"
                                            }
                                        ]}
                                    />
                                </div>
                            )
                        }
                    </div>
                )
            }
        </>
    );
};

export default RelatedUpsellProducts;
