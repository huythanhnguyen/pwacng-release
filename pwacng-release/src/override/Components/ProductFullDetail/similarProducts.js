import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/ProductFullDetail/extendStyle/similarProducts.module.scss';
import sliderCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/slider.module.scss';

import Price from '@magento/venia-ui/lib/components/Price';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import SlickSlider from "react-slick";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";

const SimilarProduct = props => {
    const classes = useStyle(defaultClasses, sliderCustomClasses, props.classes);
    const { product, productUrlSuffix } = props;

    const similarProducts = product.similar_products ? product.similar_products : [];

    const similarProductItem = (item, isCurrent) => {
        const productLink = resourceUrl(`/${item.url_key}${productUrlSuffix || ''}`);

        const oldPrice = isCurrent
            ? item.price?.regularPrice?.amount?.value || 0
            : item.price_range?.maximum_price?.regular_price?.value || 0;
        const currency = item.price_range?.maximum_price?.final_price?.currency || '';
        const finalPrice = item.price_range?.maximum_price?.final_price?.value || 0;
        const amountOff = item.price_range.maximum_price.discount?.amount_off || 0;
        const percentOff = oldPrice > 0 ? (amountOff / oldPrice) * 100 : 0;

        const productContent = (
            <>
                <span className={classes.itemImage}>
                    <span className={classes.image}>
                        <img src={item.small_image.url} alt={item.name} width='80'/>
                    </span>
                    <h3 className={classes.itemName} title={item.name}>{item.name}</h3>
                </span>
                <span className={classes.priceWrapper}>
                    <span className={classes.finalPrice}>
                        <Price currencyCode={currency} value={finalPrice} />
                    </span>
                    {amountOff > 0 && (
                        <>
                            <span className={classes.oldPrice}>
                                <Price currencyCode={currency} value={oldPrice} />
                            </span>
                            {' '}
                            <span className={classes.discount}>
                            {'-' + percentOff.toFixed() + '%'}
                        </span>
                        </>
                    )}
            </span>
            </>
        );

        return (
            <div className={isCurrent ? `${classes.item} ${classes.itemCurrent}` : classes.item} key={item.uid}>
                {isCurrent ? productContent : <Link to={productLink}>{productContent}</Link>}
            </div>
        );
    }

    const sliderProps = {
        arrows: true,
        dots: false,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        variableWidth: true,
        draggable: true,
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 1325,
                settings: {
                    slidesToShow: 3
                }
            }
        ]
    }

    const { isMobile } = useMediaCheck();
    const isSlider = !isMobile && similarProducts.length > 2;

    return (
        <div className={classes.similarProducts}>
            <div className={classes.similarProductsTitle}>
                <FormattedMessage
                    id={'productFullDetail.similarProducts'}
                    defaultMessage={'Similar Products'}
                />
            </div>
            <div className={classes.similarProductsInner}>
                {
                    isSlider ? (
                        <SlickSlider {...sliderProps}>
                            {similarProductItem(product, true)}
                            {similarProducts.length > 0 && similarProducts.map(item => similarProductItem(item, false))}
                        </SlickSlider>
                    ) : (
                        <div className={classes.gallery}>
                            {similarProductItem(product, true)}
                            {similarProducts.length > 0 && similarProducts.map(item => similarProductItem(item, false))}
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default SimilarProduct;
