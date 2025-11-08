import React  from 'react';
import { useStyle } from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderTotal.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import Price from "@magento/venia-ui/lib/components/Price";
import Modal from "../../../@theme/BaseComponents/Modal";

const MINUS_SYMBOL = '-';

const OrderTotal = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { orderTotal } = props;
    const { formatMessage } = useIntl();

    return (
        <table className={classes.orderTotal} width="100%" border="0" cellSpacing="0" cellPadding="0">
            <thead>
            <tr>
                <td colSpan={2}>
                    <FormattedMessage
                        id={'global.orderTotal'}
                        defaultMessage={'Order total'}
                    />
                </td>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th>
                    <span
                        title={formatMessage({
                            id: 'order.subtotalBeforePromotion',
                            defaultMessage: 'Total value of merchandise before promotion'
                        })}
                    >
                        <FormattedMessage
                            id={'order.subtotal'}
                            defaultMessage={'Subtotal'}
                        />
                    </span>
                </th>
                <td>
                    <Price
                        value={orderTotal.subtotal.value}
                        currencyCode={orderTotal.subtotal.currency}
                    />
                </td>
            </tr>
            {
                orderTotal.discounts?.length > 0 ? orderTotal.discounts.map((discount, index) => (
                    <tr key={index}>
                        <th>
                            {discount.label}
                        </th>
                        <td>
                            {MINUS_SYMBOL}
                            <Price
                                value={discount.amount.value}
                                currencyCode={discount.amount.currency}
                            />
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <th>
                            <FormattedMessage
                                id={'global.discount'}
                                defaultMessage={'Discount'}
                            />
                        </th>
                        <td>
                            <Price
                                value={0}
                                currencyCode={orderTotal.grand_total.currency}
                            />
                        </td>
                    </tr>
                )
            }
            <tr>
                <th>
                    <span
                        title={formatMessage({
                            id: 'order.subtotalAfterPromotion',
                            defaultMessage: 'Total value of merchandise after promotion'
                        })}
                    >
                        <FormattedMessage
                            id={'order.orderSubtotal'}
                            defaultMessage={'Subtotal order amount'}
                        />
                    </span>
                </th>
                <td>
                    <Price
                        value={orderTotal.base_total_after_discount.value}
                        currencyCode={orderTotal.base_total_after_discount.currency}
                    />
                </td>
            </tr>
            <tr>
                <th>
                    <FormattedMessage
                        id={'global.shippingFee'}
                        defaultMessage={'Shipping fee'}
                    />
                </th>
                <td>
                    <Price
                        value={orderTotal.total_shipping.value}
                        currencyCode={orderTotal.total_shipping.currency}
                    />
                </td>
            </tr>
            <tr className={classes.totalAmount}>
                <th>
                    <FormattedMessage
                        id={'order.totalPayment'}
                        defaultMessage={'Total payment'}
                    />
                </th>
                <td>
                    <Price
                        value={orderTotal.grand_total.value}
                        currencyCode={orderTotal.grand_total.currency}
                    />
                </td>
            </tr>
            <tr className={classes.totalNote}>
                <th>
                    <small>
                        <i>
                            <FormattedMessage
                                id={'order.orderDeliveryNote'}
                                defaultMessage={'(*) Note: Delivery fee will be paid upon receipt of goods'}
                            />
                        </i>
                    </small>
                </th>
                <td></td>
            </tr>
            </tbody>
        </table>
    );
};

export default OrderTotal;
