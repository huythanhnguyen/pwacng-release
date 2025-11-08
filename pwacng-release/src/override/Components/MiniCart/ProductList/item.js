import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { string, number, shape, func, arrayOf, oneOf } from 'prop-types';
import { Trash2 as DeleteIcon } from 'react-feather';
import { Link } from 'react-router-dom';

import Price from '@magento/venia-ui/lib/components/Price';
import { useItem } from '@magento/peregrine/lib/talons/MiniCart/useItem';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';

import ProductOptions from '@magento/venia-ui/lib/components/LegacyMiniCart/productOptions';
import Image from '@magento/venia-ui/lib/components/Image';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { useStyle } from '@magento/venia-ui/lib/classify';
import configuredVariant from '@magento/peregrine/lib/util/configuredVariant';

import defaultClasses from '@magento/venia-ui/lib/components/MiniCart/ProductList/item.module.css';
import itemCustomClasses from '@magenest/theme/BaseComponents/MiniCart/extendStyle/item.module.scss';
import AddToCartButton from "../../Gallery/addToCartButton";
import Shimmer from "@magento/venia-ui/lib/components/Shimmer";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";

const Item = props => {
    const {
        classes: propClasses,
        product,
        uid,
        configurable_options,
        handleRemoveItem,
        prices,
        closeMiniCart,
        configurableThumbnailSource,
        storeUrlSuffix,
        totalQuantity,
        index,
        handleViewProduct = () => {}
    } = props;

    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, itemCustomClasses, propClasses);
    const itemLink = useMemo(
        () => resourceUrl(`/${product.canonical_url}`),
        [product.canonical_url, storeUrlSuffix]
    );

    const { isDeleting, removeItem } = useItem({
        uid,
        handleRemoveItem
    });

    const rootClass = isDeleting ? classes.root_disabled : classes.root;
    const configured_variant = configuredVariant(configurable_options, product);

    const minicartButtonDeleted = formatMessage({
        id: 'global.deletedButton',
        defaultMessage: 'Item Deleted'
    });
    const miniCartButton = formatMessage({
        id: 'global.deleteButton',
        defaultMessage: 'Delete'
    });
    const buttonStatus = isDeleting ? minicartButtonDeleted : miniCartButton;

    const announceCartCount =
        totalQuantity > 1
            ? 'There are ' + totalQuantity + ' items left in your cart'
            : 'There is only one item left in your cart';

    return isDeleting ? (
        <div className={classes.shimmer}>
            <Shimmer />
        </div>
    ) : (
        <div className={rootClass} data-cy="MiniCart-Item-root">
            <span className={classes.count}>
                {index}
            </span>
            <Link
                className={product.is_alcohol ? `${classes.thumbnailContainer} ${classes.alcoholTag}` : classes.thumbnailContainer}
                to={itemLink}
                onClick={(e) => handleViewProduct(e, itemLink, product.is_alcohol)}
                data-cy="item-thumbnailContainer"
            >
                <Image
                    alt={product?.ecom_name || product.name}
                    classes={{
                        root: classes.thumbnail
                    }}
                    width={100}
                    height={100}
                    resource={
                        configurableThumbnailSource === 'itself' &&
                        configured_variant
                            ? configured_variant.thumbnail.url
                            : product.thumbnail.url
                    }
                    data-cy="Item-image"
                />
            </Link>
            <div className={classes.details}>
                <Link
                    className={classes.name}
                    to={itemLink}
                    onClick={(e) => handleViewProduct(e, itemLink, product.is_alcohol)}
                    data-cy="item-name"
                >
                    {product?.ecom_name || product.name}
                </Link>
                <ProductOptions
                    options={configurable_options}
                    classes={{
                        options: classes.options
                    }}
                />
                <div className={classes.priceBox}>
                    <strong className={classes.price}>
                        <Price
                            currencyCode={product?.price_range?.maximum_price?.final_price?.currency}
                            value={product?.price_range?.maximum_price?.final_price?.value}
                        />
                    </strong>
                    {
                        product?.price_range?.maximum_price?.final_price?.value < product?.price_range?.maximum_price?.regular_price?.value && (
                            <span className={classes.regularPrice}>
                                <Price
                                    currencyCode={product?.price_range?.maximum_price?.regular_price?.currency}
                                    value={product?.price_range?.maximum_price?.regular_price?.value}
                                />
                            </span>
                        )
                    }
                </div>
                {
                    product.dnr_price && (
                        <DnrLabel classes={classes} dnrData={product.dnr_price} />
                    )
                }
            </div>
            <div className={classes.actions}>
                <AddToCartButton
                    item={product}
                    urlSuffix={storeUrlSuffix}
                />
            </div>
            <div className={classes.finalPrice}>
                <div>
                    <span className={classes.label}>
                    <FormattedMessage
                        id={'global.totalAmount'}
                        defaultMessage={'Total amount'}
                    />
                </span>
                    <span className={classes.price}>
                    <Price
                        currencyCode={prices.row_total.currency}
                        value={prices.row_total.value}
                    />
                </span>
                </div>
            </div>
            <button
                onClick={removeItem}
                type="button"
                className={classes.deleteButton}
                disabled={isDeleting}
                data-cy="MiniCart-Item-deleteButton"
                aria-label={buttonStatus}
            >
                <FormattedMessage
                    id={'global.remove'}
                    defaultMessage={'Remove'}
                />
            </button>
        </div>
    )
};

export default Item;

Item.propTypes = {
    classes: shape({
        root: string,
        thumbnail: string,
        name: string,
        options: string,
        quantity: string,
        price: string,
        editButton: string,
        editIcon: string
    }),
    product: shape({
        name: string,
        thumbnail: shape({
            url: string
        })
    }),
    id: string,
    quantity: number,
    configurable_options: arrayOf(
        shape({
            id: number,
            option_label: string,
            value_id: number,
            value_label: string
        })
    ),
    handleRemoveItem: func,
    prices: shape({
        price: shape({
            value: number,
            currency: string
        })
    }),
    configured_variant: shape({
        thumbnail: shape({
            url: string
        })
    }),
    configurableThumbnailSource: oneOf(['parent', 'itself'])
};
