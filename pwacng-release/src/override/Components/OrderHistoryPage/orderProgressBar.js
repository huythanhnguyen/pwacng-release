import React, {Fragment, useMemo} from 'react';
import { useIntl } from 'react-intl';
import { shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderProgressBar.module.scss';

const TOTAL_STEPS = 4;

const OrderProgressBar = props => {
    const { state, status, status_code } = props;
    if (!state) return (<></>);
    const progressBarClass = `state_${state} status_${status_code}`
    const { formatMessage } = useIntl();
    const statusStepMap = new Map([
        ['holded', 0],
        ['canceled', 1],
        ['closed', 1],
        ['new', 1],
        ['pending_payment', 1],
        ['payment_review', 1],
        ['waiting_cancel', 1],
        ['processing', 2],
        ['complete', 4]
    ]);
    const stepTextDefault = {
        step1: formatMessage({
            id: 'orderProgressBar.step1',
            defaultMessage: 'Order received'
        }),
        step2: formatMessage({
            id: 'orderProgressBar.step2',
            defaultMessage: 'Processing'
        }),
        step3: formatMessage({
            id: 'orderProgressBar.step3',
            defaultMessage: 'On Delivery'
        }),
        step4: formatMessage({
            id: 'orderProgressBar.step4',
            defaultMessage: 'Delivered'
        }),
        holded: formatMessage({
            id: 'orderProgressBar.holdedText',
            defaultMessage: 'Order Holded'
        }),
        closed: formatMessage({
            id: 'orderProgressBar.closedText',
            defaultMessage: 'Order Closed'
        }),
        canceled: formatMessage({
            id: 'orderProgressBar.canceledText',
            defaultMessage: 'Order Canceled'
        }),
        pending_payment: formatMessage({
            id: 'orderProgressBar.pendingPaymentText',
            defaultMessage: 'Pending Payment'
        }),
        waiting_cancel: formatMessage({
            id: 'orderProgressBar.paymentFailed',
            defaultMessage: 'Payment failed'
        })
    }
    const currentStep = (() => {
        switch (status_code) {
            case 'in_shipment_ccod':
                return 3;
            case 'invoiced_ccod':
                return 3;
            case 'picking_ccod':
                return 3;
            case 'picked_ccod':
                return 3;
            case 'order_error':
                return 2;
            case 'pending_ccod':
                return 1;
            case 'order_split':
                return 2;
            default:
                return statusStepMap.get(state);
        }
    })();
    const classes = useStyle(defaultClasses, props.classes);

    const stepElements = useMemo(() => {
        const elements = [];
        for (let step = 1; step <= TOTAL_STEPS; step++) {
            const activeStepClass = step <= currentStep ? classes.step_completed : '';
            const currentStepClass = (step === currentStep) ? classes.currentStep : '';
            elements.push(
                <Fragment key={step}>
                    <span className={`step${step} ${classes.step} ${activeStepClass} ${currentStepClass}`} title={step === currentStep ? status : ''}>
                        <span className={classes.stepText}>
                        {
                            step === currentStep && (state === 'holded' || state === 'closed' || state === 'canceled' || state === 'pending_payment' || state === 'waiting_cancel')
                                ? stepTextDefault[state]
                                : stepTextDefault[`step${step}`]
                        }
                        </span>
                    </span>
                    { step !== TOTAL_STEPS && (<span className={classes.divider}>{''}</span>) }
                </Fragment>
            );
        }

        return elements;
    }, [classes, currentStep]);

    return <div className={`${classes.root} ${progressBarClass}`}>
        <div className={classes.orderProgressBar}>{stepElements}</div>
    </div>;
};

export default OrderProgressBar;

OrderProgressBar.propTypes = {
    classes: shape({
        root: string,
        step: string,
        step_completed: string
    }),
    status: string.isRequired
};
