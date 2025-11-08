import React, {Fragment, Suspense, useCallback, useEffect, useState} from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import {Link, useHistory} from 'react-router-dom';
import {ArrowRight, ArrowRightBlue, CartEmpty} from '@magenest/theme/static/icons';
import { useToasts } from '@magento/peregrine';
import {
    CHECKOUT_STEP,
    useCheckoutPage
} from '../../Talons/CheckoutPage/useCheckoutPage';
import { FormProvider } from '@magenest/theme/Context/Checkout/formContext';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '../Button/button';
import {StoreTitle, Style} from '@magento/venia-ui/lib/components/Head';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import StockStatusMessage from '@magento/venia-ui/lib/components/StockStatusMessage';
import FormError from '@magento/venia-ui/lib/components/FormError';
import AddressBook from './AddressBook/addressBook';
import GuestSignIn from './GuestSignIn/guestSignIn';
import OrderSummary from './OrderSummary/orderSummary';
import PaymentInformation from './PaymentInformation/paymentInformation';
import ShippingInformation from './ShippingInformation/shippingInformation';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import { Location, Payment } from '@magenest/theme/static/icons';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/checkoutPage.module.css';
import checkoutPageClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/checkoutPage.module.scss';
import Logo from "../Logo/logo";
import SlideToggle from "react-slide-toggle";
import CashOnDelivery from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/cashOnDelivery";
import Momo from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/momo";
import VnPay from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/vnpay";
import ZaloPay from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/zalopay";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
const PAYMENT_METHOD_COMPONENTS_BY_CODE = {
    cashondelivery: CashOnDelivery,
    vnpay: VnPay,
    momo_wallet: Momo,
    zalopay: ZaloPay
};
import ReactGA from "react-ga4";
import Cookies from "js-cookie";
import AlcoholCheckoutDialog from "../../../@theme/BaseComponents/Product/alcoholCheckoutDialog";

