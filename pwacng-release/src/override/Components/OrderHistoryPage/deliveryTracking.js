import React  from 'react';
import { useStyle } from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/deliveryTracking.module.scss';
import {useQuery} from "@apollo/client";
import {GET_DELIVERY_DETAIL} from "./orderDetailPage.gql";
import {FormattedMessage} from "react-intl";

const DeliveryTracking = props => {
    const {orderId, email, createAt, shippingCode} = props;
    const classes = useStyle(defaultClasses, props.classes);

    const { loading, error, data } = useQuery(GET_DELIVERY_DETAIL, {
        fetchPolicy: 'cache-and-network',
        variables: {
            order_id: orderId,
            email: email
        },
        skip: !shippingCode
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString.replace(' ', 'T'));
        const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const datePart = new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
        return `${time} ${datePart}`;
    };

    if (loading || error) return <></>;
    return (
        <div className={classes.root}>
            <div className={classes.boxTitle}>
                <FormattedMessage
                    id={'orderDetail.deliveryInformation'}
                    defaultMessage={'Delivery Information'}
                />
                {data?.getDeliveryTracking?.tracking_link && (
                    <a href={data.getDeliveryTracking.tracking_link} className={classes.viewDetails} target='_blank'>
                        <FormattedMessage
                            id={'global.viewDetails'}
                            defaultMessage={'View details'}
                        />
                    </a>
                )}
            </div>
            <ul className={classes.deliveryTracking}>
                {data?.getDeliveryTracking?.history && data.getDeliveryTracking.history.slice().reverse().map((item, index) => {
                    const date = new Date(item.time.replace(' ', 'T'));
                    const displayTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

                    return (
                        <li key={index} className={index === 0 ? `${classes.deliveryItem} ${classes.active}` : classes.deliveryItem}>
                            <span className={classes.deliveryTime}>{displayTime}</span>
                            <span className={classes.deliveryText}>{item.status}</span>
                        </li>
                    );
                })}
                <li key={'preparing_delivery'} className={data?.getDeliveryTracking?.history?.length > 0 ? classes.deliveryItem : `${classes.deliveryItem} ${classes.active}`}>
                    <span className={classes.deliveryTime}>{formatDateTime(createAt)}</span>
                    <span className={classes.deliveryText}>
                        <FormattedMessage
                            id={'delivery.preparingDelivery'}
                            defaultMessage={'Preparing Delivery'}
                        />
                    </span>
                </li>
            </ul>
        </div>
    );
};

export default DeliveryTracking;
