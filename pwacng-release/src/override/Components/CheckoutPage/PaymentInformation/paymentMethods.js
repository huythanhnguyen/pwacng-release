import React, {useMemo} from 'react';
import { shape, string, bool, func } from 'prop-types';
import { useIntl } from 'react-intl';

import { usePaymentMethods } from '@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/usePaymentMethods';
import CashOnDelivery from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/cashOnDelivery";
import Momo from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/momo";
import VnPay from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/vnpay";
import ZaloPay from "@magenest/theme/BaseComponents/CheckoutPage/components/PaymentInformation/zalopay";
import { useStyle } from '@magento/venia-ui/lib/classify';
import RadioGroup from '@magento/venia-ui/lib/components/RadioGroup';
import Radio from '@magento/venia-ui/lib/components/RadioGroup/radio';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentMethods.module.css';
import paymentMethods from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/paymentMethods.module.scss';
import { CashOnDelivery as CashOnDeliveryImage, Momo as MomoImage, Vnpay as VnpayImage, Zalopay as ZalopayImage } from '@magenest/theme/static/icons';
// import payments from './paymentMethodCollection';

const PAYMENT_METHOD_COMPONENTS_BY_CODE = {
    cashondelivery: CashOnDelivery,
    vnpay: VnPay,
    momo_wallet: Momo,
    zalopay: ZaloPay
};


const PaymentMethods = props => {
    const {
        classes: propClasses,
        onPaymentError,
        onPaymentSuccess,
        resetShouldSubmit,
        shouldSubmit
    } = props;

    const { formatMessage } = useIntl();

    const classes = useStyle(defaultClasses, paymentMethods, propClasses);

    const talonProps = usePaymentMethods({});

    const {
        availablePaymentMethods,
        currentSelectedPaymentMethod,
        handlePaymentMethodSelection,
        initialSelectedMethod,
        isLoading
    } = talonProps;

    if (isLoading) {
        return null;
    }

    const radios = availablePaymentMethods
        .map(({ code, title, note }) => {
            // If we don't have an implementation for a method type, ignore it.
            if (!Object.keys(PAYMENT_METHOD_COMPONENTS_BY_CODE).includes(code)) {
                return;
            }

            const id = `paymentMethod--${code}`;
            const isSelected = currentSelectedPaymentMethod === code;
            const PaymentMethodComponent = PAYMENT_METHOD_COMPONENTS_BY_CODE[code];
            const renderedComponent = isSelected ? (
                <PaymentMethodComponent
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                    resetShouldSubmit={resetShouldSubmit}
                    shouldSubmit={shouldSubmit}
                />
            ) : null;

            let paymentImage = '';
            let updatedLabel = '';

            if (code === 'cashondelivery') {
                paymentImage = CashOnDeliveryImage;
            } else if (code === 'momo_wallet') {
                updatedLabel = title;
                paymentImage = MomoImage;
            } else if (code === 'vnpay') {
                updatedLabel = title
                paymentImage = VnpayImage;
            } else if (code === 'zalopay') {
                updatedLabel = title
                paymentImage = ZalopayImage;
            }

            return (
                <div key={code} className={classes.payment_method}>
                    <Radio
                        id={id}
                        label={updatedLabel ? updatedLabel : title}
                        value={code}
                        checked={isSelected}
                        onChange={handlePaymentMethodSelection}
                        image={paymentImage}
                        note={note}
                    />
                    {renderedComponent}
                </div>
            );
        })
        .filter(paymentMethod => !!paymentMethod);

    const noPaymentMethodMessage = !radios.length ? (
        <div className={classes.payment_errors}>
            <span>
                {formatMessage({
                    id: 'checkoutPage.paymentLoadingError',
                    defaultMessage: 'There was an error loading payments.'
                })}
            </span>
            <span>
                {formatMessage({
                    id: 'checkoutPage.refreshOrTryAgainLater',
                    defaultMessage: 'Please refresh or try again later.'
                })}
            </span>
        </div>
    ) : null;

    return (
        <div className={classes.root}>
            <RadioGroup
                classes={{ root: classes.radio_group }}
                field="selectedPaymentMethod"
                initialValue={initialSelectedMethod}
            >
                {radios}
            </RadioGroup>
            {noPaymentMethodMessage}
        </div>
    );
};

export default PaymentMethods;

PaymentMethods.propTypes = {
    classes: shape({
        root: string,
        payment_method: string,
        radio_label: string
    }),
    onPaymentSuccess: func,
    onPaymentError: func,
    resetShouldSubmit: func,
    selectedPaymentMethod: string,
    shouldSubmit: bool
};