const CheckoutPage = props => {
    const { classes: propClasses } = props;
    const { formatMessage } = useIntl();
    const talonProps = useCheckoutPage();
    const history = useHistory();

    const {
        /**
         * Enum, one of:
         * SHIPPING_ADDRESS, SHIPPING_METHOD, PAYMENT, REVIEW
         */
        availablePaymentMethods,
        cartItems,
        hasAlcoholProduct,
        checkoutStep,
        error,
        handlePlaceOrder,
        handlePlaceOrderEnterKeyPress,
        isCartEmpty,
        isGuestCheckout,
        isLoading,
        isUpdating,
        orderDetailsData,
        orderDetailsLoading,
        orderNumber,
        placeOrderLoading,
        placeOrderButtonClicked,
        setCheckoutStep,
        resetReviewOrderButtonClicked,
        reviewOrderButtonClicked,
        deliveryDate,
        setDeliveryDate,
        handleCloseChangeStore,
        showModalChangeStore,
        selectedAddressId,
        setSelectedAddressId,
        fetchStoreView,
        storeViewData,
        isContinue,
        setIsContinue,
        placeOrderData,
        setLoading,
        loading,
        handleOpenChangeStore,
        totalPrice,
        setTotalPrice,
        isDeliveryTimeInit,
        setIsDeliveryTimeInit,
        doneGuestSubmit,
        setDoneGuestSubmit,
        setSelectedAddress,
        selectedAddress
    } = talonProps;

    const totalQuantity = cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    const [, { addToast }] = useToasts();
    const [ageConfirmOpen, setAgeConfirmOpen] = useState(false);
    const [redirectToCart, setRedirectToCart] = useState(false);

    useEffect(() => {
        if (placeOrderData?.placeOrder?.errors?.[0]?.message) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: placeOrderData.placeOrder.errors[0].message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, placeOrderData]);

    const classes = useStyle(defaultClasses, checkoutPageClasses, propClasses);

    let checkoutContent;

    const signInElement = <GuestSignIn />;

    useEffect(() => {
        if (placeOrderData?.placeOrder?.orderV2 && orderDetailsData?.cart?.email) {
            if (placeOrderData?.placeOrder?.orderV2?.payment_methods?.[0]?.pay_url) {
                window.location.href = `${placeOrderData.placeOrder.orderV2.payment_methods[0].pay_url}`;
            } else {
                history.push(`/order-confirmation?orderId=${placeOrderData.placeOrder.orderV2.number}&id=${placeOrderData.placeOrder.orderV2.id}&email=${orderDetailsData.cart.email}`);
            }
        }
    }, [placeOrderData, orderDetailsData]);

    const handleAgeConfirmPlaceOrder = useCallback((e) => {
        e.preventDefault();
        const ageConfirmedCookies = Cookies.get('ageConfirmed');
        if (hasAlcoholProduct && !ageConfirmedCookies) {
            setAgeConfirmOpen(true);
        } else {
            handlePlaceOrder()
            setAgeConfirmOpen(false);
        }
    }, [setAgeConfirmOpen, hasAlcoholProduct, handlePlaceOrder])

    const handleAgeConfirm = useCallback(() => {
        Cookies.set('ageConfirmed', true, { expires: 7 });
        handlePlaceOrder()
        setAgeConfirmOpen(false);
    }, [setAgeConfirmOpen, handlePlaceOrder])

    const handleAgeCancel = useCallback(() => {
        setAgeConfirmOpen(false);
        setRedirectToCart(true);
    }, [setAgeConfirmOpen, handlePlaceOrder])

    const handleRedirectToCart = useCallback(() => {
        history.push('/cart');
        setRedirectToCart(false);
    }, [setRedirectToCart, history])

    if (orderNumber && orderDetailsData) {
        return (
            <></>
        );
    } else if (isLoading || placeOrderLoading) {
        return fullPageLoadingIndicator;
    } else if (isCartEmpty) {
        return (
            <div className={classes.root} data-cy="CheckoutPage-root">
                <StoreTitle>
                    {formatMessage({
                        id: 'checkoutPage.titleCheckout',
                        defaultMessage: 'Checkout'
                    })}
                </StoreTitle>
                <Style>{'header.header-cls { display: none !important; }'}</Style>
                <header className={classes.header}>
                    <Link
                        to={resourceUrl('/')}
                        className={classes.logoContainer}
                    >
                        <Logo />
                    </Link>
                    <div className={classes.progressWrapper}>
                        <div className={`${classes.progressItem} ${classes.progressItem_active}`}>
                        <span className={classes.icon}>
                            <img src={Location} alt={''}/>
                        </span>
                            <FormattedMessage
                                id={'checkoutPage.progressShipping'}
                                defaultMessage={'Delivery address'}
                            />
                        </div>
                        {
                            checkoutStep === CHECKOUT_STEP.PAYMENT ? (
                                <img src={ArrowRightBlue} alt={'arrow-right'}/>
                            ) : (
                                <img src={ArrowRight} alt={'arrow-right'}/>
                            )
                        }
                        <div className={`${classes.progressItem} ${checkoutStep === CHECKOUT_STEP.PAYMENT ? classes.progressItem_active : ''}`}>
                        <span className={classes.icon}>
                            <img src={Payment} alt={''}/>
                        </span>
                            <FormattedMessage
                                id={'checkoutPage.progressPayment'}
                                defaultMessage={'Payment and ordering'}
                            />
                        </div>
                    </div>
                </header>
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
            </div>
        );
    } else {
        const signInContainerVisible =
            isGuestCheckout && checkoutStep !== CHECKOUT_STEP.PAYMENT;
        const signInContainerElement = signInContainerVisible ? (
            <SlideToggle collapsed={true}>
                {({ toggle, setCollapsibleElement, toggleState }) => (
                    <div className={classes.block}>
                        <div className={`${classes.blockTitle} ${toggleState === 'EXPANDED' ? classes.collapsed : ''}`} onClick={toggle}>
                            <strong>
                                <FormattedMessage
                                    id={'global.signInLabel'}
                                    defaultMessage={'You already have an account?'}
                                />
                                <span>
                                    <FormattedMessage
                                        id={'global.signIn'}
                                        defaultMessage={'Sign In'}
                                    />
                                </span>
                            </strong>
                        </div>
                        <div className={classes.blockContent} ref={setCollapsibleElement}>
                            {signInElement}
                        </div>
                    </div>
                )}
            </SlideToggle>
        ) : null;

        const formErrors = [];
        const paymentMethods = Object.keys(PAYMENT_METHOD_COMPONENTS_BY_CODE);

        // If we have an implementation, or if this is a "zero" checkout,
        // we can allow checkout to proceed.
        const isPaymentAvailable = !!availablePaymentMethods?.find(
            ({ code }) => code === 'free' || paymentMethods?.includes(code)
        );

        if (!isPaymentAvailable) {
            formErrors.push(
                new Error(
                    formatMessage({
                        id: 'checkoutPage.noPaymentAvailable',
                        defaultMessage: 'Payment is currently unavailable.'
                    })
                )
            );
        }

        const paymentInformationSection =
            checkoutStep >= CHECKOUT_STEP.PAYMENT && (
                <>
                    <div className={`${classes.block} ${classes.blockPayment}`}>
                        <div className={`${classes.blockTitle} ${classes.titleNotToggle}`}>
                            <strong>
                                <FormattedMessage
                                    id={'checkoutPage.paymentInformationTitle'}
                                    defaultMessage={'Choose payment method'}
                                />
                            </strong>
                        </div>
                        <div className={classes.blockContent}>
                            <PaymentInformation
                                checkoutError={error}
                                resetShouldSubmit={resetReviewOrderButtonClicked}
                                setCheckoutStep={setCheckoutStep}
                                shouldSubmit={reviewOrderButtonClicked}
                            />
                        </div>
                    </div>
                </>
            );

        const placeOrderButton =
            checkoutStep === CHECKOUT_STEP.PAYMENT ? (
                <Button
                    onClick={(e) => handleAgeConfirmPlaceOrder(e)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleAgeConfirmPlaceOrder(e);
                        }
                    }}
                    priority="high"
                    data-cy="CheckoutPage-placeOrderButton"
                    disabled={
                        isUpdating ||
                        !!placeOrderLoading ||
                        !!orderDetailsLoading ||
                        !!placeOrderButtonClicked
                    }
                >
                    <FormattedMessage
                        id={'global.continue'}
                        defaultMessage={'Continue'}
                    />
                </Button>
            ) : null;

        const orderSummary = (
            <div
                className={classes.summaryContainer}
            >
                <OrderSummary
                    totalQuantity={totalQuantity}
                    data={cartItems}
                    isUpdating={isUpdating}
                    checkoutStep={checkoutStep}
                    CHECKOUT_STEP={CHECKOUT_STEP}
                    setCheckoutStep={setCheckoutStep}
                    placeOrderButton={placeOrderButton}
                    selectedAddressId={selectedAddressId}
                    fetchStoreView={fetchStoreView}
                    isContinue={isContinue}
                    setIsContinue={setIsContinue}
                    deliveryDate={deliveryDate}
                    setLoading={setLoading}
                    loading={loading}
                    handleOpenChangeStore={handleOpenChangeStore}
                    doneGuestSubmit={doneGuestSubmit}
                    selectedAddress={selectedAddress}
                />
                {(ageConfirmOpen) && (
                    <Suspense fallback={null}>
                        <AlcoholDialog
                            isOpen={ageConfirmOpen}
                            setIsOpen={setAgeConfirmOpen}
                            onConfirm={handleAgeConfirm}
                            onCancel={handleAgeCancel}
                            isBusy={false}
                        />
                    </Suspense>
                )}
                {(redirectToCart) && (
                    <Suspense fallback={null}>
                        <AlcoholCheckoutDialog
                            isOpen={redirectToCart}
                            setIsOpen={setRedirectToCart}
                            onConfirm={handleRedirectToCart}
                            isBusy={false}
                        />
                    </Suspense>
                )}
            </div>
        );

        const stockStatusMessageElement = (
            <Fragment>
                <FormattedMessage
                    id={'checkoutPage.stockStatusMessage'}
                    defaultMessage={
                        'An item in your cart is currently out-of-stock and must be removed in order to Checkout. Please return to your cart to remove the item.'
                    }
                />
                <Link className={classes.cartLink} to={'/cart'}>
                    <FormattedMessage
                        id={'checkoutPage.returnToCart'}
                        defaultMessage={'Return to Cart'}
                    />
                </Link>
            </Fragment>
        );
        checkoutContent = (
            <>
                <Style>{'header.header-cls { display: none !important; }'}</Style>
                <header className={classes.header}>
                    <Link
                        to={resourceUrl('/')}
                        className={classes.logoContainer}
                    >
                        <Logo />
                    </Link>
                    <div className={classes.progressWrapper}>
                        <div className={`${classes.progressItem} ${classes.progressItem_active}`}>
                        <span className={classes.icon}>
                            <img src={Location} alt={''}/>
                        </span>
                            <FormattedMessage
                                id={'checkoutPage.progressShipping'}
                                defaultMessage={'Delivery address'}
                            />
                        </div>
                        {
                            checkoutStep === CHECKOUT_STEP.PAYMENT ? (
                                <img src={ArrowRightBlue} alt={'arrow-right'}/>
                            ) : (
                                <img src={ArrowRight} alt={'arrow-right'}/>
                            )
                        }
                        <div className={`${classes.progressItem} ${checkoutStep === CHECKOUT_STEP.PAYMENT ? classes.progressItem_active : ''}`}>
                        <span className={classes.icon}>
                            <img src={Payment} alt={''}/>
                        </span>
                            <FormattedMessage
                                id={'checkoutPage.progressPayment'}
                                defaultMessage={'Payment and ordering'}
                            />
                        </div>
                    </div>
                </header>
                <div className={classes.checkoutWrapper}>
                    <FormProvider>
                        <div className={classes.checkoutContent}>
                            <div className={classes.heading_container}>
                                <FormError
                                    classes={{
                                        root: classes.formErrors
                                    }}
                                    errors={formErrors}
                                />
                                <StockStatusMessage
                                    cartItems={cartItems}
                                    message={stockStatusMessageElement}
                                />
                            </div>
                            {
                                checkoutStep < CHECKOUT_STEP.PAYMENT && signInContainerElement
                            }
                            <ShippingInformation
                                setCheckoutStep={setCheckoutStep}
                                CHECKOUT_STEP={CHECKOUT_STEP}
                                isGuestCheckout={isGuestCheckout}
                                checkoutStep={checkoutStep}
                                deliveryDate={deliveryDate}
                                setDeliveryDate={setDeliveryDate}
                                handleCloseChangeStore={handleCloseChangeStore}
                                isOpen={showModalChangeStore}
                                cartItems={cartItems}
                                storeViewData={storeViewData}
                                setIsContinue={setIsContinue}
                                setSelectedAddressId={setSelectedAddressId}
                                selectedAddressId={selectedAddressId}
                                setLoading={setLoading}
                                isDeliveryTimeInit={isDeliveryTimeInit}
                                setIsDeliveryTimeInit={setIsDeliveryTimeInit}
                                doneGuestSubmit={doneGuestSubmit}
                                setDoneGuestSubmit={setDoneGuestSubmit}
                                setSelectedAddress={setSelectedAddress}
                                selectedAddress={selectedAddress}
                            />
                            {paymentInformationSection}
                        </div>
                        <div className={classes.summary}>
                            {orderSummary}
                        </div>
                    </FormProvider>
                </div>
            </>
        );
    }

    return (
        <div className={classes.root} data-cy="CheckoutPage-root">
            <StoreTitle>
                {formatMessage({
                    id: 'checkoutPage.titleCheckout',
                    defaultMessage: 'Checkout'
                })}
            </StoreTitle>
            {checkoutContent}
        </div>
    );
};

export default CheckoutPage;

CheckoutPage.propTypes = {
    classes: shape({
        root: string,
        checkoutContent: string,
        checkoutContent_hidden: string,
        heading_container: string,
        heading: string,
        cartLink: string,
        stepper_heading: string,
        shipping_method_heading: string,
        payment_information_heading: string,
        signInContainer: string,
        signInLabel: string,
        signInButton: string,
        empty_cart_container: string,
        shipping_information_container: string,
        shipping_method_container: string,
        payment_information_container: string,
        price_adjustments_container: string,
        items_review_container: string,
        summaryContainer: string,
        formErrors: string,
        review_order_button: string,
        place_order_button: string,
        signInContainerVisible: string,
        reCaptchaMargin: string
    })
};
