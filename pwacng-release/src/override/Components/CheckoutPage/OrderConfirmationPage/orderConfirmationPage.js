import React, {useEffect, useMemo} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { object, shape, string } from 'prop-types';
import { useOrderConfirmationPage } from '../../../Talons/CheckoutPage/OrderConfirmationPage/useOrderConfirmationPage';
import { Success, Failed, Pending } from '@magenest/theme/static/icons';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import {useHistory, useLocation, Redirect} from 'react-router-dom';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage//OrderConfirmationPage/orderConfirmationPage.module.css';
import orderConfirmationPageClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/orderConfirmationPage.module.scss';
import {Link} from "react-router-dom";
import Button from "../../Button/button";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {fullPageLoadingIndicator} from "@magento/venia-ui/lib/components/LoadingIndicator";

const OrderConfirmationPage = () => {
    const classes = useStyle(defaultClasses, orderConfirmationPageClasses);
    const { formatMessage } = useIntl();
    const location = useLocation();
    const history = useHistory();
    const { search } = location;
    const query = new URLSearchParams(search);
    const apptransid = query.get('apptransid') || null;
    const orderNumber = query.get('orderId') || query.get('vnp_OrderInfo') || (apptransid && apptransid.split('_')[1]);

    if (!orderNumber || orderNumber === 'null') {
        return <Redirect to="/" />
    }

    const talonProps = useOrderConfirmationPage({
        search,
        orderNumber
    });

    const [{ isSignedIn }] = useUserContext();
    const {
        handleCancelOrder,
        handleReOrder,
        handleReOrderGuest,
        data,
        orderStatus,
        loading,
        orderPaymentId,
        customerEmail
    } = talonProps;

    const email = query.get('email') || customerEmail;
    // const orderId = query.get('id') || String(orderPaymentId);

    useEffect(() => {
        const { scrollTo } = globalThis;

        if (typeof scrollTo === 'function') {
            scrollTo({
                left: 0,
                top: 0,
                behavior: 'smooth'
            });
        }
    }, []);

    const storeTitle = useMemo(() => {
        if (orderStatus === 'success') {
            return (
                <StoreTitle>
                    {formatMessage({
                        id: 'checkoutPage.thankYou',
                        defaultMessage: 'Order successful'
                    })}
                </StoreTitle>
            )
        } else if (orderStatus === 'pending') {
            return  (
                <StoreTitle>
                    {formatMessage({
                        id: 'checkoutPage.paymentPending',
                        defaultMessage: 'Pending payment'
                    })}
                </StoreTitle>
            )
        } else {
            return (
                <StoreTitle>
                    {formatMessage({
                        id: 'checkoutPage.paymentFailed',
                        defaultMessage: 'Order failed'
                    })}
                </StoreTitle>
            )
        }
    }, [orderStatus]);


    const content = useMemo(() => {
        if (orderStatus === 'success') {
            return (
                <>
                    <img src={Success} alt={''} />
                    <strong
                        data-cy="OrderConfirmationPage-header"
                        className={classes.heading}
                    >
                        <FormattedMessage
                            id={'checkoutPage.thankYou'}
                            defaultMessage={'Order successful'}
                        />
                    </strong>
                </>
            )
        } else if (orderStatus === 'pending') {
            return (
                <>
                    <img src={Pending} alt={''} />
                    <strong
                        data-cy="OrderConfirmationPage-header"
                        className={`${classes.heading} ${classes.headingPending}`}
                    >
                        <FormattedMessage
                            id={'checkoutPage.paymentPending'}
                            defaultMessage={'Pending payment'}
                        />
                    </strong>
                </>
            )
        } else {
            return (
                <>
                    <img src={Failed} alt={''} />
                    <strong
                        data-cy="OrderConfirmationPage-header"
                        className={`${classes.heading} ${classes.headingFailed}`}
                    >
                        <FormattedMessage
                            id={'checkoutPage.paymentFailed'}
                            defaultMessage={'Order failed'}
                        />
                    </strong>
                </>
            )
        }
    }, [orderStatus])

    if (loading) {
        return (<div className={classes.rootLoading}>{fullPageLoadingIndicator}</div>);
    }

    window.history.replaceState(null, '', window.location.pathname);

    return (
        <div className={classes.root} data-cy="OrderConfirmationPage-root">
            {storeTitle}
            <div className={classes.mainContainer}>
                {content}
                <div
                    data-cy="OrderConfirmationPage-orderNumber"
                    className={classes.orderNumber}
                >
                    <FormattedMessage
                        id={'orderConfirmPage.orderNumber'}
                        defaultMessage={'Order Number: '}
                    />
                    <strong>
                        #{orderNumber}
                    </strong>
                </div>
                {
                    (orderStatus === 'success' || orderStatus === 'pending') && (
                        <>
                            <Link className={classes.trackingOrder} to={isSignedIn ? `order/${orderNumber}` : `order-tracking?id=${orderNumber}&email=${email}`}>
                                <FormattedMessage
                                    id={'global.orderTracking'}
                                    defaultMessage={'Order tracking'}
                                />
                            </Link>
                            {/*{*/}
                            {/*    isSignedIn && (*/}
                            {/*        <div className={classes.action}>*/}
                            {/*            <Button onClick={() => handleCancelOrder(orderId, email)} priority={'high'} type={'button'}>*/}
                            {/*                <FormattedMessage*/}
                            {/*                    id={'global.cancelOrder'}*/}
                            {/*                    defaultMessage={'Cancel order'}*/}
                            {/*                />*/}
                            {/*            </Button>*/}
                            {/*        </div>*/}
                            {/*    )*/}
                            {/*}*/}
                        </>
                    )
                }
                { (orderStatus === 'success' || orderStatus === 'pending') && (
                    <>
                        <p className={classes.descriptionNote}>
                            <FormattedMessage
                                id={'checkoutSuccess.descriptionNote'}
                                defaultMessage={'* To protect the environment, MM Mega Market has phased out plastic bags for deliveries. Please bring your bags when receiving orders. Thank you for partnering with MM Mega Market.'}
                            />
                        </p>
                    </>
                )}
                <p className={`${classes.description} ${classes.descriptionFailed}`}>
                    <FormattedMessage
                        id={'checkoutSuccess.description'}
                        defaultMessage={'If you have any problems during the purchasing process, please contact the hotline <highlight>{value}</highlight> for support!'}
                        values={{
                            highlight: chunks => (
                                <a href={'tel:1800646878'} className={classes.headingHighlight}>{chunks}</a>
                            ),
                            value: '1800 646878'
                        }}
                    />
                </p>
                { (orderStatus === 'success' || orderStatus === 'pending') ? (
                    <div className={classes.action}>
                        <Button onClick={() => history.push('/')} priority={'high'} type={'button'}>
                            <FormattedMessage
                                id={'global.continueShopping'}
                                defaultMessage={'Continue shopping'}
                            />
                        </Button>
                    </div>
                ) : (
                    <div className={classes.action}>
                        <Link className={classes.button} to={isSignedIn ? `order/${orderNumber}` : `order-tracking?id=${orderNumber}&email=${email}`}>
                            <FormattedMessage
                                id={'orderTracking.trackingButton'}
                                defaultMessage={'Order tracking'}
                            />
                        </Link>
                        {
                            isSignedIn ? (
                                <Button onClick={handleReOrder} priority={'high'} type={'button'}>
                                    <FormattedMessage
                                        id={'global.reorder'}
                                        defaultMessage={'Reorder'}
                                    />
                                </Button>
                            ) : (
                                <Button onClick={handleReOrderGuest} priority={'high'} type={'button'}>
                                    <FormattedMessage
                                        id={'global.reorder'}
                                        defaultMessage={'Reorder'}
                                    />
                                </Button>
                            )
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderConfirmationPage;

OrderConfirmationPage.propTypes = {
    classes: shape({
        addressStreet: string,
        mainContainer: string,
        heading: string,
        orderNumber: string,
        shippingInfoHeading: string,
        shippingInfo: string,
        email: string,
        name: string,
        addressAdditional: string,
        shippingMethodHeading: string,
        shippingMethod: string,
        itemsReview: string,
        additionalText: string,
        sidebarContainer: string
    })
};
