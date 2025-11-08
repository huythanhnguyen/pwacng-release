import React, {useEffect, useMemo, useState, useRef} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Check } from 'react-feather';
import { useCartPage } from '../../Talons/CartPage/useCartPage';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { useToasts } from '@magento/peregrine';
import { CartEmpty, CartChange } from '@magenest/theme/static/icons';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import StockStatusMessage from '@magento/venia-ui/lib/components/StockStatusMessage';
import PriceAdjustments from '@magento/venia-ui/lib/components/CartPage/PriceAdjustments';
import PriceSummary from './PriceSummary/priceSummary';
import ProductListing from './ProductListing/productListing';
import defaultClasses from '@magento/venia-ui/lib/components/CartPage/cartPage.module.css';
import cartPageClasses from '@magenest/theme/BaseComponents/CartPage/extentStyle/cartPage.module.scss';
import {useHistory} from "react-router-dom";
import Button from "../Button/button";
import StaticBreadcrumbs from "../Breadcrumbs/staticBreadcrumbs";
import Gallery from "../Gallery/gallery";
import Modal from "@magenest/theme/BaseComponents/Modal";
import ReactGA from "react-ga4";
import SamePromotionDnrProducts from "./ProductListing/samePromotionDnrProducts";
import useProductRecommendationCart from "../../ContentTypes/ProductRecommendation/productRecommendationCart";
import CmsBlock from "../CmsBlock/cmsBlock";

const CheckIcon = <Icon size={20} src={Check} />;

/**
 * Structural page component for the shopping cart.
 * This is the main component used in the `/cart` route in Venia.
 * It uses child components to render the different pieces of the cart page.
 *
 * @see {@link https://venia.magento.com/cart}
 *
 * @param {Object} props
 * @param {Object} props.classes CSS className overrides for the component.
 * See [cartPage.module.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/cartPage.module.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import CartPage from "@magento/venia-ui/lib/components/CartPage";
 */
