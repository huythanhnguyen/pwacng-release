import React, {useState} from 'react';
import { bool, func, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useGuestSignIn } from '@magento/peregrine/lib/talons/CheckoutPage/GuestSignIn/useGuestSignIn';

import { useStyle } from '@magento/venia-ui/lib/classify';
import SignIn from '@magento/venia-ui/lib/components/SignIn';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/GuestSignIn/guestSignIn.module.css';
import guestSignInClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/guestSignIn.module.scss';

const GuestSignIn = props => {
    const classes = useStyle(defaultClasses, guestSignInClasses, props.classes);
    const [ isSigningIn, setIsSigningIn ] = useState(false);
    const redirectUrl = '/checkout'

    return (
        <div className={classes.root}>
            <SignIn
                classes={{ modal_active: undefined, root: classes.signInRoot, separator: classes.separator }}
                isSigningIn={isSigningIn}
                setIsSigningIn={setIsSigningIn}
                redirectUrl={redirectUrl}
            />
        </div>
    );
};

export default GuestSignIn;

GuestSignIn.propTypes = {
    classes: shape({
        root: string,
        root_hidden: string,
        header: string,
        contentContainer: string,
        signInRoot: string,
        forgotPasswordRoot: string,
        createAccountRoot: string
    })
};
