import React, {useRef, useState} from 'react';
import { useStyle } from "@magento/venia-ui/lib/classify";
import orderDetailClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderDetail.module.scss';
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/guestOrderDetail.module.scss';
import OrderProgressBar from "./orderProgressBar";
import DeliveryProgressBar from "./deliveryProgressBar";
import OrderItems from "./orderItems";
import OrderTotal from "./orderTotal";
import DeliveryTracking from "./deliveryTracking";
import {FormattedMessage, useIntl} from "react-intl";
import Button from "../Button/button";
import {useReactToPrint} from "react-to-print";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import {useToasts} from "@magento/peregrine";

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const GuestOrderDetail = props => {
    const classes = useStyle(orderDetailClasses, defaultClasses, props.classes);
    const { order, isDeliveryTracking, setIsDeliveryTracking } = props;
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({
        content: () => contentRef.current,
        removeAfterPrint: false
    });

    const orderItems = order.items || [];

    const streetRows = order.shipping_address?.street ? order.shipping_address.street.map((row) => row).join(', ') : '';
    const shippingAddressString = order.shipping_address ? `${streetRows}, ${order.shipping_address.ward}, ${order.shipping_address.district ? `${order.shipping_address.district}, ` : ''}${order.shipping_address.city}` : '';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Convert date to ISO-8601 format so Safari can also parse it
        const isoFormattedDate = dateString.replace(' ', 'T');
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(isoFormattedDate));
    };

    const handleCopy = (orderId) => {
        navigator.clipboard.writeText(orderId).then(() => {
            addToast({
                type: 'success',
                message: formatMessage({
                    id: 'global.copyOrderId',
                    defaultMessage: 'Copy the order id successfully'
                }),
                timeout: 5000
            });
        }).catch(error => {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 7000
            });
        });
    }

    return (
        <>
                {!isDeliveryTracking ? (
                    <>
                        <div className={classes.root} ref={contentRef}>
                            <OrderProgressBar state={order.state} status_code={order.status_code} status={order.status} />
                            <div className={classes.orderInformation}>
                                <div className={classes.orderInformationBox}>
                                    <div className={classes.boxTitle}>
                                        <FormattedMessage
                                            id={'global.order'}
                                            defaultMessage={'Order'}
                                        />
                                    </div>
                                    <div className={classes.information}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'global.orderId'}
                                                defaultMessage={'Order id'}
                                            />
                                        </p>
                                        <p className={`${classes.value} ${classes.orderIdWrap}`}>
                                            <span className={classes.orderId}>
                                                #{order.number}
                                            </span>
                                            <button onClick={() => handleCopy(order.number)} className={classes.copy}>
                                                <span className='hidden'>
                                                    <FormattedMessage
                                                        id={'global.copy'}
                                                        defaultMessage={'copy'}
                                                    />
                                                </span>
                                            </button>
                                            <span className={`${classes.status} state_${order.state} status_${order.status_code}`}>
                                            {order.status}
                                        </span>
                                        </p>
                                    </div>
                                    <div className={classes.information}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'order.orderDate'}
                                                defaultMessage={'Order date'}
                                            />
                                        </p>
                                        <p className={classes.value}>{formatDate(order.order_date)}</p>
                                    </div>
                                    <div className={classes.information}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'global.paymentMethod'}
                                                defaultMessage={'Payment method'}
                                            />
                                        </p>
                                        <p className={classes.value}>
                                            {order.payment_methods[0]?.name || ''}
                                        </p>
                                    </div>
                                    {
                                        order?.promotion_message && (
                                            <div className={classes.information}>
                                                <p className={classes.label}>
                                                    <FormattedMessage
                                                        id={'global.note'}
                                                        defaultMessage={'Note'}
                                                    />
                                                </p>
                                                <p className={classes.value}>
                                                    {order.promotion_message}
                                                </p>
                                            </div>
                                        )
                                    }
                                    {
                                        order.customer_no && (
                                            <div className={classes.information}>
                                                <p className={classes.label}>
                                                    <FormattedMessage
                                                        id={'global.customerId'}
                                                        defaultMessage={'Customer id'}
                                                    />
                                                </p>
                                                <p className={classes.value}>{order.customer_no}</p>
                                            </div>
                                        )
                                    }
                                </div>
                                <div className={classes.orderInformationBox}>
                                    <div className={classes.boxTitle}>
                                        <FormattedMessage
                                            id={'global.customer'}
                                            defaultMessage={'Customer'}
                                        />
                                    </div>
                                    <div className={`${classes.information} ${classes.customer}`}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'global.customer'}
                                                defaultMessage={'Customer'}
                                            />
                                        </p>
                                        <p className={classes.value}>{order.shipping_address ? order.shipping_address.firstname : ''}</p>
                                    </div>
                                    {
                                        shippingAddressString && (
                                            <div className={classes.information}>
                                                <p className={classes.label}>
                                                    <FormattedMessage
                                                        id={'global.address'}
                                                        defaultMessage={'Address'}
                                                    />
                                                </p>
                                                <p className={classes.value}>{shippingAddressString}</p>
                                            </div>
                                        )
                                    }
                                    <div className={classes.information}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'global.phone'}
                                                defaultMessage={'Phone'}
                                            />
                                        </p>
                                        <p className={classes.value}>{order.shipping_address ? order.shipping_address.telephone : ''}</p>
                                    </div>
                                    <div className={classes.information}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'global.email'}
                                                defaultMessage={'Email'}
                                            />
                                        </p>
                                        <p className={classes.value}>{order.email || ''}</p>
                                    </div>
                                </div>
                                <div className={classes.orderInformationBox}>
                                    <div className={classes.boxTitle}>
                                        <FormattedMessage
                                            id={'orderDetail.deliveryInformation'}
                                            defaultMessage={'Delivery Information'}
                                        />
                                    </div>
                                    { (!!order.is_sync_ccod || !!order.shipping_code) && (
                                        <div className={classes.information}>
                                            { !!order.shipping_code && (
                                                <>
                                                    <p className={classes.label}>
                                                        <FormattedMessage
                                                            id={'orderDetail.deliveryCode'}
                                                            defaultMessage={'Delivery code'}
                                                        />
                                                    </p>
                                                    <p className={`${classes.value} ${classes.orderIdWrap}`}>
                                                        <span className={classes.orderId}>
                                                            #{order.shipping_code}
                                                        </span>
                                                        <span className={`${classes.status} status_${order.delivery_code}`}>
                                                            {order.delivery_status}
                                                        </span>
                                                    </p>
                                                </>
                                            )}
                                            <button className={classes.deliveryTrackingAction} onClick={() => setIsDeliveryTracking(true)}>
                                                <FormattedMessage
                                                    id={'orderDetail.deliveryDetails'}
                                                    defaultMessage={'Delivery details'}
                                                />
                                            </button>
                                        </div>
                                    )}
                                    { order.delivery_information && order.delivery_information.delivery_date && (
                                        <div className={classes.information}>
                                            <p className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.deliveryTimeSelected'}
                                                    defaultMessage={'Selected delivery time'}
                                                />
                                            </p>
                                            <p className={`${classes.value} ${classes.orderIdWrap}`}>
                                                {`${order.delivery_information.delivery_from} - ${order.delivery_information.delivery_to} `}&nbsp;
                                                {formatDate(order.delivery_information.delivery_date)}
                                            </p>
                                        </div>
                                    )}
                                    { order.vat_information && order.vat_information.company_vat_number && (
                                        <div className={classes.information}>
                                            <p className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.vatInvoiceInformation'}
                                                    defaultMessage={'VAT invoice information'}
                                                />
                                            </p>
                                            <p className={classes.value}>
                                                <strong className={classes.companyName}>{order.vat_information.company_name}</strong><br/>
                                                <span className={classes.companyAddress}>{order.vat_information.company_address}</span><br/>
                                                <FormattedMessage
                                                    id={'vat.TIN'}
                                                    defaultMessage={'TIN'}
                                                />
                                                {': '}
                                                {order.vat_information.company_vat_number || ''}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {
                                orderItems.length && (
                                    <div className={classes.productListing}>
                                        <div className={classes.productListingTitle}>
                                            <strong>
                                                <FormattedMessage
                                                    id={'global.productList'}
                                                    defaultMessage={'Product listing'}
                                                />
                                            </strong>
                                            <span className={classes.count}>
                                            {'('}
                                                {orderItems.length}
                                                {' '}
                                                {
                                                    orderItems.length > 1 ? (
                                                        <FormattedMessage
                                                            id="order.products"
                                                            defaultMessage="products"
                                                        />
                                                    ) : (
                                                        <FormattedMessage
                                                            id="order.product"
                                                            defaultMessage="product"
                                                        />
                                                    )
                                                }
                                                {')'}
                                        </span>
                                        </div>
                                        <div className={classes.productListingContent}>
                                            <div className={classes.productsWrap}>
                                                <OrderItems items={orderItems}/>
                                            </div>
                                            <div className={classes.orderTotalWrap}>
                                                <OrderTotal orderTotal={order.total}/>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        <div className={classes.action}>
                            <Button priority='high' onClick={reactToPrintFn}>
                                <FormattedMessage
                                    id={'guestOrderDetail.printOrderText'}
                                    defaultMessage={'Print order'}
                                />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className={classes.root}>
                        <DeliveryProgressBar status={order.delivery_code || 'preparing_delivery'} />
                        <div className={classes.orderInformation}>
                            <div className={classes.orderInformationBox}>
                                <div className={classes.boxTitle}>
                                    <FormattedMessage
                                        id={'global.orderInformation'}
                                        defaultMessage={'Order information'}
                                    />
                                </div>
                                {!!order.shipping_code && (
                                    <div className={classes.information}>
                                        <p className={classes.label}>
                                            <FormattedMessage
                                                id={'orderDetail.deliveryCode'}
                                                defaultMessage={'Delivery code'}
                                            />
                                        </p>
                                        <p className={`${classes.value} ${classes.orderIdWrap}`}>
                                            <span className={classes.orderId}>
                                                #{order.shipping_code}
                                            </span>
                                            <span className={`${classes.status} status_${order.delivery_code}`}>
                                                {order.delivery_status}
                                            </span>
                                        </p>
                                    </div>
                                )}
                                <div className={classes.information}>
                                    <p className={classes.label}>
                                        <FormattedMessage
                                            id={'global.orderId'}
                                            defaultMessage={'Order id'}
                                        />
                                    </p>
                                    <p className={`${classes.value} ${classes.orderIdWrap}`}>
                                        <span className={classes.orderId}>
                                            #{order.number}
                                        </span>
                                        <button onClick={() => handleCopy(order.number)} className={classes.copy}>
                                            <span className='hidden'>
                                                <FormattedMessage
                                                    id={'global.copy'}
                                                    defaultMessage={'copy'}
                                                />
                                            </span>
                                        </button>
                                        <button className={classes.deliveryTrackingAction} onClick={() => setIsDeliveryTracking(false)}>
                                            <FormattedMessage
                                                id={'global.orderDetails'}
                                                defaultMessage={'Order details'}
                                            />
                                        </button>
                                    </p>
                                </div>
                                <div className={classes.information}>
                                    <p className={classes.label}>
                                        <FormattedMessage
                                            id={'order.orderDate'}
                                            defaultMessage={'Order date'}
                                        />
                                    </p>
                                    <p className={classes.value}>{formatDate(order.order_date)}</p>
                                </div>
                                <div className={`${classes.information} ${classes.customer}`}>
                                    <p className={classes.label}>
                                        <FormattedMessage
                                            id={'global.customerName'}
                                            defaultMessage={'Customer name'}
                                        />
                                    </p>
                                    <p className={classes.value}>{order.shipping_address ? order.shipping_address.firstname : ''}</p>
                                </div>
                                {
                                    shippingAddressString && (
                                        <div className={classes.information}>
                                            <p className={classes.label}>
                                                <FormattedMessage
                                                    id={'global.shippingAddress'}
                                                    defaultMessage={'Shipping address'}
                                                />
                                            </p>
                                            <p className={classes.value}>{shippingAddressString}</p>
                                        </div>
                                    )
                                }
                                <div className={classes.information}>
                                    <p className={classes.label}>
                                        <FormattedMessage
                                            id={'global.phone'}
                                            defaultMessage={'Phone'}
                                        />
                                    </p>
                                    <p className={classes.value}>{order.shipping_address ? order.shipping_address.telephone : ''}</p>
                                </div>
                            </div>
                            <div className={`${classes.orderInformationBox} ${classes.orderInformationBox2Col}`}>
                                <DeliveryTracking orderId={atob(order.id)} email={order.email} createAt={order.order_date} shippingCode={order.shipping_code || null} />
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
};

export default GuestOrderDetail;
