import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';
import {usePriceSummary} from '../../../Talons/CartPage/PriceSummary/usePriceSummary';
import Button from '@magento/venia-ui/lib/components/Button';
import {useStyle} from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/CartPage/PriceSummary/priceSummary.module.css';
import priceSummaryClasses from '@magenest/theme/BaseComponents/CartPage/extentStyle/priceSummary.module.scss';
import DiscountSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/discountSummary';
import GiftCardSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/giftCardSummary';
import GiftOptionsSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/giftOptionsSummary';
import ShippingSummary from './shippingSummary';
import TaxSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/taxSummary';
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import useMediaCheck from "../../../../@theme/Hooks/MediaCheck/useMediaCheck";
import SlideToggle from "react-slide-toggle";
import {useLocation} from "react-router-dom";

/**
 * A child component of the CartPage component.
 * This component fetches and renders cart data, such as subtotal, discounts applied,
 * gift cards applied, tax, shipping, and cart total.
 *
 * @param {Object} props
 * @param {Object} props.classes CSS className overrides.
 * See [priceSummary.module.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceSummary/priceSummary.module.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import PriceSummary from "@magento/venia-ui/lib/components/CartPage/PriceSummary";
 */
const PriceSummary = props => {
    const {isUpdating, count, buttonCheckout, checkoutStep} = props;
    const classes = useStyle(defaultClasses, priceSummaryClasses, props.classes);
    const talonProps = usePriceSummary();
    const {isMobile} = useMediaCheck();
    const location = useLocation();
    const {
        handleProceedToCheckout,
        handleEnterKeyPress,
        hasError,
        hasItems,
        isCheckout,
        isLoading,
        flatData
    } = talonProps;
    const {formatMessage} = useIntl();

    if (hasError) {
        return (
            <div className={classes.root}>
                <span className={classes.errorText}>
                    <FormattedMessage
                        id={'priceSummary.errorText'}
                        defaultMessage={
                            'Something went wrong. Please refresh and try again.'
                        }
                    />
                </span>
            </div>
        );
    } else if (!hasItems) {
        return null;
    }

    const {
        subtotal,
        total,
        discounts,
        giftCards,
        giftOptions,
        taxes,
        shipping,
        subTotalWithDiscountExcludingTax
    } = flatData;

    const currency = total.currency || 'VND';
    const isPriceUpdating = isUpdating || isLoading;
    const priceClass = isPriceUpdating ? `${classes.priceUpdating} ${classes.price}` : classes.price;
    const totalPriceClass = isPriceUpdating
        ? `${classes.priceUpdating} ${classes.totalPrice}`
        : classes.totalPrice;

    const proceedToCheckoutButton = (
        <div className={classes.checkoutButton_container}>
            {
                isMobile && (
                    <div className={classes.lineItems}>
                        <span
                            data-cy="PriceSummary-totalLabel"
                            className={classes.totalLabel}
                        >
                            <FormattedMessage
                                id={'global.payment'}
                                defaultMessage={'Payment'}
                            />
                        </span>
                        {
                            isCheckout && checkoutStep === 2 ? (
                                <span
                                    data-cy="PriceSummary-totalValue"
                                    className={totalPriceClass}
                                >
                                    <Price
                                        value={total.value || 0}
                                        currencyCode={currency}
                                    />
                                </span>
                            ) : (
                                <span
                                    data-cy="PriceSummary-totalValue"
                                    className={totalPriceClass}
                                >
                                    <Price
                                        value={subTotalWithDiscountExcludingTax?.value || 0}
                                        currencyCode={subTotalWithDiscountExcludingTax?.currency || currency}
                                    />
                                </span>
                            )
                        }
                    </div>
                )
            }
            {
                !isCheckout ? (
                    <Button
                        disabled={isPriceUpdating}
                        priority={'high'}
                        onClick={handleProceedToCheckout}
                        onKeyDown={handleEnterKeyPress}
                        data-cy="PriceSummary-checkoutButton"
                    >
                        <FormattedMessage
                            id={'priceSummary.checkoutButton'}
                            defaultMessage={'Proceed to Checkout'}
                        />
                    </Button>
                ) : buttonCheckout
            }
        </div>
    );

    return (
        <div className={classes.root} data-cy="PriceSummary-root">
            {
                !isMobile ? (
                    <>
                        <div className={classes.head}>
                            <strong
                                className={classes.title}>
                                <FormattedMessage
                                    id={'global.orderTotal'}
                                    defaultMessage={'Order total'}
                                />
                            </strong>
                            <span className={classes.count}>
                                <FormattedMessage
                                    id={'global.totalQuantity'}
                                    defaultMessage={'{totalQuantity} Items'}
                                    values={{totalQuantity: count || 0}}
                                />
                            </span>
                        </div>
                        <ul className={classes.items}>
                            <li className={classes.lineItems}>
                                <span
                                    data-cy="PriceSummary-lineItemLabel"
                                    className={classes.lineItemLabel}
                                >
                                    <FormattedMessage
                                        id={'priceSummary.lineItemLabel'}
                                        defaultMessage={'Subtotal'}
                                    />
                                </span>
                                <span
                                    data-cy="PriceSummary-subtotalValue"
                                    className={priceClass}
                                >
                                    <Price
                                        value={subtotal.value || 0}
                                        currencyCode={subtotal.currency || currency}
                                    />
                                </span>
                            </li>
                            <DiscountSummary
                                classes={{
                                    lineItems: classes.lineItems,
                                    lineItemLabel: classes.lineItemLabel,
                                    price: priceClass
                                }}
                                data={discounts}
                                currency={currency}
                            />
                            <li className={classes.lineItems}>
                                <GiftCardSummary
                                    classes={{
                                        lineItemLabel: classes.lineItemLabel,
                                        price: priceClass
                                    }}
                                    data={giftCards}
                                />
                            </li>
                            <li className={classes.lineItems}>
                                <GiftOptionsSummary
                                    classes={{
                                        lineItemLabel: classes.lineItemLabel,
                                        price: priceClass
                                    }}
                                    data={giftOptions}
                                />
                            </li>
                            <li className={classes.lineItems}>
                                <TaxSummary
                                    classes={{
                                        lineItemLabel: classes.lineItemLabel,
                                        price: priceClass
                                    }}
                                    data={taxes}
                                    isCheckout={isCheckout}
                                />
                            </li>
                            <li className={`${classes.lineItems} ${classes.totalLineItems}`}>
                                <span
                                    data-cy="PriceSummary-totalLabel"
                                    className={classes.totalLabel}
                                >
                                    <FormattedMessage
                                        id={'global.totalPayment'}
                                        defaultMessage={'Total payment'}
                                    />
                                </span>
                                {
                                    isCheckout && checkoutStep === 2 ? (
                                        <span
                                            data-cy="PriceSummary-totalValue"
                                            className={totalPriceClass}
                                        >
                                            <Price
                                                value={total.value}
                                                currencyCode={total.currency}
                                            />
                                        </span>
                                    ) : (
                                    <span
                                        data-cy="PriceSummary-totalValue"
                                        className={totalPriceClass}
                                    >
                                        <Price
                                            value={subTotalWithDiscountExcludingTax.value}
                                            currencyCode={subTotalWithDiscountExcludingTax.currency}
                                        />
                                    </span>
                                    )
                                }
                            </li>
                            <li className={classes.lineItems}>
                                <ShippingSummary
                                    classes={{
                                        lineItemLabel: classes.lineItemLabel,
                                        price: priceClass,
                                        distance: classes.distance,
                                        shippingNoteModal: classes.shippingNoteModal,
                                        innerWidth: classes.modalInnerWidth
                                    }}
                                    data={shipping}
                                    isCheckout={isCheckout}
                                    checkoutStep={checkoutStep}
                                />
                            </li>
                            <span className={classes.shippingNote}>
                                <FormattedMessage
                                    id={'priceSummary.shippingNote'}
                                    defaultMessage={'Delivery fee paid upon receipt'}
                                />
                            </span>
                        </ul>
                    </>
                ) : (
                    <SlideToggle
                        collapsed={true}
                        render={({toggle, setCollapsibleElement, toggleState}) => (
                            <>
                                <div className={classes.head} onClick={toggle}>
                                    <strong
                                        className={`${classes.title} ${toggleState === 'EXPANDED' ? classes.collapsed : ''}`}>
                                        <FormattedMessage
                                            id={'global.orderTotal'}
                                            defaultMessage={'Order total'}
                                        />
                                    </strong>
                                    <span className={classes.count}>
                                        <FormattedMessage
                                            id={'global.totalQuantity'}
                                            defaultMessage={'{totalQuantity} Items'}
                                            values={{totalQuantity: count}}
                                        />
                                    </span>
                                </div>
                                <ul className={classes.items} ref={setCollapsibleElement}>
                                    <li className={classes.lineItems}>
                                        <span
                                            data-cy="PriceSummary-lineItemLabel"
                                            className={classes.lineItemLabel}
                                        >
                                            <FormattedMessage
                                                id={'priceSummary.lineItemLabel'}
                                                defaultMessage={'Subtotal'}
                                            />
                                        </span>
                                        <span
                                            data-cy="PriceSummary-subtotalValue"
                                            className={priceClass}
                                        >
                                            <Price
                                                value={subtotal.value}
                                                currencyCode={subtotal.currency}
                                            />
                                        </span>
                                    </li>
                                    <DiscountSummary
                                        classes={{
                                            lineItems: classes.lineItems,
                                            lineItemLabel: classes.lineItemLabel,
                                            price: priceClass
                                        }}
                                        data={discounts}
                                        currency={currency}
                                    />
                                    <li className={classes.lineItems}>
                                        <GiftCardSummary
                                            classes={{
                                                lineItemLabel: classes.lineItemLabel,
                                                price: priceClass
                                            }}
                                            data={giftCards}
                                        />
                                    </li>
                                    <li className={classes.lineItems}>
                                        <GiftOptionsSummary
                                            classes={{
                                                lineItemLabel: classes.lineItemLabel,
                                                price: priceClass
                                            }}
                                            data={giftOptions}
                                        />
                                    </li>
                                    <li className={classes.lineItems}>
                                        <TaxSummary
                                            classes={{
                                                lineItemLabel: classes.lineItemLabel,
                                                price: priceClass
                                            }}
                                            data={taxes}
                                            isCheckout={isCheckout}
                                        />
                                    </li>
                                    <li className={classes.lineItems}>
                                        <span
                                            data-cy="PriceSummary-totalLabel"
                                            className={classes.totalLabel}
                                        >
                                            <FormattedMessage
                                                id={'global.totalAmount'}
                                                defaultMessage={'Total amount'}
                                            />
                                        </span>
                                        {
                                            isCheckout && checkoutStep === 2 ? (
                                                <span
                                                    data-cy="PriceSummary-totalValue"
                                                    className={totalPriceClass}
                                                >
                                                    <Price
                                                        value={total.value}
                                                        currencyCode={total.currency}
                                                    />
                                                </span>
                                            ) : (
                                                <span
                                                    data-cy="PriceSummary-totalValue"
                                                    className={totalPriceClass}
                                                >
                                                    <Price
                                                        value={subTotalWithDiscountExcludingTax.value}
                                                        currencyCode={subTotalWithDiscountExcludingTax.currency}
                                                    />
                                                </span>
                                            )
                                        }
                                    </li>
                                    <li className={classes.lineItems}>
                                        <ShippingSummary
                                            classes={{
                                                lineItemLabel: classes.lineItemLabel,
                                                price: priceClass,
                                                distance: classes.distance,
                                                shippingNoteModal: classes.shippingNoteModal,
                                                innerWidth: classes.modalInnerWidth
                                            }}
                                            data={shipping}
                                            checkoutStep={checkoutStep}
                                            isCheckout={isCheckout}
                                        />
                                    </li>
                                    <span className={classes.shippingNote}>
                                        <FormattedMessage
                                            id={'priceSummary.shippingNote'}
                                            defaultMessage={'Delivery fee paid upon receipt'}
                                        />
                                    </span>
                                </ul>
                            </>
                        )}
                    />
                )
            }
            {proceedToCheckoutButton}
            {
                !isMobile && (
                    <div className={classes.footerDelivery}>
                        <CmsBlock
                            identifiers={'footer_delivery'}
                            classes={{root: classes.deliveryWrapper}}
                        />
                    </div>
                )
            }
        </div>
    );
};

export default PriceSummary;
