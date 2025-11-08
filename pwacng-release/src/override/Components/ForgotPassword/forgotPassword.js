import React, { Fragment } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { func, shape, string } from 'prop-types';

import { useForgotPassword } from '../../Talons/ForgotPassword/useForgotPassword';

import FormErrors from '@magento/venia-ui/lib/components/FormError';
import { useStyle } from '@magento/venia-ui/lib/classify';
import ForgotPasswordForm from './ForgotPasswordForm/forgotPasswordForm';
import FormSubmissionSuccessful from './FormSubmissionSuccessful/formSubmissionSuccessful';

import forgotPasswordOperations from '@magento/venia-ui/lib/components/ForgotPassword/forgotPassword.gql';

import defaultClasses from '@magento/venia-ui/lib/components/ForgotPassword/forgotPassword.module.css';
import forgotPasswordClasses from '@magenest/theme/BaseComponents/ForgotPassword/forgotPassword.module.scss';

const ForgotPassword = props => {
    const { initialValues, onCancel } = props;

    const { formatMessage } = useIntl();
    const talonProps = useForgotPassword({
        onCancel,
        ...forgotPasswordOperations
    });

    const {
        forgotPasswordEmail,
        formErrors,
        handleCancel,
        handleFormSubmit,
        isResettingPassword,
        recaptchaWidgetProps,
        isOpen,
        handleClose
    } = talonProps;

    const classes = useStyle(defaultClasses, forgotPasswordClasses, props.classes);
    const INSTRUCTIONS = formatMessage({
        id: 'forgotPassword.instructions',
        defaultMessage:
            'Please enter your email to retrieve your password'
    });

    return (
        <div className={classes.root}>
            <h2 data-cy="ForgotPassword-title" className={classes.title}>
                <FormattedMessage
                    id={'global.resetPassword'}
                    defaultMessage={'Reset Password ?'}
                />
                <p
                    data-cy="ForgotPassword-instructions"
                    className={classes.instructions}
                >
                    {INSTRUCTIONS}
                </p>
            </h2>
            {/*<FormErrors errors={formErrors} />*/}
            <ForgotPasswordForm
                initialValues={initialValues}
                isResettingPassword={isResettingPassword}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                recaptchaWidgetProps={recaptchaWidgetProps}
            />
            <FormSubmissionSuccessful
                handleClose={handleClose}
                isOpen={isOpen}
                email={forgotPasswordEmail}
            />
        </div>
    );
};

export default ForgotPassword;

ForgotPassword.propTypes = {
    classes: shape({
        instructions: string,
        root: string
    }),
    initialValues: shape({
        email: string
    }),
    onCancel: func
};

ForgotPassword.defaultProps = {
    onCancel: () => {}
};
