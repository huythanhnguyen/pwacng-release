import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import PriceSummary from '../../CartPage/PriceSummary/priceSummary';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { X } from 'react-feather';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/OrderSummary/orderSummary.module.css';
import orderSummaryClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/orderSummary.module.scss';
import {Link} from "react-router-dom";
import Image from "@magento/venia-ui/lib/components/Image";
import Price from "@magento/venia-ui/lib/components/Price";
import SlideToggle from "react-slide-toggle";
import Button from "../../Button/button";
import useMediaCheck from "../../../../@theme/Hooks/MediaCheck/useMediaCheck";
import Icon from "@magento/venia-ui/lib/components/Icon";
import useOrderSummary from "../../../../@theme/Talons/CheckoutPage/useOrderSummary";
import DnrLabel from "@magenest/theme/BaseComponents/Dnr/dnrLabel";

const OrderSummary = props => {
    const {
        data,
        isUpdating,
        totalQuantity,
        checkoutStep,
        CHECKOUT_STEP,
        placeOrderButton,
        setCheckoutStep,
        selectedAddressId,
        fetchStoreView,
        isContinue,
        setIsContinue,
        deliveryDate,
        loading,
        setLoading,
        handleOpenChangeStore,
        doneGuestSubmit,
        selectedAddress
    } = props;
    const talonProps = useOrderSummary({
        setCheckoutStep,
        selectedAddressId,
        checkoutStep,
        CHECKOUT_STEP,
        fetchStoreView,
        isContinue,
        setIsContinue,
        deliveryDate,
        setLoading,
        handleOpenChangeStore,
        loading,
        doneGuestSubmit,
        selectedAddress
    });
    const {
        handleTriggerSubmit
    } = talonProps;
    const classes = useStyle(defaultClasses, orderSummaryClasses, props.classes);
    const { isMobile } = useMediaCheck();

    const buttonCheckout = <>
        {
            checkoutStep === CHECKOUT_STEP.SHIPPING_ADDRESS ? (
                <Button onClick={handleTriggerSubmit} priority={'high'} disabled={loading}>
                    <FormattedMessage
                        id={'global.continue'}
                        defaultMessage={'Continue'}
                    />
                </Button>
            ) : placeOrderButton
        }
    </>

    return (
        <div data-cy="OrderSummary-root" className={classes.root}>
            <div className={classes.summaryTitle}>
                <div className={classes.title}>
                    <FormattedMessage
                        id={'cartTrigger.label'}
                        defaultMessage={'My Cart'}
                    />
                    <Link to={'/cart'} onClick={() => window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    })}>
                        <FormattedMessage
                            id={'global.edit'}
                            defaultMessage={'Edit'}
                        />
                    </Link>
                </div>
                <span className={classes.totalQuantity}>
                    <FormattedMessage
                        id={'global.totalQuantity'}
                        defaultMessage={'{totalQuantity} Items'}
                        values={{totalQuantity: totalQuantity}}
                    />
                </span>
            </div>
            <div className={classes.listProduct}>
                <SlideToggle
                    render={({toggle, setCollapsibleElement, toggleState}) => (
                        <>

                            <div
                                className={`${classes.blockTitle}
                                ${toggleState === 'EXPANDED' ? classes.collapsed : ''}`}
                                onClick={toggle}
                            >
                                <FormattedMessage
                                    id={'global.productList'}
                                    defaultMessage={'Product list'}
                                />
                            </div>
                            <div ref={setCollapsibleElement}>
                                <div className={classes.items}>
                                    {
                                        data && data.map((item, index) => (
                                            <div key={item.uid} className={classes.product}>
                                                <div className={classes.item}>
                                                    <span className={classes.count}>{++index}</span>
                                                    <div className={classes.productInner}>
                                                        <div className={classes.productInformation}>
                                                            {item?.product ? (
                                                                <>
                                                                    <Image
                                                                        alt={item.product.ecom_name || item.product.name}
                                                                        resource={item.product.thumbnail?.url || ''}
                                                                        width={80}
                                                                        height={80}
                                                                    />
                                                                    <div className={classes.details}>
                                                                        <p className={classes.name}>
                                                                            {item.product.ecom_name || item.product.name}
                                                                        </p>
                                                                        <div className={classes.priceBox}>
                                                                            {item.product.price_range?.maximum_price?.final_price?.value ? (
                                                                                <strong className={classes.finalPrice}>
                                                                                    <Price
                                                                                        value={item.product.price_range.maximum_price.final_price.value}
                                                                                        currencyCode={item.prices.price.currency || 'VND'}
                                                                                    />
                                                                                </strong>
                                                                            ) : null}
                                                                            {
                                                                                item.product.price_range?.maximum_price?.final_price?.value &&
                                                                                item.product.price_range?.maximum_price?.regular_price?.value &&
                                                                                item.product.price_range.maximum_price.final_price.value < item.product.price_range.maximum_price.regular_price.value && (
                                                                                    <span className={classes.regularPrice}>
                                                                                    <Price
                                                                                        value={item.product.price_range.maximum_price.regular_price.value}
                                                                                        currencyCode={item.prices.price.currency || 'VND'}
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
                                                                </>
                                                            ) : null}
                                                            <span className={classes.quantity}>
                                                                <Icon src={X} size={14} />
                                                                {item.quantity}
                                                            </span>
                                                        </div>
                                                        {
                                                            item.comment && (
                                                                <p className={classes.comment}>
                                                                    <strong>
                                                                        <FormattedMessage
                                                                            id={'global.note:'}
                                                                            defaultMessage={'Note: '}
                                                                        />
                                                                    </strong>
                                                                    <span>
                                                                        {item.comment}
                                                                    </span>
                                                                </p>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </>
                    )}
                />
            </div>
            <div className={classes.priceSummary}>
                {
                    isMobile ? (
                        <PriceSummary
                            isUpdating={isUpdating}
                            count={totalQuantity}
                            buttonCheckout={buttonCheckout}
                            checkoutStep={checkoutStep}
                        />
                    ) : (
                        <SlideToggle
                            render={({toggle, setCollapsibleElement, toggleState}) => (
                                <>
                                    <div
                                        className={`${classes.blockTitle}
                                        ${toggleState === 'EXPANDED' ? classes.collapsed : ''}`}
                                        onClick={toggle}
                                    >
                                        <FormattedMessage
                                            id={'global.payment'}
                                            defaultMessage={'Payment'}
                                        />
                                    </div>
                                    <div ref={setCollapsibleElement}>
                                        <PriceSummary
                                            classes={{
                                                root: classes.orderSummary,
                                                footerDelivery: classes.footerDelivery,
                                                price: classes.price,
                                                totalPrice: classes.totalPrice,
                                                totalLineItems: classes.totalLineItems,
                                                items: classes.orderSummaryItems,
                                                head: classes.head
                                            }}
                                            isUpdating={isUpdating}
                                            checkoutStep={checkoutStep}
                                        />
                                    </div>
                                </>
                            )}
                        />
                    )
                }
            </div>
            {
                !isMobile && buttonCheckout
            }
        </div>
    );
};

export default OrderSummary;
