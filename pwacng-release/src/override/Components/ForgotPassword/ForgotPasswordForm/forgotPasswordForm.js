import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { bool, func, shape, string } from 'prop-types';
import { Form } from 'informed';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import Field from '@magento/venia-ui/lib/components/Field';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import defaultClasses from '@magento/venia-ui/lib/components/ForgotPassword/ForgotPasswordForm/forgotPasswordForm.module.css';
import forgotPasswordFormClasses from '@magenest/theme/BaseComponents/ForgotPassword/forgotPasswordForm.module.scss';
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isEmail, isRequired} from "../../../Util/formValidators";

const ForgotPasswordForm = props => {
    const classes = useStyle(defaultClasses, forgotPasswordFormClasses, props.classes);
    const {
        initialValues,
        isResettingPassword,
        onSubmit,
        onCancel,
        recaptchaWidgetProps
    } = props;

    const { formatMessage } = useIntl();

    return (
        <Form
            className={classes.root}
            initialValues={initialValues}
            onSubmit={onSubmit}
            data-cy="forgotPasswordForm-root"
        >
            <Field
                label={formatMessage({
                    id: 'forgotPasswordForm.emailAddressText',
                    defaultMessage: 'Email'
                })}
                optional={true}
            >
                <TextInput
                    autoComplete="email"
                    field="email"
                    validate={combine([isRequired, isEmail])}
                    data-cy="email"
                    placeholder={formatMessage({
                        id: 'global.yourEmail',
                        defaultMessage: 'Enter your email'
                    })}
                />
            </Field>
            <GoogleReCaptcha {...recaptchaWidgetProps} />
            <div className={classes.buttonContainer}>
                <Button
                    disabled={isResettingPassword}
                    type="submit"
                    priority="high"
                    data-cy="forgotPasswordForm-submitButton"
                >
                    <FormattedMessage
                        id={'global.confirm'}
                        defaultMessage={'Confirm'}
                    />
                </Button>
                <Button
                    className={classes.cancelButton}
                    disabled={isResettingPassword}
                    type="button"
                    priority="low"
                    onClick={onCancel}
                >
                    <FormattedMessage
                        id={'global.cancel'}
                        defaultMessage={'Cancel'}
                    />
                </Button>
            </div>
        </Form>
    );
};

ForgotPasswordForm.propTypes = {
    classes: shape({
        form: string,
        buttonContainer: string
    }),
    initialValues: shape({
        email: string
    }),
    isResettingPassword: bool,
    onCancel: func.isRequired,
    onSubmit: func.isRequired
};

ForgotPasswordForm.defaultProps = {
    initialValues: {},
    isResettingPassword: false
};

export default ForgotPasswordForm;
