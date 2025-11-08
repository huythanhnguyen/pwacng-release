import {useCallback, useEffect, useMemo, useState} from 'react';
import {useHistory, useLocation} from 'react-router-dom';

import { useUserContext } from '@magento/peregrine/lib/context/user';

/**
 * @typedef {function} useSignInPage
 *
 * @param {String} props.createAccountPageUrl - Create Account Password Page url
 * @param {String} props.forgotPasswordPageUrl - Forgot Password Page url
 * @param {String} props.signedInRedirectUrl - Url to push when user is signed in
 *
 * @returns {{
 *   signInProps: object
 * }}
 */
export const useSignInPage = props => {
    const {
        createAccountPageUrl,
        forgotPasswordPageUrl,
        signedInRedirectUrl
    } = props;
    const history = useHistory();
    const location = useLocation();
    const { search } = location;
    const query = new URLSearchParams(search);
    const [{ isSignedIn }] = useUserContext();
    const [ isSigningIn, setIsSigningIn ] = useState(false);

    // Keep location state in memory when pushing history and redirect to
    // the `from` url instead when signing in
    const historyState = useMemo(() => {
        return history && history.location.state ? history.location.state : {};
    }, [history]);

    const redirectUrl = query.get('referer') ? atob(query.get('referer')) : signedInRedirectUrl;

    // Redirect if user is signed in
    useEffect(() => {
        if (isSignedIn && !isSigningIn) {
            if (redirectUrl) {
                history.push(redirectUrl);
            }
        }
    }, [history, isSignedIn, redirectUrl, isSigningIn]);

    const handleShowCreateAccount = useCallback(() => {
        if (createAccountPageUrl) {
            history.push(createAccountPageUrl, historyState);
        }
    }, [createAccountPageUrl, history, historyState]);

    const handleShowForgotPassword = useCallback(() => {
        if (forgotPasswordPageUrl) {
            history.push(forgotPasswordPageUrl, historyState);
        }
    }, [forgotPasswordPageUrl, history, historyState]);

    const signInProps = {
        classes: { modal_active: undefined },
        showCreateAccount: handleShowCreateAccount,
        showForgotPassword: handleShowForgotPassword,
        isSigningIn: isSigningIn,
        setIsSigningIn: setIsSigningIn,
        redirectUrl: redirectUrl
    };

    return {
        signInProps
    };
};
