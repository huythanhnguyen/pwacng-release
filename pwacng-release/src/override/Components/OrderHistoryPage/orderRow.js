import React, {useCallback, useEffect} from 'react';
import { arrayOf, number, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderRow.module.scss';
import {Link, useHistory} from "react-router-dom";
import Button from "@magento/venia-ui/lib/components/Button";
import {useMutation} from "@apollo/client";
import {REORDER} from "./reorder.gql";
import {useToasts} from "@magento/peregrine";
import {AlertCircle as AlertCircleIcon} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const OrderRow = props => {
    const { order } = props;
    const {
        number: orderNumber,
        order_date: orderDate,
        status,
        status_code,
        state,
        total
    } = order;
    const { grand_total: grandTotal } = total;
    const { currency, value: orderTotal } = grandTotal;
    const history = useHistory();
    const [, { addToast }] = useToasts();

    // Convert date to ISO-8601 format so Safari can also parse it
    const isoFormattedDate = orderDate.replace(' ', 'T');
    const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(isoFormattedDate));

    const derivedStatus = status;

    const classes = useStyle(defaultClasses, props.classes);

    const [reorder, { data:reorderData, loading:reorderLoading, error:reorderError }] = useMutation(
        REORDER,
        {
            fetchPolicy: 'no-cache',
            onCompleted: () => {
                history.push('/cart');
            }
        }
    );
    const handleReOrder = useCallback( () => {
        reorder({
            variables: {
                orderNumber: orderNumber
            }
        }).then(response => {
            if (response.errors) {
                response.errors && response.errors.map(error => (
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: error.message,
                        dismissable: true,
                        timeout: 5000
                    })
                ))
            }
        }).catch(error => {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message || 'An unexpected error occurred.',
                dismissable: true,
                timeout: 5000
            })
        });
    }, [orderNumber, reorder]);

    const orderTotalPrice =
        currency && orderTotal !== null ? (
            <Price currencyCode={currency} value={orderTotal} />
        ) : (
            '-'
        );

    return (
        <tr className={classes.root}>
            <td className={classes.orderNumberContainer}>
                <span className={classes.label}>
                    <FormattedMessage
                        id={'global.order'}
                        defaultMessage={"Order"}
                    />
                </span>
                <span className={classes.value}>{'#'}{orderNumber}</span>
            </td>
            <td className={classes.orderDateContainer}>
                <span className={classes.label}>
                    <FormattedMessage
                        id={'order.orderDate'}
                        defaultMessage={'Order Date'}
                    />
                </span>
                <span className={classes.value}>{formattedDate}</span>
            </td>
            <td className={classes.orderSendToContainer}>
                <span className={classes.label}>
                    <FormattedMessage
                        id={'global.sendTo'}
                        defaultMessage={"Send to"}
                    />
                </span>
                <span className={classes.value}>
                    {order.shipping_address?.firstname || ''}
                </span>
            </td>
            <td className={classes.orderTotalContainer}>
                <span className={classes.label}>
                    <FormattedMessage
                        id={'global.orderTotal'}
                        defaultMessage={'Order Total'}
                    />
                </span>
                <span className={classes.value}>{orderTotalPrice}</span>
            </td>
            <td className={classes.orderStatusContainer}>
                <span className={classes.label}>
                    <FormattedMessage
                        id={'global.status'}
                        defaultMessage={"Status"}
                    />
                </span>
                <span className={classes.value}>
                    <span className={`${classes.status} state_${state} status_${status_code}`}>
                        {derivedStatus}
                    </span>
                </span>
            </td>
            <td className={classes.orderActionsContainer}>
                <div className={classes.actions}>
                    <Link className={classes.view} to={`/order/${orderNumber}`}>
                        <FormattedMessage
                            id={'global.details'}
                            defaultMessage={"Details"}
                        />
                    </Link>
                    <Button type="button" onClick={handleReOrder} className={classes.reorder}>
                        <FormattedMessage
                            id={'global.reorder'}
                            defaultMessage={'Reorder'}
                        />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export default OrderRow;
OrderRow.propTypes = {
    classes: shape({
        root: string,
        cell: string,
        stackedCell: string,
        label: string,
        value: string,
        orderNumberContainer: string,
        orderDateContainer: string,
        orderTotalContainer: string,
        orderSendToContainer: string,
        orderStatusContainer: string,
        orderActionsContainer: string,
        contentToggleContainer: string,
        orderNumberLabel: string,
        orderDateLabel: string,
        orderTotalLabel: string,
        orderNumber: string,
        orderDate: string,
        orderTotal: string,
        orderStatusBadge: string,
        content: string,
        content_collapsed: string
    }),
    order: shape({
        billing_address: shape({
            city: string,
            country_code: string,
            firstname: string,
            postcode: string,
            region_id: string,
            street: arrayOf(string)
        }),
        invoices: arrayOf(
            shape({
                id: string
            })
        ),
        number: string,
        order_date: string,
        payment_methods: arrayOf(
            shape({
                type: string,
                additional_data: arrayOf(
                    shape({
                        name: string,
                        value: string
                    })
                )
            })
        ),
        shipping_address: shape({
            city: string,
            country_code: string,
            firstname: string,
            lastname: string,
            postcode: string,
            region_id: string,
            street: arrayOf(string),
            telephone: string
        }),
        shipping_method: string,
        shipments: arrayOf(
            shape({
                id: string,
                tracking: arrayOf(
                    shape({
                        number: string
                    })
                )
            })
        ),
        status: string,
        total: shape({
            discounts: arrayOf(
                shape({
                    amount: shape({
                        currency: string,
                        value: number
                    })
                })
            ),
            grand_total: shape({
                currency: string,
                value: number
            }),
            subtotal: shape({
                currency: string,
                value: number
            }),
            total_tax: shape({
                currency: string,
                value: number
            }),
            total_shipping: shape({
                currency: string,
                value: number
            })
        })
    })
};
