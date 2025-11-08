import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { useToasts } from '@magento/peregrine';
import { useWishlistItem } from '@magento/peregrine/lib/talons/WishlistPage/useWishlistItem';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import Image from '@magento/venia-ui/lib/components/Image';
import Price from '@magento/venia-ui/lib/components/Price';
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import { useGallery } from '@magento/peregrine/lib/talons/Gallery/useGallery';
import {Link, useHistory} from 'react-router-dom';

import defaultClasses from '@magento/venia-ui/lib/components/WishlistPage/wishlistItem.module.css';
import wishlistItemClasses from '@magenest/theme/BaseComponents/WishlistPage/extendStyle/wishlistItem.module.scss';
import AddToCartButton from "../Gallery/addToCartButton";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";
import {useQuery} from "@apollo/client";
import {GET_STORE_CONFIG_DATA} from "@magento/peregrine/lib/talons/Gallery/gallery.gql";
import Cookies from "js-cookie";
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const WishlistItem = props => {
    const { item } = props;

    const { configurable_options: configurableOptions = [], product } = item;
    const {
        name,
        ecom_name,
        is_alcohol,
        price_range: priceRange,
        stock_status: stockStatus,
        url_key,
        canonical_url
    } = product;

    const { maximum_price: maximumPrice } = priceRange;
    const { final_price: finalPrice } = maximumPrice;
    const { currency, value: unitPrice } = finalPrice;

    const talonProps = useWishlistItem(props);
    const {
        addToCartButtonProps,
        handleRemoveProductFromWishlist,
        hasError,
        isRemovalInProgress,
        isSupportedProductType
    } = talonProps;

    const { data: storeConfigData } = useQuery(GET_STORE_CONFIG_DATA, {
        fetchPolicy: 'cache-and-network'
    });

    const storeConfig = storeConfigData ? storeConfigData.storeConfig : null;
    const productUrlSuffix = storeConfig && storeConfig.product_url_suffix;
    const productLink = resourceUrl(`/${canonical_url}`);

    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const history = useHistory();
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);

    useEffect(() => {
        if (hasError) {
            addToast({
                type: 'error',
                message: formatMessage({
                    id: 'wishlistItem.addToCartError',
                    defaultMessage:
                        'Something went wrong. Please refresh and try again.'
                }),
                timeout: 5000
            });
        }
    }, [addToast, formatMessage, hasError]);

    const classes = useStyle(defaultClasses, wishlistItemClasses, props.classes);

    const optionElements = useMemo(() => {
        return configurableOptions.map(option => {
            const {
                id,
                option_label: optionLabel,
                value_label: valueLabel
            } = option;

            const optionString = `${optionLabel} : ${valueLabel}`;

            return (
                <span className={classes.option} key={id}>
                    {optionString}
                </span>
            );
        });
    }, [classes.option, configurableOptions]);

    const imageProps = {
        classes: {
            image:
                stockStatus === 'OUT_OF_STOCK'
                    ? classes.image_disabled
                    : classes.image
        },
        ...talonProps.imageProps
    };

    const removeProductAriaLabel = formatMessage({
        id: 'wishlistItem.removeAriaLabel',
        defaultMessage: 'Remove Product from wishlist'
    });

    const rootClass = isRemovalInProgress
        ? classes.root_disabled
        : classes.root;

    const addToCart = isSupportedProductType ? (
        <button
            className={classes.addToCart}
            {...addToCartButtonProps}
            data-cy="wishlistItem-addToCart"
        >
            {formatMessage({
                id: 'wishlistItem.addToCart',
                defaultMessage: 'Add to Cart'
            })}
        </button>
    ) : null;

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        history.push(productLink);
        setAgeConfirmOpen(false);
    }, [setAgeConfirmOpen, history, productLink])

    const handleViewProduct = useCallback((e) => {
        e.preventDefault();
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (is_alcohol && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            history.push(productLink);
        }
    }, [is_alcohol, setAgeConfirmOpen, history, productLink])

    return (
        <>
            <div className={rootClass} data-cy="wishlistItem-root">
                <Link
                    onClick={(e) => handleViewProduct(e)}
                    to={productLink}
                    className={is_alcohol ? `${classes.thumbnailContainer} ${classes.alcoholTag}` : classes.thumbnailContainer}
                >
                    <Image
                        {...imageProps}
                        classes={{root: classes.image}}
                    />
                </Link>

                <div className={classes.details}>
                    <Link
                        onClick={(e) => handleViewProduct(e)}
                        to={productLink}
                    >
                        <span
                            className={classes.name}
                            data-cy="wishlistItem-productName"
                        >
                            {ecom_name || name}
                        </span>{' '}
                        {optionElements}
                        {
                            product.dnr_price && (
                                <DnrLabel classes={classes} dnrData={product.dnr_price} />
                            )
                        }
                    </Link>
                </div>
                {
                    unitPrice !== 1 ? (
                        <div
                            className={classes.priceContainer}
                            data-cy="wishlistItem-priceContainer"
                        >
                            <Price currencyCode={currency} value={unitPrice}/>
                        </div>
                    ) : ''
                }
                <div className={classes.addToCartWrapper}>
                    {
                        unitPrice === 1 ? (
                            <a className={classes.contact} href={'tel:1800088879'}>
                                <FormattedMessage
                                    id={'global.contact'}
                                    defaultMessage={'Contact'}
                                />
                            </a>
                        ) : (
                            <AddToCartButton
                                item={product}
                                classes={{
                                    qtyInner: classes.qtyInner,
                                    root: classes.qtyRoot,
                                    addToCart: classes.addToCart
                                }}
                                urlSuffix={productUrlSuffix}
                            />
                        )
                    }
                </div>
                <button
                    className={classes.deleteItem}
                    onClick={handleRemoveProductFromWishlist}
                    aria-label={removeProductAriaLabel}
                    data-cy="wishlistItem-deleteItem"
                >
                    <FormattedMessage
                        id={'global.deleteWishlist'}
                        defaultMessage={'Delete wishlist'}
                    />
                </button>
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
        </>
    );
};

export default WishlistItem;
