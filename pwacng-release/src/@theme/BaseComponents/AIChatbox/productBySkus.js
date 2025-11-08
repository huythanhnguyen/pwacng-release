import React, {Suspense, useCallback, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import {Link, useHistory} from "react-router-dom";
import Price from "../../../override/Components/Price/price";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import Shimmer from "@magento/venia-ui/lib/components/Shimmer/shimmer";
import Cookies from "js-cookie";

const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const showThumbnails = false;
const ProductBySkus = props => {
    const {
        classes,
        skus,
        items,
        loading,
        handleChatbotOpened,
        setFullscreen,
        handleOpenMore,
        handleShowFrame,
        showSliderMobile
    } = props;

    const { formatMessage } = useIntl();
    const { isMobile } = useMediaCheck();
    const history = useHistory();
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeName = store?.storeInformation?.name || null;
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState(null);

    const handleShowProductDetail = (url) => {
        handleShowFrame(url);
        setFullscreen(true);
    }

    const handleViewProduct = useCallback((url) => {
        if (isMobile) {
            history.push(url);
            handleChatbotOpened(false);
        } {
            handleShowProductDetail(url);
        }
    }, [isMobile, history, handleShowProductDetail, handleChatbotOpened])

    const handleClickProduct = useCallback((url, is_alcohol) => {
        if (is_alcohol) {
            const ageConfirmedCookies = Cookies.get('ageConfirmed');

            if (!ageConfirmedCookies) {
                setRedirectUrl(url);
                setAgeConfirmOpen(true);
            } else {
                handleViewProduct(url);
            }
        } else {
            handleViewProduct(url);
        }
    }, [setAgeConfirmOpen, handleViewProduct])

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        handleViewProduct(redirectUrl);
        setAgeConfirmOpen(false);
    }, [setAgeConfirmOpen, handleViewProduct, redirectUrl])

    const handleCancel = useCallback(() => {
        setRedirectUrl(null);
        setAgeConfirmOpen(false);
    }, [setAgeConfirmOpen, handleViewProduct, redirectUrl])

    if (loading) return <div className={classes.shimmerProductChatbot}><Shimmer width="100%" height="96px"/></div>

    if (!loading && !items?.length) {
        if (skus) {
            return (
                <i className={classes.storeAvailable}>
                    {storeName ? (
                        <>
                            <FormattedMessage
                                id={'chatbot.storeAvailableAt'}
                                defaultMessage={'The product you are looking for is currently not available at '}
                            />{`${storeName}.`}
                        </>
                    ) : (
                        <FormattedMessage
                            id={'chatbot.storeAvailable'}
                            defaultMessage={'The product you are looking for is not currently available at the selected store.'}
                        />
                    )}
                </i>
            )
        } else {
            return null
        }
    }

    return (
        <>
            {ageConfirmOpen && (
                <Suspense fallback={null}>
                    <AlcoholDialog
                        isOpen={ageConfirmOpen}
                        setIsOpen={setAgeConfirmOpen}
                        onConfirm={handleLinkConfirm}
                        onCancel={handleCancel}
                        isBusy={false}
                    />
                </Suspense>
            )}
            <ul className={classes.productSummary}>
                {items.map(product => {
                    const priceRange = product.price_range?.maximum_price || null;
                    const finalPrice = priceRange?.final_price?.value || null;
                    const regularPrice = priceRange?.regular_price?.value || product.price?.regularPrice?.amount?.value || null;
                    return (
                        <li key={`prd-${product.id}`}>
                            <span className={classes.link} onClick={() => handleClickProduct(`/${product.canonical_url}`, !!product.is_alcohol)}>
                                {`${product.ecom_name || product.name} - SKU: ${product.art_no}`}
                                {(finalPrice || regularPrice) ? (
                                    <>
                                        {' - '}
                                        <FormattedMessage
                                            id={'chatbot.price'}
                                            defaultMessage={'Price'}
                                        />{': '}
                                        <Price
                                            value={finalPrice || regularPrice}
                                            currencyCode={product.price.regularPrice.amount.currency}
                                        />
                                        {product?.unit_ecom ? ` / ${product.unit_ecom}` : ''}
                                    </>
                                ) : null}
                            </span>
                        </li>
                    )
                })}
            </ul>
            {showThumbnails ? (
                <div className={classes.productListing}>
                    {items.slice(0, 3).map(product => (
                        <div
                            className={classes.product}
                            key={product.id}
                            onClick={() => handleOpenMore(items)}
                            role="button"
                        >
                            <img
                                className={classes.productImage}
                                src={(product && product.small_image && product.small_image.url) || ''}
                                alt={product?.ecom_name || ''}
                                title={product?.ecom_name || ''}
                            />
                        </div>
                    ))}

                    {items.length >= 4 && (() => {
                        const moreItem = items[3];
                        const remaining = items.length - 4;
                        const imageUrl = (moreItem && moreItem.small_image && moreItem.small_image.url) || '';
                        return (
                            <div
                                className={classes.product}
                                key={moreItem.id}
                                onClick={() => handleOpenMore(items)}
                                role="button"
                            >
                                <img
                                    className={classes.productImage}
                                    src={imageUrl}
                                    alt={moreItem?.ecom_name || ''}
                                    title={moreItem?.ecom_name || ''}
                                />
                                {remaining > 0 && (
                                    <span className={classes.remainingCount}>+{remaining}</span>
                                )}
                            </div>
                        );
                    })()}

                    {!(showSliderMobile && isMobile) && (
                        <button
                            className={classes.moreProducts}
                            onClick={() => handleOpenMore(items)}
                        >
                            <FormattedMessage
                                id={'chatbot.moreProducts'}
                                defaultMessage={'See more products'}
                            />
                        </button>
                    )}
                </div>
            ) : null}
        </>
    );
};

export default ProductBySkus;
