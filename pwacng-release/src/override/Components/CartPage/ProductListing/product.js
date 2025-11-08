import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Heart } from 'react-feather';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useProduct } from '../../../Talons/CartPage/ProductListing/useProduct';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import Price from '@magento/venia-ui/lib/components/Price';
import { Note, TrashGray, Edit } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import Image from '@magento/venia-ui/lib/components/Image';
import ProductOptions from '@magento/venia-ui/lib/components/LegacyMiniCart/productOptions';
import Section from '@magento/venia-ui/lib/components/LegacyMiniCart/section';
import AddToListButton from '../../Wishlist/AddToListButton/addToListButton.ee';
import SlideToggle from "react-slide-toggle";
import defaultClasses from '@magento/venia-ui/lib/components/CartPage/ProductListing/product.module.css';
import productClasses from '@magenest/theme/BaseComponents/CartPage/extentStyle/product.module.scss';

import { CartPageFragment } from '@magento/peregrine/lib/talons/CartPage/cartPageFragments.gql.js';
import { AvailableShippingMethodsCartFragment } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/ShippingMethods/shippingMethodsFragments.gql.js';
import AddToCartButton from "../../Gallery/addToCartButton";
import {Form, useFormApi} from "informed";
import NoteField from "../noteField";
import {comment} from "postcss";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";
import DealDnrProducts from "./dealDnrProducts";

const IMAGE_SIZE = 100;

const HeartIcon = <Icon size={16} src={Heart} />;

