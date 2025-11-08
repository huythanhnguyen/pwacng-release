import React, {useEffect, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shape, string } from 'prop-types';
import { Form } from 'informed';
import { Success } from '@magenest/theme/static/icons';
import { useToasts } from '@magento/peregrine';
import { useResetPassword } from '../../../Talons/MyAccount/useResetPassword';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Button from '@magento/venia-ui/lib/components/Button';
import Field from '@magento/venia-ui/lib/components/Field';
import FormErrors from '@magento/venia-ui/lib/components/FormError';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import Password from '@magento/venia-ui/lib/components/Password';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import defaultClasses from '@magento/venia-ui/lib/components/MyAccount/ResetPassword/resetPassword.module.css';
import resetPasswordClasses from '@magenest/theme/BaseComponents/MyAccount/ResetPassword/extendStyle/resetPassword.module.scss';
import resetPasswordOperations from '@magento/venia-ui/lib/components/MyAccount/ResetPassword/resetPassword.gql';
import LinkButton from "../../LinkButton/linkButton";
import {Link, useHistory} from "react-router-dom";
import ConfirmPassword from "../../../../@theme/BaseComponents/ConfirmPasword/components/confirmPassword";
import Modal from "../../../../@theme/BaseComponents/Modal";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {hasLengthAtLeast, isEmail, validatePassword} from "../../../Util/formValidators";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;


const ResetPassword = props => {
    const { classes: propClasses } = props;
    const [ password, setPassword ] = useState('');
    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, resetPasswordClasses, propClasses);
    const talonProps = useResetPassword({ ...resetPasswordOperations });
    const history = useHistory();
    const { push } = history;
    const {
        hasCompleted,
        loading,
        token,
        errors,
        handleSubmit,
        recaptchaWidgetProps,
        isOpen,
        handleClose,
        minimumPasswordLength
    } = talonProps;

    const tokenMissing = (
        <div className={classes.invalidToken}>
            <FormattedMessage
                id={'resetPassword.invalidTokenMessage'}
                defaultMessage={
                    'Uh oh, something went wrong. Check the link or try again.'
                }
            />
        </div>
    );

    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (hasCompleted) {
            addToast({
                type: 'info',
                message: formatMessage({
                    id: 'resetPassword.savedPasswordText',
                    defaultMessage: 'Your new password has been saved.'
                }),
                timeout: 5000
            });
        }
    }, [addToast, formatMessage, hasCompleted]);

    useEffect(() => {
        if (errors) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errors.message,
                dismissable: true,
                timeout: 5000
            });
        }
    }, [errors]);

    const recoverPassword = (
        <div className={classes.contentContainer}>
            <h1 aria-live="polite" className={classes.title}>
                <FormattedMessage
                    id="resetPassword.header"
                    defaultMessage="Reset Password"
                />
            </h1>
            <Form className={classes.form} onSubmit={handleSubmit}>
                <Field label={'Email'} optional={true}>
                    <TextInput
                        field={'email'}
                        autoComplete="customer-email"
                        validate={combine([isRequired, isEmail])}
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        data-cy="customer-email"
                        aria-label={formatMessage({
                            id: 'global.emailRequired',
                            defaultMessage: 'Email Required'
                        })}
                        placeholder={formatMessage({
                            id: 'global.yourEmail',
                            defaultMessage: 'Enter your email'
                        })}
                    />
                </Field>
                <Field>
                    <Password
                        label={formatMessage({
                            id: 'resetPassword.newPasswordText',
                            defaultMessage: 'New Password'
                        })}
                        fieldName={'newPassword'}
                        isToggleButtonHidden={false}
                        onChange={(e) => setPassword(e.target.value)}
                        optional={true}
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        validate={combine([
                            isRequired,
                            [hasLengthAtLeast, minimumPasswordLength],
                            validatePassword
                        ])}
                        placeholder={formatMessage({
                            id: 'global.enterNewPassword',
                            defaultMessage: 'Enter New Password'
                        })}
                    />
                </Field>
                <ConfirmPassword
                    password={password}
                    optional={true}
                    label={formatMessage({
                        id: 'global.repeatNewPassword',
                        defaultMessage: 'Re-enter new password'
                    })}
                />
                <GoogleReCaptcha {...recaptchaWidgetProps} />
                <div className={classes.buttonContainer}>
                    <Button
                        type="submit"
                        priority="high"
                        disabled={loading}
                    >
                        <FormattedMessage
                            id="resetPassword.header"
                            defaultMessage="Reset Password"
                        />
                    </Button>
                    <Link
                        to={'/sign-in'}
                    >
                        <FormattedMessage
                            id={'global.cancel'}
                            defaultMessage={'Cancel'}
                        />
                    </Link>
                </div>
            </Form>
        </div>
    )

    return (
        <div className={classes.root}>
            <StoreTitle>
                {formatMessage({
                    id: 'resetPassword.title',
                    defaultMessage: 'Reset Password'
                })}
            </StoreTitle>
            <div className={classes.wrapper}>
                {token ? recoverPassword : tokenMissing}
            </div>
            <Modal
                isOpen={isOpen}
                handleClose={handleClose}
                classes={classes}
                title={formatMessage({
                    id: 'global.notification',
                    defaultMessage: 'Notification'
                })}
            >
                <div className={classes.successContent}>
                    <img src={Success} alt={''} />
                    <p className={classes.successText}>
                        <FormattedMessage
                            id={'resetPassword.successContent'}
                            defaultMessage={'You have successfully reset your password, please log in again to use'}
                        />
                    </p>
                    <div className={classes.action}>
                        <Button
                            priority={'high'}
                            onClick={() => push('/sign-in')}
                        >
                            <FormattedMessage
                                id={'global.loginAgain'}
                                defaultMessage={'Log in again'}
                            />
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ResetPassword;

ResetPassword.propTypes = {
    classes: shape({
        root: string,
        header: string,
        contentContainer: string,
        form: string,
        description: string,
        invalidToken: string,
        buttonContainer: string,
        submitButton: string,
        successMessage: string
    })
};
