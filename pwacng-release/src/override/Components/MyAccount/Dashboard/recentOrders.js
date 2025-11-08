import React from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/MyAccount/Dashboard/extendStyle/recentOrders.module.scss';
import {FormattedMessage} from "react-intl";
import Button from "@magento/venia-ui/lib/components/Button";
import {Link} from "react-router-dom";
import Price from "@magento/venia-ui/lib/components/Price";
import OrderItems from "../../OrderHistoryPage/orderItems";

const RecentOrders = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {orders} = props;

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

    return (
        <div className={classes.root}>
            <div className={classes.recentOrdersTitle}>
                <strong>
                    <FormattedMessage
                        id="recentOrders.title"
                        defaultMessage="Recent orders"
                    />
                </strong>
                <Link to={'/order-history'}>
                    <FormattedMessage
                        id="global.viewAll"
                        defaultMessage="View all"
                    />
                </Link>
            </div>
            <div className={classes.orders}>
                {
                    orders.length > 0 && (
                        orders.map((order, index) => (
                            <div key={index} className={classes.orderRow}>
                                <div className={classes.orderTitle}>
                                    <div className={classes.orderId}>
                                        <Link className={classes.id} to={`/order/${order.number}`}>
                                            <span className={classes.label}>
                                                <FormattedMessage
                                                    id="global.orderId"
                                                    defaultMessage="Order id"
                                                />
                                                {' '}
                                            </span>
                                            <span className={classes.value}>
                                                {'#' + order.number}
                                            </span>
                                        </Link>
                                        <span className={`${classes.status} state_${order.state} status_${order.status_code}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className={classes.orderDate}>
                                        <span className={classes.label}>
                                            <FormattedMessage
                                                id="recentOrders.orderDate"
                                                defaultMessage="Order date"
                                            />
                                            {' '}
                                        </span>
                                        <span className={classes.value}>{formatDate(order.order_date)}</span>
                                    </div>
                                </div>
                                <div className={classes.orderContent}>
                                    <OrderItems items={order.items}/>
                                </div>
                                <div className={classes.orderTotals}>
                                    <span className={classes.itemCount}>
                                        {order.items.length}
                                        {' '}
                                        {
                                            order.items.length > 1 ? (
                                                <FormattedMessage
                                                    id="recentOrders.products"
                                                    defaultMessage="Products"
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id="recentOrders.product"
                                                    defaultMessage="Product"
                                                />
                                            )
                                        }
                                    </span>
                                    <span className={classes.orderTotal}>
                                        <span className={classes.label}>
                                            <FormattedMessage
                                                id="recentOrders.total"
                                                defaultMessage="Total"
                                            />
                                        </span>
                                        <span className={classes.price}>
                                            <Price currencyCode={order.total.grand_total.currency} value={order.total.grand_total.value} />
                                        </span>
                                    </span>
                                </div>
                            </div>
                        ))
                    )
                }
            </div>
        </div>
    );
};

export default RecentOrders;