const CartPage = props => {
    const talonProps = useCartPage();
    const history = useHistory();
    const {
        cartItems,
        cartSubtotal,
        hasItems,
        isCartUpdating,
        fetchCartDetails,
        onAddToWishlistSuccess,
        setIsCartUpdating,
        shouldShowLoadingIndicator,
        wishlistSuccessProps,
        handleRemoveAll,
        removeAllCartLoading,
        showModalPriceChange,
        setShowModalPriceChange
    } = talonProps;

    const classes = useStyle(defaultClasses, cartPageClasses, props.classes);
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    const wrapperRef = useRef(null);
    const [hasTrackedView, setHasTrackedView] = useState(false);
    const [initialRecommendParams, setInitialRecommendParams] = useState(null);

    const [samePromotionDnr, setSamePromotionDnr] = useState(null);
    const [samePromotionDnrView, setSamePromotionDnrView] = useState(0);
    const samePromoRef = useRef(null);

    useEffect(() => {
        if (samePromotionDnr && samePromotionDnrView && samePromoRef.current) {
            const top = samePromoRef.current.getBoundingClientRect().top + window.scrollY - 160;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, [samePromotionDnrView]);

    useEffect(() => {
        if (!initialRecommendParams && cartItems.length > 0) {
            const artNoList = cartItems
                .map(item => item.product?.art_no)
                .filter(Boolean)
                .join(',');

            setInitialRecommendParams({
                artNoList,
                cartSubtotal,
                cartItemCount: cartItems.length
            });
        }
    }, [cartItems, cartSubtotal, initialRecommendParams]);

    const {
        data: recommendationData,
        items: recommendationItems,
        loading: recommendationLoading
    } = useProductRecommendationCart(initialRecommendParams || {});

    useEffect(() => {
        if (!recommendationData?.productsV2?.globalTracking?.view || hasTrackedView) return;

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    try {
                        window.web_event.trackEventWithUri(recommendationData.productsV2.globalTracking.view);
                    } catch (error) {
                        console.log(error);
                    }
                    setHasTrackedView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 } // khi 20% wrapper xuất hiện thì trigger
        );

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        return () => observer.disconnect();
    }, [recommendationData, hasTrackedView]);

    useEffect(() => {
        if (wishlistSuccessProps) {
            addToast({ ...wishlistSuccessProps, icon: CheckIcon });
        }
    }, [addToast, wishlistSuccessProps]);

    if (shouldShowLoadingIndicator) {
        return fullPageLoadingIndicator;
    }

    const productListing = hasItems && (
        <div className={classes.main}>
            <div className={classes.items_container}>
                <ProductListing
                    items={cartItems}
                    onAddToWishlistSuccess={onAddToWishlistSuccess}
                    setIsCartUpdating={setIsCartUpdating}
                    fetchCartDetails={fetchCartDetails}
                    handleRemoveAll={handleRemoveAll}
                    removeAllCartLoading={removeAllCartLoading}
                    setSamePromotionDnr={setSamePromotionDnr}
                    onShowSamePromotion={() => setSamePromotionDnrView(pre => pre + 1)}
                />
            </div>
            <div ref={samePromoRef}>
                { !!samePromotionDnr && (
                    <SamePromotionDnrProducts cartItems={cartItems} id={samePromotionDnr}/>
                )}
            </div>
            {
                recommendationItems?.length > 0 && (
                    <div ref={wrapperRef} className={classes.crossSellProduct}>
                        <div className={classes.title}>
                            <strong>
                                <FormattedMessage
                                    id={'global.recommendedProduct'}
                                    defaultMessage={'Recommended products'}
                                />
                            </strong>
                        </div>
                        <div className={classes.productsGallery}>
                            <Gallery
                                items={recommendationItems}
                                isSlider={true}
                                slideToShow={4}
                                slidesToScroll={4}
                                sliderConfig={[
                                    {
                                        breakpoint: 1480,
                                        settings: {
                                            slidesToShow: 3,
                                            slidesToScroll: 3
                                        }
                                    },
                                    {
                                        breakpoint: 1023,
                                        settings: {
                                            slidesToShow: 2,
                                            slidesToScroll: 2
                                        }
                                    },
                                    {
                                        breakpoint: 768,
                                        settings: "unslick"
                                    }
                                ]}
                            />
                        </div>
                    </div>
                )
            }
            <CmsBlock identifiers={'cart-bottom'} />
        </div>
    );

    const priceSummary = hasItems ? (
        <div className={classes.summary_container}>
            <PriceSummary
                count={cartItems.length}
                isUpdating={isCartUpdating}
                classes={{
                    shippingNote: classes.shippingNote,
                    distance: classes.distance
                }}
            />
        </div>
    ) : null;

    const cartEmpty = !hasItems && (
        <div className={classes.cartEmpty}>
            <img src={CartEmpty} alt={''} />
            <strong>
                <FormattedMessage
                    id={'miniCart.emptyMessage'}
                    defaultMessage={'There are no products in the cart.'}
                />
            </strong>
            <Button
                priority={'high'}
                onClick={() => history.push('/')}
            >
                <FormattedMessage
                    id={'global.home'}
                    defaultMessage={'Home'}
                />
            </Button>
        </div>
    );

    const cartChange = showModalPriceChange && (
        <Modal
            title={formatMessage({
                id: 'global.notification',
                defaultMessage: 'Notification'
            })}
            isOpen={showModalPriceChange}
            handleClose={() => setShowModalPriceChange(false)}
            isMask={true}
            classes={{
                innerWidth: classes.modalPriceChangeInnerWidth
            }}
        >
            <div className={classes.priceChangeModal}>
                <img src={CartChange} alt={''} />
                <span className={classes.description}>
                    <FormattedMessage
                        id={'global.priceChangeModalText'}
                        defaultMessage={'Your cart has been updated, please check'}
                    />
                </span>
                <Button priority={'high'} onClick={() => setShowModalPriceChange(false)}>
                    <FormattedMessage
                        id={'global.confirm'}
                        defaultMessage={'Confirm'}
                    />
                </Button>
            </div>
        </Modal>
    )

    return (
        <div className={classes.root} data-cy="CartPage-root">
            <div className={classes.breadcrumbs}>
                <StaticBreadcrumbs pageTitle={
                    formatMessage(
                        {
                            id: "global.yourCart",
                            defaultMessage: 'Your Cart'
                        }
                    )
                } />
            </div>
            <StoreTitle>
                {formatMessage({
                    id: 'global.cart',
                    defaultMessage: 'My Cart'
                })}
            </StoreTitle>
            {
                hasItems && (
                    <div className={classes.heading_container}>
                        <h1
                            aria-live="polite"
                            data-cy="CartPage-heading"
                            className={classes.heading}
                        >
                            <FormattedMessage
                                id={'global.yourCart'}
                                defaultMessage={'Your Cart'}
                            />
                        </h1>
                        <p className={classes.miniCartNote}>
                            <FormattedMessage
                                id={'miniCart.note1'}
                                defaultMessage={'Returns and exchanges are not applicable to '}
                            />
                            <span>
                    <FormattedMessage
                        id={'miniCart.note2'}
                        defaultMessage={'fresh food or frozen products.'}
                    />
                </span>
                        </p>
                        <div className={classes.stockStatusMessageContainer}>
                            <StockStatusMessage cartItems={cartItems}/>
                        </div>
                    </div>
                )
            }
            {
                hasItems && (
                    <div className={classes.body}>
                        {productListing}
                        {priceSummary}
                    </div>
                )
            }
            {cartEmpty}
            {cartChange}
        </div>
    );
};

export default CartPage;
