import React from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import { useForgotPasswordPage } from '@magento/peregrine/lib/talons/ForgotPasswordPage/useForgotPasswordPage';
import { useStyle } from '@magento/venia-ui/lib/classify';
import ForgotPassword from '../ForgotPassword/forgotPassword';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';

import defaultClasses from '@magento/venia-ui/lib/components/ForgotPasswordPage/forgotPasswordPage.module.css';
import forgotPasswordPageClasses from '@magenest/theme/BaseComponents/ForgotPasswordPage/extendStyle/forgotPasswordPage.module.scss';

const ForgotPasswordPage = props => {
    const classes = useStyle(defaultClasses, forgotPasswordPageClasses, props.classes);
    const { forgotPasswordProps } = useForgotPasswordPage(props);
    const { formatMessage } = useIntl();

    return (
        <div className={classes.root}>
            <StoreTitle>
                {formatMessage({
                    id: 'forgotPasswordPage.title',
                    defaultMessage: 'Forgot Your Password?'
                })}
            </StoreTitle>
            <div className={classes.contentContainer}>
                <div className={classes.wrapper}>
                    <ForgotPassword {...forgotPasswordProps} />
                </div>
            </div>
        </div>
    );
};

ForgotPasswordPage.defaultProps = {
    signedInRedirectUrl: '/dashboard',
    signInPageUrl: '/sign-in'
};

ForgotPasswordPage.propTypes = {
    classes: shape({
        root: string,
        header: string,
        contentContainer: string
    }),
    signedInRedirectUrl: string,
    signInPageUrl: string
};

export default ForgotPasswordPage;
