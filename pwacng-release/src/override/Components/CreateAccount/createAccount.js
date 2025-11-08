import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { func, shape, string, bool } from 'prop-types';
import { useCreateAccount } from '../../Talons/CreateAccount/useCreateAccount';

import { useStyle } from '@magento/venia-ui/lib/classify';
import combine from '@magento/venia-ui/lib/util/combineValidators';
import {
    hasLengthAtLeast,
    isRequired,
    validatePassword,
    isEmail,
    isPhoneNumber
} from '../../Util/formValidators';
import Button from '../Button/button';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '../TextInput/textInput';
import defaultClasses from '@magento/venia-ui/lib/components/CreateAccount/createAccount.module.css';
import createAccountCustomClasses from '@magenest/theme/BaseComponents/CreateAccount/extendStyle/createAccount.module.scss';
import Password from '../Password/password';
import GoogleRecaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import SocialLogin from "@magenest/theme/BaseComponents/SocialLogin/components";
import {Link} from "react-router-dom";
import ConfirmPassword from "../../../@theme/BaseComponents/ConfirmPasword/components/confirmPassword";

const CreateAccount = props => {
    const talonProps = useCreateAccount({
        initialValues: props.initialValues,
        onSubmit: props.onSubmit,
        onCancel: props.onCancel
    });

    const {
        handleCancel,
        handleSubmit,
        handleEnterKeyPress,
        handleCancelKeyPress,
        isDisabled,
        initialValues,
        recaptchaWidgetProps,
        minimumPasswordLength,
        isAgree,
        setIsAgree,
        password,
        setPassword
    } = talonProps;

    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, createAccountCustomClasses, props.classes);

    const submitButton = (
        <Button
            type="submit"
            priority="high"
            onKeyDown={handleEnterKeyPress}
            data-cy="CreateAccount-submitButton"
            disabled={isDisabled}
        >
            <FormattedMessage
                id={'global.register'}
                defaultMessage={'Register'}
            />
        </Button>
    );

    const agreeLabel = (
        <>
            <FormattedMessage
                id={'createAccount.agreeText'}
                defaultMessage={'Agree to '}
            />
            <a href='#'>
                <FormattedMessage
                    id={'global.termsOfUse'}
                    defaultMessage={'the Terms of use '}
                />
            </a>
            <FormattedMessage
                id={'global.and'}
                defaultMessage={'and '}
            />
            <a href='#'>
                <FormattedMessage
                    id={'global.privacyPolicy'}
                    defaultMessage={'Chính sách bảo mật'}
                />
            </a>
        </>
    )

    return (
        <Form
            data-cy="CreateAccount-form"
            className={classes.root}
            initialValues={initialValues}
            onSubmit={handleSubmit}
        >
            <h1 data-cy="CreateAccount-title" className={classes.title}>
                <FormattedMessage
                    id={'global.register'}
                    defaultMessage={'Register'}
                />
            </h1>
            {/*<FormError errors={Array.from(errors.values())} />*/}
            <Field
                id="Email"
                label={formatMessage({
                    id: 'createAccount.emailText',
                    defaultMessage: 'Email'
                })}
                optional={true}
            >
                <TextInput
                    id="Email"
                    field="customer.email"
                    autoComplete="email"
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
            <Field
                id="Telephone"
                label={formatMessage({
                    id: 'global.telephone',
                    defaultMessage: 'Telephone'
                })}
                optional={true}
            >
                <TextInput
                    id="Telephone"
                    field="customer.telephone"
                    autoComplete="Phone Number"
                    validate={combine([isRequired, isPhoneNumber])}
                    validateOnBlur
                    mask={value => value && value.trim()}
                    maskOnBlur={true}
                    data-cy="customer-telephone"
                    aria-label={formatMessage({
                        id: 'global.telephoneRequired',
                        defaultMessage: 'Telephone Required'
                    })}
                    placeholder={formatMessage({
                        id: 'global.telephone',
                        defaultMessage: 'Telephone'
                    })}
                />
            </Field>
            <div className={classes.password}>
                <Field>
                    <Password
                        id="Password"
                        autoComplete="new-password"
                        fieldName="password"
                        isToggleButtonHidden={false}
                        label={formatMessage({
                            id: 'global.password',
                            defaultMessage: 'Password'
                        })}
                        validate={combine([
                            isRequired,
                            [hasLengthAtLeast, minimumPasswordLength],
                            validatePassword
                        ])}
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        data-cy="password"
                        aria-label={formatMessage({
                            id: 'global.passwordRequired',
                            defaultMessage: 'Password Required'
                        })}
                        onChange={(e) => setPassword(e.target.value)}
                        optional={true}
                        placeholder={formatMessage({
                            id: 'global.password',
                            defaultMessage: 'Password'
                        })}
                    />
                </Field>
                <Field>
                    <ConfirmPassword
                        password={password}
                        optional={true}
                    />
                </Field>
            </div>
            <div className={classes.agree}>
                <Checkbox
                    field="agree"
                    id="agree"
                    label={agreeLabel}
                    onChange={() => setIsAgree(!isAgree)}
                    initialValue={isAgree}
                    validate={isRequired}
                    validateOnBlur
                />
            </div>
            <GoogleRecaptcha {...recaptchaWidgetProps} />
            <div className={classes.actions}>
                {submitButton}
                {/*{cancelButton}*/}
                <div className={classes.businessCustomer}>
                    <Button
                        priority={'low'}
                        onClick={() => window.location.href = 'https://mmpro.vn/membership/'}
                    >
                        <FormattedMessage
                            id={'createAccount.registerBusiness'}
                            defaultMessage={'Register a business account?'}
                        />
                    </Button>
                </div>
            </div>
            <div className={classes.separator}>
                <span>
                    <FormattedMessage
                        id={'register.socialSeparator'}
                        defaultMessage={'Register to your account with'}
                    />
                </span>
            </div>
            <SocialLogin />
            <div className={classes.signIn}>
                <Link to={'/sign-in'}>
                        <span className={classes.label}>
                            <FormattedMessage
                                id={'global.signInLabel'}
                                defaultMessage={'You already have an account?'}
                            />
                        </span>
                    <FormattedMessage
                        id={'global.signIn'}
                        defaultMessage={'Sign in'}
                    />
                </Link>
            </div>
        </Form>
    );
};

CreateAccount.propTypes = {
    classes: shape({
        actions: string,
        lead: string,
        root: string,
        subscribe: string
    }),
    initialValues: shape({
        email: string,
        firstName: string,
        lastName: string
    }),
    isCancelButtonHidden: bool,
    onSubmit: func,
    onCancel: func
};

CreateAccount.defaultProps = {
    onCancel: () => {},
    isCancelButtonHidden: true
};

export default CreateAccount;
