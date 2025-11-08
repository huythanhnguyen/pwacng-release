import React, {Suspense, useCallback, useContext, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { Info } from 'react-feather';
import { string, number, shape, arrayOf } from 'prop-types';
import Cookies from 'js-cookie';
import { UserAgentContext } from "@magenest/theme/Hooks/UserAgentCheck/UserAgentContext";
import {Link, useHistory} from 'react-router-dom';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton';
import Price from '@magento/venia-ui/lib/components/Price';
import { UNCONSTRAINED_SIZE_KEY } from '@magento/peregrine/lib/talons/Image/useImage';
import { useGalleryItem } from '@magento/peregrine/lib/talons/Gallery/useGalleryItem';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Image from '@magento/venia-ui/lib/components/Image';
import GalleryItemShimmer from '@magento/venia-ui/lib/components/Gallery/item.shimmer';
import defaultClasses from '@magento/venia-ui/lib/components/Gallery/item.module.css';
import productCustomClasses from '@magenest/theme/BaseComponents/Gallery/extendStyle/item.module.scss';

import AddToCartButton from '@magento/venia-ui/lib/components/Gallery/addToCartButton';
import WishlistGalleryButton from '../Wishlist/AddToListButton/addToListButton.ee';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {useUserContext} from "@magento/peregrine/lib/context/user";
// eslint-disable-next-line no-unused-vars
// import Rating from '@magento/venia-ui/lib/components/Rating';
// import ProductLabel from "../ProductLabel/productLabel";
// import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";

const ProductLabel = React.lazy(() => import('../ProductLabel/productLabel'));
const DnrLabel = React.lazy(() => import('@magenest/theme/BaseComponents/Dnr/dnrLabel'));
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

// The placeholder image is 4:5, so we should make sure to size our product
// images appropriately.
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 300;

// Gallery switches from two columns to three at 640px.
const IMAGE_WIDTHS = new Map()
    .set(640, IMAGE_WIDTH)
    .set(UNCONSTRAINED_SIZE_KEY, 300);

const GalleryItem = props => {
    const {
        handleLinkClick,
        item,
        itemRef,
        wishlistButtonProps,
        isSupportedProductType,
        handleShowFrame,
        handleChatbotOpened,
        handleSignInRedirect
    } = useGalleryItem(props);

    const { storeConfig, searchTerm = null, isSeo = false } = props;
    const { isLazyContent } = useContext(UserAgentContext);
    const { isMobile } = useMediaCheck();
    const [{ isSignedIn }] = useUserContext();
    const { formatMessage } = useIntl();

    const productUrlSuffix = storeConfig && storeConfig.product_url_suffix;

    const classes = useStyle(defaultClasses, props.classes, productCustomClasses);
    const history = useHistory();
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);

    if (!item) {
        return <GalleryItemShimmer classes={classes} />;
    }

    // eslint-disable-next-line no-unused-vars
    const { name, ecom_name, is_alcohol, unit_ecom, product_label, dnr_price_search_page, price_range, small_image, url_key, canonical_url } = item;

    const { url: smallImageURL } = small_image;
    const productLink = !!searchTerm ? resourceUrl(`/${canonical_url}?atm_term=${searchTerm}`) : resourceUrl(`/${canonical_url}`);

    const wishlistButton = wishlistButtonProps ? (
        <WishlistGalleryButton {...wishlistButtonProps} isSearchSuggestion={true} />
    ) : null;

    const addButton = isSupportedProductType ? (
        <AddToCartButton item={item} urlSuffix={productUrlSuffix} />
    ) : (
        <div className={classes.unavailableContainer}>
            <Info />
            <p>
                <FormattedMessage
                    id={'galleryItem.unavailableProduct'}
                    defaultMessage={'Currently unavailable for purchase.'}
                />
            </p>
        </div>
    );
    const currencyCode =
        price_range?.maximum_price?.final_price?.currency ||
        item.price.regularPrice.amount.currency;

    // fallback to regular price when final price is unavailable
    const priceSource =
        (price_range?.maximum_price?.final_price !== undefined &&
        price_range?.maximum_price?.final_price !== null
            ? price_range.maximum_price.final_price
            : item.prices.maximum.final) ||
        (price_range?.maximum_price?.regular_price !== undefined &&
        price_range?.maximum_price?.regular_price !== null
            ? price_range.maximum_price.regular_price
            : item.prices.maximum.regular);
    const priceRegular =
        (price_range?.maximum_price?.regular_price !== undefined &&
        price_range?.maximum_price?.regular_price !== null
            ? price_range.maximum_price.regular_price
            : item.prices.maximum.regular);
    const isDiscount =
        (price_range?.maximum_price?.discount !== undefined &&
        price_range?.maximum_price?.discount !== null
            ? price_range.maximum_price.discount
            : 0);
    const priceSourceValue = priceSource.value || priceSource;
    const priceRegularValue = priceRegular.value || priceRegular;
    const isDiscountValue = isDiscount.amount_off || 0;
    const sale =
        (priceRegularValue && isDiscount && isDiscountValue !== 0
            ? Math.round((isDiscountValue / priceRegularValue) * 100)
            : 0);

    // Hide the Rating component until it is updated with the new look and feel (PWA-2512).
    const ratingAverage = null;
    // const ratingAverage = rating_summary ? (
    //     <Rating rating={rating_summary} />
    // ) : null;

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        // handleShowFrame and handleChatbotOpened for AI Chatbox
        if (handleShowFrame && !isMobile) {
            handleShowFrame(productLink);
        } else {
            if (handleChatbotOpened) {
                handleChatbotOpened(false);
            }
            handleLinkClick(`${window.location.origin}${productLink}`);
            history.push(productLink);
        }
        setAgeConfirmOpen(false);
    }, [setAgeConfirmOpen, handleLinkClick, history, productLink, handleShowFrame, handleChatbotOpened])

    const handleViewProduct = useCallback((e) => {
        e.preventDefault();
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (is_alcohol && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            // handleShowFrame and handleChatbotOpened for AI Chatbox
            if (handleShowFrame && !isMobile) {
                handleShowFrame(productLink);
            } else {
                if (handleChatbotOpened) {
                    handleChatbotOpened(false);
                }
                handleLinkClick(`${window.location.origin}${productLink}`);
                history.push(productLink);
            }
        }
    }, [is_alcohol, setAgeConfirmOpen, handleLinkClick, history, productLink, handleShowFrame, handleChatbotOpened])

    return (
        <div data-cy="GalleryItem-root" className={classes.root} ref={itemRef}>
            <Link
                aria-label={ecom_name || name}
                onClick={(e) => handleViewProduct(e)}
                to={productLink}
                className={is_alcohol ? `${classes.images} ${classes.alcoholTag}` : classes.images}
            >
                <Image
                    alt={ecom_name || name}
                    classes={{
                        image: classes.image,
                        loaded: classes.imageLoaded,
                        notLoaded: classes.imageNotLoaded,
                        root: classes.imageContainer
                    }}
                    height={IMAGE_HEIGHT}
                    resource={smallImageURL}
                    widths={IMAGE_WIDTHS}
                />
                {
                    !isLazyContent && (
                        <Suspense fallback={null}>
                            <ProductLabel labelData={product_label} currentPage={'category_image'} percent={sale} amount={isDiscountValue} currencyCode={currencyCode}/>
                        </Suspense>
                    )
                }
            </Link>
            {ratingAverage}

            {
                priceSourceValue !== 1 ? (
                    <div data-cy="GalleryItem-price" className={classes.price}>
                        <div className={classes.finalPrice}>
                            <Price value={priceSourceValue} currencyCode={currencyCode} />
                            {unit_ecom ? ' / ' + unit_ecom : ''}
                        </div>
                        <div className={classes.oldPriceWrap + ' ' + ((isDiscount && isDiscountValue !== 0) || classes.noOldPrice)}>
                            {isDiscount && isDiscountValue !== 0 && (
                                <>
                                    <div className={classes.oldPrice}>
                                        <Price value={priceRegularValue} currencyCode={currencyCode} />
                                    </div>
                                    <div className={classes.discount}>
                                        {'-' + sale + '%'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ): ''
            }
            <div className={classes.itemNameWrapper}>
                {isSeo ? (
                    <h3>
                        <Link
                            onClick={(e) => handleViewProduct(e)}
                            to={productLink}
                            className={classes.name}
                            data-cy="GalleryItem-name"
                        >
                            <span>{ecom_name || name}</span>
                        </Link>
                    </h3>
                ) : (
                    <Link
                        onClick={(e) => handleViewProduct(e)}
                        to={productLink}
                        className={classes.name}
                        data-cy="GalleryItem-name"
                    >
                        <span>{ecom_name || name}</span>
                    </Link>
                )}
                <Suspense fallback={null}>
                    <DnrLabel classes={classes} dnrData={dnr_price_search_page} />
                </Suspense>
            </div>
            <div className={classes.actionsContainer}>
                {' '}
                {!!handleSignInRedirect && !isSignedIn ? (
                    <button
                        className={classes.wishlistTrigger}
                        onClick={() => handleSignInRedirect()}
                        title={formatMessage({ id: 'wishlistButton.addText', defaultMessage: 'Add to Favorites' })}
                    >
                        <span>
                            <FormattedMessage
                                id="wishlistButton.addText"
                                defaultMessage="Add to Favorites"
                            />
                        </span>
                    </button>
                ) : (
                    <>
                        {wishlistButton}
                    </>
                )}
                <div className={classes.addToCartWrapper}>
                    {
                        priceSourceValue === 1 ? (
                            <a className={classes.contact} href={'tel:1800088879'}>
                                <FormattedMessage
                                    id={'global.contact'}
                                    defaultMessage={'Contact'}
                                />
                            </a>
                        ) : addButton
                    }
                </div>
            </div>
            {(is_alcohol && ageConfirmOpen) && (
                <Suspense fallback={null}>
                    <AlcoholDialog
                        isOpen={ageConfirmOpen}
                        setIsOpen={setAgeConfirmOpen}
                        onConfirm={handleLinkConfirm}
                        isBusy={false}
                    />
                </Suspense>
            )}
        </div>
    );
};

GalleryItem.propTypes = {
    classes: shape({
        image: string,
        imageLoaded: string,
        imageNotLoaded: string,
        imageContainer: string,
        images: string,
        name: string,
        price: string,
        root: string
    }),
    item: shape({
        id: number.isRequired,
        uid: string.isRequired,
        name: string.isRequired,
        small_image: shape({
            url: string.isRequired
        }),
        stock_status: string.isRequired,
        __typename: string.isRequired,
        url_key: string.isRequired,
        sku: string.isRequired,
        price_range: shape({
            maximum_price: shape({
                final_price: shape({
                    value: number.isRequired,
                    currency: string.isRequired
                }),
                regular_price: shape({
                    value: number.isRequired,
                    currency: string.isRequired
                }).isRequired,
                discount: shape({
                    amount_off: number.isRequired
                }).isRequired
            }).isRequired
        }).isRequired
    }),
    storeConfig: shape({
        magento_wishlist_general_is_enabled: string.isRequired,
        product_url_suffix: string
    })
};

export default GalleryItem;