const Product = props => {
    const {
        items,
        item,
        index,
        handleViewProduct,
        setSamePromotionDnr,
        onShowSamePromotion
    } = props;

    const { formatMessage } = useIntl();
    const talonProps = useProduct({
        operations: {
            removeItemMutation: REMOVE_ITEM_MUTATION,
            updateItemQuantityMutation: UPDATE_QUANTITY_MUTATION
        },
        ...props
    });

    const {
        addToWishlistProps,
        errorMessage,
        handleRemoveFromCart,
        product,
        isProductUpdating,
        setIsNote,
        isNote,
        handleSaveNote,
        loading,
        isShowFormComment,
        handleEditComment,
        setIsShowFormComment,
        commentMaxLength
    } = talonProps;

    const {
        ecom_name,
        image,
        name,
        options,
        urlKey,
        urlSuffix,
        canonical_url
    } = product;

    const classes = useStyle(defaultClasses, productClasses, props.classes);

    const itemClassName = isProductUpdating
        ? classes.item_disabled
        : classes.item;

    const itemLink = useMemo(
        () => resourceUrl(`/${canonical_url}`),
        [canonical_url]
    );

    const handleShowSamePromotion = () => {
        setSamePromotionDnr(item.id);
        onShowSamePromotion();
    }

    return (
        <>
            <li className={classes.root} data-cy="Product-root">
                <span className={classes.count}>
                    {index}
                </span>
                <div className={itemClassName}>
                    <Link
                        onClick={(e) => handleViewProduct(e, itemLink, item.product.is_alcohol)}
                        to={itemLink}
                        className={item.product.is_alcohol ? `${classes.imageContainer} ${classes.alcoholTag}` : classes.imageContainer}
                        data-cy="Product-imageContainer"
                    >
                        <Image
                            alt={ecom_name || name}
                            classes={{
                                root: classes.imageRoot,
                                image: classes.image
                            }}
                            width={IMAGE_SIZE}
                            height={IMAGE_SIZE}
                            resource={image}
                            data-cy="Product-image"
                        />
                    </Link>
                    <div className={classes.details}>
                        <div className={classes.name} data-cy="Product-name">
                            <Link
                                onClick={(e) => handleViewProduct(e, itemLink, item.product.is_alcohol)}
                                to={itemLink}
                            >
                                {ecom_name || name}
                            </Link>
                        </div>
                        <ProductOptions
                            options={options}
                            classes={{
                                options: classes.options,
                                optionLabel: classes.optionLabel
                            }}
                        />
                        <div className={classes.priceBox}>
                            <strong className={classes.price}>
                                <Price
                                    currencyCode={product.currency}
                                    value={item.product.price_range.maximum_price.final_price.value}
                                />
                            </strong>
                            {
                                item.product.price_range.maximum_price.final_price.value < item.product.price_range.maximum_price.regular_price.value && (
                                    <span className={classes.regularPrice}>
                                        <Price
                                            currencyCode={product.currency}
                                            value={item.product.price_range.maximum_price.regular_price.value}
                                        />
                                    </span>
                                )
                            }
                        </div>
                        {
                            item.product.dnr_price && (
                                <DnrLabel classes={classes} dnrData={item.product.dnr_price} />
                            )
                        }
                    </div>
                    <div className={classes.actions}>
                        <AddToCartButton
                            item={item?.product}
                            urlSuffix={urlSuffix}
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
                            currencyCode={item.prices.price.currency}
                            value={item.prices.row_total.value}
                        />
                    </span>
                        </div>
                    </div>
                    <SlideToggle collapsed={true}>
                        {({ toggle, setCollapsibleElement }) => (
                            <>
                                <div className={classes.actionsContainer}>
                                    <div className={classes.action} onClick={toggle}>
                                        <img src={Note} alt={'note'}/>
                                        <FormattedMessage
                                            id={'global.note'}
                                            defaultMessage={'Note'}
                                        />
                                    </div>
                                    <div className={classes.action} onClick={handleRemoveFromCart}>
                                        <img src={TrashGray} alt={'trash'}/>
                                        <FormattedMessage
                                            id={'global.delete'}
                                            defaultMessage={'Delete'}
                                        />
                                    </div>
                                    <div className={`${classes.action} ${classes.addToListButtonWrapper}`}>
                                        <AddToListButton
                                            {...addToWishlistProps}
                                            classes={{
                                                root: classes.addToListButton,
                                                root_selected: classes.addToListButton_selected
                                            }}
                                            icon={HeartIcon}
                                        />
                                    </div>
                                </div>
                                <div className={classes.note} ref={setCollapsibleElement}>
                                    <div className={classes.noteWrapper}>
                                        {
                                            isShowFormComment || !item.comment ? (
                                                <Form className={classes.form} onSubmit={handleSaveNote}>
                                                    <NoteField
                                                        classes={classes}
                                                        initialValue={item?.comment || ''}
                                                        commentMaxLength={commentMaxLength}
                                                    />
                                                    <button disabled={loading} className={classes.save} type={'submit'}>
                                                        <FormattedMessage
                                                            id={'global.save'}
                                                            defaultMessage={'Save'}
                                                        />
                                                    </button>
                                                    <button disabled={loading} type={'button'} className={classes.cancel}
                                                            onClick={() => {
                                                                toggle();
                                                                setIsShowFormComment(false);
                                                            }}>
                                                        <FormattedMessage
                                                            id={'global.cancel'}
                                                            defaultMessage={'Cancel'}
                                                        />
                                                    </button>
                                                </Form>
                                            ) : (
                                                <div className={classes.commentInner}>
                                                    <strong className={classes.label}>
                                                        <FormattedMessage
                                                            id={'global.note:'}
                                                            defaultMessage={'Note: '}
                                                        />
                                                    </strong>
                                                    <span className={classes.comment}>{item.comment}</span>
                                                    <div className={classes.editComment}>
                                                        <button onClick={handleEditComment}>
                                                            <img src={Edit} alt={''} />
                                                            <FormattedMessage
                                                                id={'global.edit'}
                                                                defaultMessage={'Edit'}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                                { !!item.product.dnr_price?.[0]?.event_name && !!item.have_same_promotion && (
                                    <div className={classes.dnrNote}>
                                        <span className={classes.eventName}>{item.product.dnr_price[0].event_name}</span>
                                        <span className={classes.eventAction}
                                              onClick={handleShowSamePromotion}>
                                            <FormattedMessage id={'cartItem.buyNow'} defaultMessage={'Buy now!'} />
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </SlideToggle>
                </div>
                <span className={classes.errorText}>{errorMessage}</span>
            </li>
            { item.isGroupLast && !!item.dealGroupId && (
                <DealDnrProducts items={items} id={item.dealGroupId} urlSuffix={urlSuffix}/>
            )}
        </>
    );
};

export default Product;

export const REMOVE_ITEM_MUTATION = gql`
    mutation removeItem($cartId: String!, $itemId: ID!) {
        removeItemFromCart(
            input: { cart_id: $cartId, cart_item_uid: $itemId }
        ) {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;

export const UPDATE_QUANTITY_MUTATION = gql`
    mutation updateItemQuantity(
        $cartId: String!
        $itemId: ID!
        $quantity: Float!
    ) {
        updateCartItems(
            input: {
                cart_id: $cartId
                cart_items: [{ cart_item_uid: $itemId, quantity: $quantity }]
            }
        ) {
            cart {
                id
                ...CartPageFragment
            }
        }
    }
    ${CartPageFragment}
`;
