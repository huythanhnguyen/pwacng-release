import React, {Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import Image from "@magento/venia-ui/lib/components/Image";
// import Price from "@magento/venia-ui/lib/components/Price";
import SlideToggle from "react-slide-toggle";
import {Edit, Note, TrashGray} from "../../../static/icons";
import {FormattedMessage, useIntl} from "react-intl";
import {Form} from "informed";
import NoteField from "../../../../override/Components/CartPage/noteField";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import Button from "@magento/venia-ui/lib/components/Button";
import useProduct from "../../../Talons/QuickOrder/ListOrder/useProduct";
import AddToListButton from "../../../../override/Components/Wishlist/AddToListButton/addToListButton.ee";
import Icon from "@magento/venia-ui/lib/components/Icon";
import { Heart } from 'react-feather';
import useMediaCheck from "../../../Hooks/MediaCheck/useMediaCheck";
import Cookies from "js-cookie";
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const IMAGE_SIZE = 100;
const HeartIcon = <Icon size={16} src={Heart} />;

const Product = props => {
    const {
        item,
        classes,
        commentMaxLength,
        index,
        storeUrlSuffix
    } = props
    const { isMobile } = useMediaCheck();

    const { formatMessage } = useIntl();

    const talonProps = useProduct({
        item
    });

    const {
        handleUpdateCartItem,
        isDisabled,
        quantityUpdate,
        isInputFocused,
        setIsInputFocused,
        handleBlur,
        handleKeyPress,
        handleRemoveFromCart,
        isProductUpdating,
        addToWishlistProps,
        isShowFormComment,
        setIsShowFormComment,
        handleEditComment,
        handleSaveNote,
        updateCommentLoading
    } = talonProps;

    const history = useHistory();
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
    const [quantityInput, setQuantityInput] = useState(quantityUpdate || 0);

    useEffect(() => {
        setQuantityInput(quantityUpdate || 0);
    }, [isInputFocused, quantityUpdate]);

    const itemClassName = isProductUpdating
        ? classes.product_disabled
        : classes.product;

    const itemLink = useMemo(
        () => resourceUrl(`/${item.product.canonical_url}`),
        [item.product.canonical_url, storeUrlSuffix]
    );

    const handleLinkConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        history.push(itemLink);
        setAgeConfirmOpen(false);
    }, [setAgeConfirmOpen, history, itemLink])

    const handleViewProduct = useCallback((e) => {
        e.preventDefault();
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (item?.product?.is_alcohol && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            history.push(itemLink);
        }
    }, [item, setAgeConfirmOpen, history, itemLink])

    return (
        <div className={itemClassName} data-cy="Product-root">
            <span className={classes.count}>
                {index}
            </span>
            <Link
                onClick={(e) => handleViewProduct(e)}
                to={itemLink}
                className={item?.product?.is_alcohol ? `${classes.imageContainer} ${classes.alcoholTag}` : classes.imageContainer}
                data-cy="Product-imageContainer"
            >
                <Image
                    alt={item?.product?.ecom_name || item.product.name}
                    classes={{
                        root: classes.imageRoot,
                        image: classes.image
                    }}
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    resource={item.product.small_image.url}
                    data-cy="Product-image"
                />
            </Link>
            <div className={classes.details}>
                <div className={classes.name} data-cy="Product-name">
                    <Link
                        onClick={(e) => handleViewProduct(e)}
                        to={itemLink}
                    >
                        {item?.product?.ecom_name || item.product.name}
                    </Link>
                </div>
                <p className={classes.sku}>
                    SKU: {item.product.sku}
                </p>
                {/*<div className={classes.priceBox}>*/}
                {/*    <strong className={classes.price}>*/}
                {/*        <Price*/}
                {/*            currencyCode={item.product.price_range.maximum_price.final_price.currency}*/}
                {/*            value={item.product.price_range.maximum_price.final_price.value}*/}
                {/*        />*/}
                {/*    </strong>*/}
                {/*    {*/}
                {/*        item.product.price_range.maximum_price.final_price.value < item.product.price_range.maximum_price.regular_price.value && (*/}
                {/*            <span className={classes.regularPrice}>*/}
                {/*                    <Price*/}
                {/*                        currencyCode={item.product.price_range.maximum_price.regular_price.currency}*/}
                {/*                        value={item.product.price_range.maximum_price.regular_price.value}*/}
                {/*                    />*/}
                {/*                </span>*/}
                {/*        )*/}
                {/*    }*/}
                {/*</div>*/}
                {
                    !isMobile && (
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
                                        <span className={classes.line}></span>
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
                                                        <button disabled={updateCommentLoading} className={classes.save} type={'submit'}>
                                                            <FormattedMessage
                                                                id={'global.save'}
                                                                defaultMessage={'Save'}
                                                            />
                                                        </button>
                                                        <button disabled={updateCommentLoading} type={'button'} className={classes.cancel}
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
                                </>
                            )}
                        </SlideToggle>
                    )
                }
            </div>
            <div className={classes.quantity}>
                <div className={classes.quantityWrapper}>
                    <div className={classes.qtyInner}>
                        <Button
                            data-cy="AddToCartButton-buttonInStock"
                            aria-label={formatMessage({
                                id: 'addToCartButton.addItemToCartAriaLabel',
                                defaultMessage: 'Add to Cart'
                            })}
                            className={`${classes.root} ${classes.reduce}`}
                            disabled={isDisabled}
                            onPress={() => handleUpdateCartItem(
                                item.item_id,
                                (item.product.mm_product_type && item.product.mm_product_type === 'F') ? Number(quantityUpdate) - 0.5 : Number(quantityUpdate) - 1
                            )}
                            priority="high"
                            type="button"
                        >
                            <span className={classes.text}>-</span>
                        </Button>
                        <input type="number" min="0"
                               value={quantityInput}
                               onChange={(e) => {
                                   const value = e.target.value;
                                   const isFloatAllowed = item.product.mm_product_type === 'F';

                                   const floatRegex = /^\d*(\.\d?)?$/;     // ví dụ: 1, 1., 1.2
                                   const integerRegex = /^\d+$/;           // ví dụ: 1, 123 (không dấu .)
                                   if (
                                       (isFloatAllowed && floatRegex.test(value)) ||
                                       (!isFloatAllowed && integerRegex.test(value))
                                   ) {
                                       setQuantityInput(value);
                                   }
                               }}
                               onFocus={() => setIsInputFocused(true)}
                               onBlur={handleBlur}
                               onKeyPress={handleKeyPress}
                               disabled={isDisabled}
                        />
                        <Button
                            data-cy="AddToCartButton-buttonInStock"
                            aria-label={formatMessage({
                                id: 'addToCartButton.addItemToCartAriaLabel',
                                defaultMessage: 'Add to Cart'
                            })}
                            className={`${classes.root} ${classes.increase}`}
                            disabled={isDisabled}
                            onPress={() => handleUpdateCartItem(
                                item.item_id,
                                (item.product.mm_product_type && item.product.mm_product_type === 'F') ? Number(quantityUpdate) + 0.5 : Number(quantityUpdate) + 1
                            )}
                            priority="high"
                            type="button"
                        >
                            <span className={classes.text}>+</span>
                        </Button>
                    </div>
                </div>
                <div className={classes.action} onClick={() => handleRemoveFromCart(item.item_id)}>
                    <img src={TrashGray} alt={'trash'}/>
                    <FormattedMessage
                        id={'global.delete'}
                        defaultMessage={'Delete'}
                    />
                </div>
            </div>
            {
                isMobile && (
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
                                    <span className={classes.line}></span>
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
                                                    <button disabled={updateCommentLoading} className={classes.save} type={'submit'}>
                                                        <FormattedMessage
                                                            id={'global.save'}
                                                            defaultMessage={'Save'}
                                                        />
                                                    </button>
                                                    <button type={'button'} className={classes.cancel}
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
                            </>
                        )}
                    </SlideToggle>
                )
            }
            {(item?.product?.is_alcohol && ageConfirmOpen) && (
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
    )
}

export default Product
