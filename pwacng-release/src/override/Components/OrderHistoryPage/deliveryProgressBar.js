import React from 'react';
import {FormattedMessage} from 'react-intl';
import { shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magenest/theme/BaseComponents/OrderHistoryPage/extendStyle/orderProgressBar.module.scss';

const DeliveryProgressBar = props => {
    const { status } = props;
    const classes = useStyle(defaultClasses, props.classes);

    const statusCode = status.toLowerCase();
    const currentStep = (() => {
        switch (statusCode) {
            case 'start_trip':
                return 1;
            case 'on_going':
                return 2;
            case 'delivery_success':
                return 3;
            case 'delivery_failed':
                return 4;
            default:
                return 0;
        }
    })();

    return <div className={`${classes.root} ${classes.deliveryProgressBar}`}>
        <div className={classes.orderProgressBar}>
            <span className={currentStep > 0 ? `${classes.step} ${classes.step_completed} step1` : `${classes.step} step1`}>
                <span className={classes.stepText}>
                    <FormattedMessage
                        id={'delivery.startTrip'}
                        defaultMessage={'Start trip'}
                    />
                </span>
            </span>
            <span className={classes.divider}>{''}</span>
            <span className={currentStep > 1 ? `${classes.step} ${classes.step_completed} step3` : `${classes.step} step3`}>
                <span className={classes.stepText}>
                    <FormattedMessage
                        id={'delivery.onGoing'}
                        defaultMessage={'On going'}
                    />
                </span>
            </span>
            <span className={classes.divider}>{''}</span>
            <span className={
                currentStep === 3 ?
                    `${classes.step} ${classes.step_completed} step4`
                    : (currentStep === 4 ? `${classes.step} ${classes.step_failed} step4` : `${classes.step} step4`)
            }>
                <span className={classes.stepText}>
                    { currentStep === 3 ? (
                        <FormattedMessage
                            id={'delivery.deliverySuccess'}
                            defaultMessage={'Delivery success'}
                        />
                    ) : (
                        <>
                            { currentStep === 4 ? (
                                <FormattedMessage
                                    id={'delivery.deliveryFailed'}
                                    defaultMessage={'Delivery failed'}
                                />
                            ) : (
                                <FormattedMessage
                                    id={'delivery.deliverySuccess'}
                                    defaultMessage={'Delivery success'}
                                />
                            )}
                        </>
                    )}
                </span>
            </span>
        </div>
    </div>;
};

export default DeliveryProgressBar;

DeliveryProgressBar.propTypes = {
    classes: shape({
        root: string,
        step: string,
        step_completed: string,
        step_failed: string
    }),
    status: string.isRequired
};
