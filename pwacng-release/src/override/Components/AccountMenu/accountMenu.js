import React from 'react';
import { shape, string } from 'prop-types';
import { useAccountMenu } from '@magento/peregrine/lib/talons/Header/useAccountMenu';

import { useStyle } from '@magento/venia-ui/lib/classify';
import CreateAccount from '@magento/venia-ui/lib/components/CreateAccount';
import SignIn from '@magento/venia-ui/lib/components/SignIn/signIn';
import AccountMenuItems from '@magento/venia-ui/lib/components/AccountMenu/accountMenuItems';
import ForgotPassword from '@magento/venia-ui/lib/components/ForgotPassword';
import defaultClasses from '@magento/venia-ui/lib/components/AccountMenu/accountMenu.module.css';
import accountMenuCustomClasses from '@magenest/theme/BaseComponents/AccountMenu/extendStyle/accountMenu.module.scss';

const AccountMenu = React.forwardRef((props, ref) => {
    const {
        handleTriggerClick,
        isOpen,
        handleClose
    } = props;
    const talonProps = useAccountMenu({
        isOpen,
        handleClose
    });
    const {
        view,
        username,
        handleAccountCreation,
        handleSignOut,
        handleForgotPassword,
        handleCancel,
        handleCreateAccount,
        updateUsername
    } = talonProps;

    const classes = useStyle(defaultClasses, accountMenuCustomClasses, props.classes);
    const rootClass = isOpen
        ? classes.root_open
        : classes.root_closed;
    const contentsClass = isOpen
        ? classes.contents_open
        : classes.contents;

    let dropdownContents = null;

    switch (view) {
        case 'ACCOUNT': {
            dropdownContents = <AccountMenuItems onSignOut={handleSignOut} />;

            break;
        }
        case 'FORGOT_PASSWORD': {
            dropdownContents = (
                <ForgotPassword
                    initialValues={{ email: username }}
                    onCancel={handleCancel}
                />
            );

            break;
        }
        case 'CREATE_ACCOUNT': {
            dropdownContents = (
                <CreateAccount
                    classes={{ root: classes.createAccount }}
                    initialValues={{ email: username }}
                    isCancelButtonHidden={false}
                    onSubmit={handleAccountCreation}
                    onCancel={handleCancel}
                />
            );

            break;
        }
        case 'SIGNIN':
        default: {
            dropdownContents = (
                <SignIn
                    handleTriggerClick={handleTriggerClick}
                    classes={{
                        modal_active: classes.loading
                    }}
                    setDefaultUsername={updateUsername}
                    showCreateAccount={handleCreateAccount}
                    showForgotPassword={handleForgotPassword}
                />
            );

            break;
        }
    }

    return (
        <aside
            className={rootClass}
            data-cy="AccountMenu-root"
        >
            <div ref={ref} className={contentsClass}>
                {isOpen && dropdownContents}
            </div>
        </aside>
    );
});

export default AccountMenu;

AccountMenu.propTypes = {
    classes: shape({
        root: string,
        root_closed: string,
        root_open: string,
        link: string,
        contents_open: string,
        contents: string
    })
};
