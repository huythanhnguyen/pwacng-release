import React, {Suspense, useCallback, useState} from 'react';
import { func, number, shape, string } from 'prop-types';
import {Link, useHistory} from 'react-router-dom';
import Price from '@magento/venia-ui/lib/components/Price';
import { useStyle } from '@magento/venia-ui/lib/classify';
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";

import Image from '@magento/venia-ui/lib/components/Image';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/suggestedProduct.module.css';
import suggestedProductClasses from '@magenest/theme/BaseComponents/SearchBar/extendStyle/suggestedProduct.module.scss';
import { useSuggestedProduct } from '@magento/peregrine/lib/talons/SearchBar';
import AddToCartButton from "../Gallery/addToCartButton";
import {FormattedMessage, useIntl} from "react-intl";
import AddToListButton from "../Wishlist/AddToListButton/addToListButton.ee";
import Icon from "@magento/venia-ui/lib/components/Icon";
import { Heart } from 'react-feather';
import Cookies from "js-cookie";

const HeartIcon = <Icon size={16} src={Heart} />;
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const IMAGE_WIDTH = 100;

const SuggestedProduct = props => {
    const classes = useStyle(defaultClasses, suggestedProductClasses, props.classes);
    const { formatMessage } = useIntl();
    const {
        url_key,
        small_image,
        name,
        ecom_name,
        is_alcohol,
        onNavigate,
        price,
        price_range,
        url_suffix,
        sku,
        unit_ecom,
        product,
        setVisible,
        art_no,
        canonical_url,
        categories,
        searchValue
    } = props;

    const talonProps = useSuggestedProduct({
        ecom_name,
        name,
        price,
        price_range,
        onNavigate,
        url_key,
        url_suffix,
        sku,
        product,
        small_image,
        art_no,
        canonical_url,
        categories,
        searchValue
    });

    const { priceProps, handleClick, uri, regularPriceProps, addToWishlistProps } = talonProps;
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
    const history = useHistory();

    const isDiscount = price_range?.maximum_price?.discount
            ? price_range.maximum_price.discount
            : 0;
    const priceRegular = price?.regularPrice?.amount?.value;
    const isDiscountValue = isDiscount.amount_off || 0;
    const priceRegularValue = priceRegular.value || priceRegular;

    const productLink = !!searchValue ? resourceUrl(`${uri}?atm_term=${searchValue.toLowerCase()}`) : resourceUrl(`${uri}`);

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        handleClick();
        history.push(productLink);
        setAgeConfirmOpen(false);
    }, [productLink, history, handleClick, setAgeConfirmOpen])

    const handleViewProduct = useCallback((e) => {
        e.preventDefault();
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (is_alcohol && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            handleClick();
            history.push(productLink);
        }
    }, [is_alcohol, productLink, handleClick, history, setAgeConfirmOpen])

    return (
        <div className={classes.root} data-cy="SuggestedProduct-root">
            <Link
                to={productLink}
                onClick={(e) => handleViewProduct(e)}
                className={is_alcohol ? `${classes.thumbnailContainer} ${classes.alcoholTag}` : classes.thumbnailContainer}
            >
                <Image
                    alt={ecom_name || name}
                    classes={{ image: classes.thumbnail, root: classes.image }}
                    resource={small_image}
                    width={IMAGE_WIDTH}
                    data-cy="SuggestedProduct-image"
                />
            </Link>
            <div className={classes.details}>
                {
                    priceProps.value !== 1 ? (
                        <div className={classes.priceBox}>
                            <strong data-cy="SuggestedProduct-price" className={classes.finalPrice}>
                                <Price {...priceProps} /> {unit_ecom ? ` / ${unit_ecom}` : ''}
                            </strong>
                            {
                                isDiscount && isDiscountValue !== 0 && (
                                    <>
                                <span className={classes.regularPrice}>
                                    <Price {...regularPriceProps} />
                                </span>
                                        <span className={classes.sale}>
                                    {`-${Math.round((isDiscountValue / priceRegularValue) * 100)}%`}
                                </span>
                                    </>
                                )
                            }
                        </div>
                    ) : ''
                }
                <Link
                    onClick={(e) => handleViewProduct(e)}
                    to={productLink}
                    className={classes.name}
                >
                    {ecom_name || name}
                </Link>
            </div>
            <div className={classes.addToCart}>
                {
                    priceProps.value === 1 ? (
                        <a className={classes.contact} href={'tel:1800088879'}>
                            <FormattedMessage
                                id={'global.contact'}
                                defaultMessage={'Contact'}
                            />
                        </a>
                    ) : (
                        <AddToCartButton
                            item={product}
                            label={formatMessage({
                                id: 'global.buy',
                                defaultMessage: 'Buy'
                            })}
                            outOfStocklabel={formatMessage({
                                id: 'global.outOfStock',
                                defaultMessage: 'Sold out'
                            })}
                            classes={{addToCart: classes.addToCartButton}}
                            urlSuffix={url_suffix}
                            isSearchSuggestion={true}
                            searchValue={searchValue}
                        />
                    )
                }
                <AddToListButton
                    {...addToWishlistProps}
                    icon={HeartIcon}
                    setPopupSearchVisible={setVisible}
                    isSearchSuggestion={true}
                    searchValue={searchValue}
                />
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

SuggestedProduct.propTypes = {
    url_key: string.isRequired,
    small_image: string.isRequired,
    name: string.isRequired,
    onNavigate: func,
    price: shape({
        regularPrice: shape({
            amount: shape({
                currency: string,
                value: number
            })
        })
    }).isRequired,
    price_range: shape({
        maximum_price: shape({
            final_price: shape({
                currency: string,
                value: number
            }),
            regular_price: shape({
                currency: string,
                value: number
            }),
            discount: shape({
                amount_off: number
            })
        })
    }),
    classes: shape({
        root: string,
        image: string,
        name: string,
        price: string,
        thumbnail: string
    })
};

export default SuggestedProduct;
