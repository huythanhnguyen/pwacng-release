import React, {Fragment, useMemo} from 'react';
import defaultClasses from './listOrder.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage} from "react-intl";
import {Link} from "react-router-dom";
import Image from "@magento/venia-ui/lib/components/Image";
import ProductOptions from "@magento/venia-ui/lib/components/LegacyMiniCart/productOptions";
import Price from "@magento/venia-ui/lib/components/Price";
import DnrLabel from "../../Dnr/dnrLabel";
import AddToCartButton from "../../../../override/Components/Gallery/addToCartButton";
import SlideToggle from "react-slide-toggle";
import {CartEmpty, Edit, Note, TrashGray} from "../../../static/icons";
import AddToListButton from "../../../../override/Components/Wishlist/AddToListButton/addToListButton.ee";
import {Form} from "informed";
import NoteField from "../../../../override/Components/CartPage/noteField";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import useListOrder from "../../../Talons/QuickOrder/ListOrder/useListOrder";
import Product from "./product";
import Button from "../../../../override/Components/Button/button";

const ListOrder = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {
        data
    } = props

    const talonProps = useListOrder();

    const {
        isProductUpdating,
        handleEditComment,
        commentMaxLength,
        storeUrlSuffix
    } = talonProps;

    return (
        <div className={classes.block}>
            <div className={classes.blockTitle}>
                <FormattedMessage
                    id={'quickOrder.stepCheckOrderList'}
                    defaultMessage={'Check the list and quantity again'}
                />
            </div>
            <div className={classes.blockContent}>
                {
                    data && data?.getQuickOrder?.items.length > 0 ? data?.getQuickOrder?.items.map((item, index) => (
                        <Fragment key={index}>
                            <Product
                                item={item}
                                classes={classes}
                                isProductUpdating={isProductUpdating}
                                commentMaxLength={commentMaxLength}
                                index={++index}
                                storeUrlSuffix={storeUrlSuffix}
                            />
                        </Fragment>
                    )) : (
                        <div className={classes.cartEmpty}>
                            <img src={CartEmpty} alt={''} />
                            <strong>
                                <FormattedMessage
                                    id={'miniCart.emptyMessage'}
                                    defaultMessage={'There are no products in the cart.'}
                                />
                            </strong>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default ListOrder
