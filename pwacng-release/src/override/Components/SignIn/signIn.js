import React, {useState, useCallback, useMemo} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { func, shape, string } from 'prop-types';
import { Form } from 'informed';

import { useSignIn } from '../../Talons/SignIn/useSignIn';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Button from '@magento/venia-ui/lib/components/Button';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '../../../override/Components/TextInput/textInput';
import defaultClasses from '@magento/venia-ui/lib/components/SignIn/signIn.module.css';
import signInCustomClasses from '@magenest/theme/BaseComponents/SignIn/extendStyle/signIn.module.scss';
import { GET_CART_DETAILS_QUERY } from '@magento/venia-ui/lib/components/SignIn/signIn.gql';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton';
import Password from '@magento/venia-ui/lib/components/Password';
import FormError from '@magento/venia-ui/lib/components/FormError/formError';
import GoogleRecaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import {Link, useLocation} from "react-router-dom";
import SocialLogin from "../../../@theme/BaseComponents/SocialLogin/components";
import Checkbox from "@magento/venia-ui/lib/components/Checkbox";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import useDecryptPassword from "../../../@theme/Hooks/EncryptPassword/useDecryptPassword";
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { Portal } from '@magento/venia-ui/lib/components/Portal';

const SignIn = props => {
    const classes = useStyle(defaultClasses, signInCustomClasses, props.classes);
    const {
        handleTriggerClick,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        isSigningIn,
        setIsSigningIn,
        redirectUrl,
        initialValues
    } = props;

    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const chatbot = query.get('chatbot');

    const aiChatbotStorageData = sessionStorage.getItem('aiChatbot');
    const aiChatbotData = aiChatbotStorageData ? JSON.parse(aiChatbotStorageData) : null;
    const aiRedirectData = aiChatbotData?.redirectUrl && aiChatbotData.redirectUrl !== '/sign-in' ? aiChatbotData.redirectUrl : '/';

    const redirectPageUrl = chatbot === 'true' ? `${aiRedirectData}?chatbot=true` : redirectUrl;

    const talonProps = useSignIn({
        handleTriggerClick,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword,
        isSigningIn,
        setIsSigningIn,
        redirectPageUrl
    });

    const {
        errors,
        handleCreateAccount,
        handleEnterKeyPress,
        signinHandleEnterKeyPress,
        handleForgotPassword,
        forgotPasswordHandleEnterKeyPress,
        handleSubmit,
        isBusy,
        setFormApi,
        recaptchaWidgetProps,
        isSaveInformation,
        setIsSaveInformation
    } = talonProps;

    const customerInformation = useMemo(() => {
        const info = storage.getItem('customer_information');

        if (!info) return;

        const encryptedPassword = useDecryptPassword(info.password);

        return {
            email: info.email,
            password: encryptedPassword
        }
    }, [storage.getItem('customer_information')])

    return (
        <div data-cy="SignIn-root" className={classes.root}>
            <span data-cy="SignIn-title" className={classes.title}>
                <FormattedMessage
                    id={'global.signIn'}
                    defaultMessage={'Sign In'}
                />
            </span>
            <FormError errors={Array.from(errors.values())} />
            <Form
                getApi={setFormApi}
                className={classes.form}
                onSubmit={handleSubmit}
                data-cy="SignIn-form"
                initialValues={customerInformation && customerInformation}
            >
                <Field
                    id="email"
                    label={formatMessage({
                        id: 'global.email',
                        defaultMessage: 'Email'
                    })}
                    optional={true}
                >
                    <TextInput
                        id="email"
                        data-cy="SignIn-email"
                        autoComplete="email"
                        field="email"
                        validate={isRequired}
                        data-cy="email"
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
                        data-cy="SignIn-password"
                        fieldName="password"
                        id="Password"
                        label={formatMessage({
                            id: 'global.password',
                            defaultMessage: 'Password'
                        })}
                        validate={isRequired}
                        autoComplete="current-password"
                        isToggleButtonHidden={false}
                        data-cy="password"
                        aria-label={formatMessage({
                            id: 'global.passwordRequired',
                            defaultMessage: 'Password Required'
                        })}
                        placeholder={formatMessage({
                            id: 'global.enterPassword',
                            defaultMessage: 'Enter password'
                        })}
                        optional={true}
                    />
                </Field>
                <div className={classes.actions}>
                    <div className={classes.saveInformation}>
                        <Checkbox
                            field="save_information"
                            id="save_information"
                            label={formatMessage({
                                id: 'global.saveInformation',
                                defaultMessage: 'Save information'
                            })}
                            onChange={() => setIsSaveInformation(!isSaveInformation)}
                        />
                    </div>
                    <div className={classes.forgotPasswordButtonContainer}>
                        <LinkButton
                            type="button"
                            onClick={handleForgotPassword}
                            onKeyDown={forgotPasswordHandleEnterKeyPress}
                            data-cy="SignIn-forgotPasswordButton"
                        >
                            <FormattedMessage
                                id={'global.forgotPassword'}
                                defaultMessage={'Forgot Password?'}
                            />
                        </LinkButton>
                    </div>
                </div>
                <div className={classes.signInNote}>
                    <CmsBlock
                        identifiers={'signIn-note'}
                    />
                </div>
                <GoogleRecaptcha {...recaptchaWidgetProps} />
                <div className={classes.buttonsContainer}>
                    <Button
                        priority="high"
                        type="submit"
                        onKeyDown={signinHandleEnterKeyPress}
                        data-cy="SignInButton-root_highPriority"
                        disabled={!!isBusy}
                    >
                        <FormattedMessage
                            id={'global.signIn'}
                            defaultMessage={'Sign In'}
                        />
                    </Button>
                    <a className={`${classes.businessLogin} business-login`} href={'https://mmpro.vn/sign-in'}>
                        <FormattedMessage
                            id={'signIn.signInWithBusiness'}
                            defaultMessage={'Sign in with a business account'}
                        />
                    </a>
                </div>
                <div className={classes.separator}>
                    <span>
                        <FormattedMessage
                            id={'signIn.socialSeparator'}
                            defaultMessage={'Sign in to your account with'}
                        />
                    </span>
                </div>
                <SocialLogin />
                <div className={classes.createAccount}>
                    <Link
                        to={'/create-account'}
                        data-cy="CreateAccount-initiateButton"
                        onKeyDown={handleEnterKeyPress}
                    >
                        <span className={classes.label}>
                            <FormattedMessage
                                id={'signIn.createAccountLabel'}
                                defaultMessage={'Don\'t have an account yet?'}
                            />
                        </span>
                        <FormattedMessage
                            id={'signIn.createAccountText'}
                            defaultMessage={'Register now'}
                        />
                    </Link>
                </div>
            </Form>
            {isSigningIn ? <Portal><div className={classes.loadingFullPage}><LoadingIndicator /></div></Portal> : null}
        </div>
    );
};

export default SignIn;
SignIn.propTypes = {
    classes: shape({
        buttonsContainer: string,
        form: string,
        forgotPasswordButton: string,
        forgotPasswordButtonContainer: string,
        root: string,
        title: string
    }),
    setDefaultUsername: func,
    showCreateAccount: func,
    showForgotPassword: func,
    initialValues: shape({
        email: string.isRequired
    })
};
SignIn.defaultProps = {
    setDefaultUsername: () => {
    },
    showCreateAccount: () => {
    },
    showForgotPassword: () => {
    }
};
