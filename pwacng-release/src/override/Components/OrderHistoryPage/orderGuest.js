import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_GUEST_ORDER } from './orderGuest.gql';
import { useIntl, FormattedMessage } from 'react-intl';
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import {Form} from "informed";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderGuest.module.scss";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "@magento/venia-ui/lib/components/TextInput";
import {isEmail, isRequired} from "../../Util/formValidators";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import Button from "@magento/venia-ui/lib/components/Button";
import StaticBreadcrumbs from "../Breadcrumbs/staticBreadcrumbs";
import GuestOrderDetail from "./guestOrderDetail";
import {Redirect, useLocation} from "react-router-dom";

const GuestOrderTracking = () => {
    const classes = useStyle(defaultClasses);
    const [{ isSignedIn }] = useUserContext();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const initOrderId = searchParams.get('id') || '';
    const initEmail = searchParams.get('email') || '';
    const [orderId, setOrderId] = useState(initOrderId);
    const [email, setEmail] = useState(initEmail);
    const [getOrder, { loading, data }] = useLazyQuery(GET_GUEST_ORDER);
    const { formatMessage } = useIntl();

    const [isDeliveryTracking, setIsDeliveryTracking] = useState(false);

    useEffect(() => {
        if (initOrderId && initEmail) {
            getOrder({ variables: { order_number: initOrderId, email: initEmail } });
        }
    }, [initOrderId, initEmail, getOrder]);

    const handleOrderCheck = () => {
        getOrder({ variables: { order_number: orderId, email } });
    };

    if (isSignedIn) {
        return <Redirect to="/order-history" />;
    }

    return (
        <div className={classes.guestOrderTracking}>
            { (!data || (data && !data.orderTracking)) && (
                <>
                    <div className={classes.breadcrumbs}>
                        <StaticBreadcrumbs pageTitle={
                            formatMessage(
                                {
                                    id: "global.orderTracking",
                                    defaultMessage: 'Order Tracking'
                                }
                            )
                        } />
                    </div>
                    <div className={classes.orderTrackingMessage}>
                        <FormattedMessage
                            id={'orderTracking.message'}
                            defaultMessage={'Please enter the Order Number and Email used to check the order. (Check receipt or email for Order Number information)'}
                        />
                    </div>
                    <div className={classes.orderTrackingForm}>
                        <h1>
                            <FormattedMessage
                                id={'orderTracking.title'}
                                defaultMessage={'Order Tracking'}
                            />
                        </h1>
                        <Form className={classes.trackingForm} onSubmit={handleOrderCheck}>
                            <Field
                                id="orderId"
                                label={formatMessage({
                                    id: 'global.orderId',
                                    defaultMessage: 'Order id'
                                })}
                                optional={true}
                            >
                                <TextInput
                                    field="orderId"
                                    validate={isRequired}
                                    data-cy="orderId"
                                    placeholder={formatMessage({
                                        id: 'global.orderId',
                                        defaultMessage: 'Order id'
                                    })}
                                    initialValue={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                            </Field>
                            <Field
                                id="email"
                                label={formatMessage({
                                    id: 'global.paymentEmail',
                                    defaultMessage: 'Payment email'
                                })}
                                optional={true}
                            >
                                <TextInput
                                    field="email"
                                    validate={combine([isRequired, isEmail])}
                                    data-cy="email"
                                    placeholder={formatMessage({
                                        id: 'global.paymentEmail',
                                        defaultMessage: 'Payment email'
                                    })}
                                    initialValue={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Field>
                            <Button
                                data-cy="Dialog-confirmButton"
                                priority="high"
                                type="submit"
                            >
                                <FormattedMessage
                                    id={'orderTracking.trackingButton'}
                                    defaultMessage={'Order Tracking'}
                                />
                            </Button>
                        </Form>
                    </div>
                </>
            )}
            {loading && <LoadingIndicator/>}
            { data && (
                data.orderTracking ? (
                    <div className={classes.orderDetail}>
                        <div className={classes.breadcrumbs}>
                            {isDeliveryTracking ? (
                                <StaticBreadcrumbs
                                    pageTitle={
                                        formatMessage(
                                            {
                                                id: "orderDetail.deliveryInformation",
                                                defaultMessage: 'Delivery information'
                                            }
                                        )
                                    }
                                    parentTitle={
                                        formatMessage(
                                            {
                                                id: "global.orderInformation",
                                                defaultMessage: 'Order information'
                                            }
                                        )
                                    }
                                    setIsDeliveryTracking={setIsDeliveryTracking}
                                />
                            ) : (
                                <StaticBreadcrumbs
                                    pageTitle={
                                        formatMessage(
                                            {
                                                id: "global.orderInformation",
                                                defaultMessage: 'Order information'
                                            }
                                        )
                                    }
                                    setIsDeliveryTracking={setIsDeliveryTracking}
                                />
                            )}
                        </div>
                        <GuestOrderDetail order={data.orderTracking} isDeliveryTracking={isDeliveryTracking} setIsDeliveryTracking={setIsDeliveryTracking}/>
                    </div>
                ) : (
                    <div className={classes.noResult}>
                        <FormattedMessage
                            id={'orderTracking.noResult'}
                            defaultMessage={'No order found'}
                        />
                    </div>
                )
            )}
        </div>
    );
}

export default GuestOrderTracking;
