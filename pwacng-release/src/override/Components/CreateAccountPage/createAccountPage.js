import React from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCreateAccountPage } from '@magento/peregrine/lib/talons/CreateAccountPage/useCreateAccountPage';
import { useStyle } from '@magento/venia-ui/lib/classify';
import CreateAccount from '../CreateAccount/createAccount';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';

import defaultClasses from '@magento/venia-ui/lib/components/CreateAccountPage/createAccountPage.module.css';
import createAccountPageCustomClasses from '@magenest/theme/BaseComponents/CreateAccountPage/extendStyle/createAccountPage.module.scss';

const CreateAccountPage = props => {
    const classes = useStyle(defaultClasses, createAccountPageCustomClasses, props.classes);
    const { createAccountProps } = useCreateAccountPage(props);
    const { formatMessage } = useIntl();

    return (
        <div className={classes.root}>
            <StoreTitle>
                {formatMessage({
                    id: 'createAccountPage.title',
                    defaultMessage: 'Create an Account'
                })}
            </StoreTitle>
            <div className={classes.contentContainer}>
                <div className={classes.wrapper}>
                    <CreateAccount {...createAccountProps} />
                </div>
            </div>
        </div>
    );
};

CreateAccountPage.defaultProps = {
    signedInRedirectUrl: '/dashboard',
    signInPageUrl: '/sign-in'
};

CreateAccountPage.propTypes = {
    classes: shape({
        root: string,
        header: string,
        contentContainer: string
    }),
    signedInRedirectUrl: string,
    signInPageUrl: string
};

export default CreateAccountPage;
