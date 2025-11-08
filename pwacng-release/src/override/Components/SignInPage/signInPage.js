import React from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import { useSignInPage } from '@magento/peregrine/lib/talons/SignInPage/useSignInPage';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import SignIn from '../SignIn/signIn';

import defaultClasses from '@magento/venia-ui/lib/components/SignInPage/signInPage.module.css';
import signInPageCustomClasses from '@magenest/theme/BaseComponents/SignInPage/extendStyle/signInPage.module.scss';

const SignInPage = props => {
    const classes = useStyle(defaultClasses, signInPageCustomClasses, props.classes);
    const { signInProps } = useSignInPage(props);
    const { formatMessage } = useIntl();

    return (
        <div className={classes.root}>
            <StoreTitle>
                {formatMessage({
                    id: 'signInPage.title',
                    defaultMessage: 'Sign In'
                })}
            </StoreTitle>
            <div className={classes.contentContainer}>
                <div className={classes.wrapper}>
                    <SignIn {...signInProps} />
                </div>
            </div>
        </div>
    );
};

SignInPage.defaultProps = {
    createAccountPageUrl: '/create-account',
    forgotPasswordPageUrl: '/forgot-password',
    signedInRedirectUrl: '/dashboard'
};

SignInPage.propTypes = {
    classes: shape({
        root: string,
        header: string,
        contentContainer: string
    }),
    createAccountPageUrl: string,
    forgotPasswordPageUrl: string,
    signedInRedirectUrl: string
};

export default SignInPage;
