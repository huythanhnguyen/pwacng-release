import React from 'react';
import { func, shape, string } from 'prop-types';
import { useAuthModal } from '@magento/peregrine/lib/talons/AuthModal/useAuthModal';

import { useStyle } from '@magento/venia-ui/lib/classify';
import CreateAccount from '@magento/venia-ui/lib/components/CreateAccount';
import ForgotPassword from '@magento/venia-ui/lib/components/ForgotPassword';
import MyAccount from '@magento/venia-ui/lib/components/MyAccount';
import SignIn from '@magento/venia-ui/lib/components/SignIn';
import defaultClasses from '@magento/venia-ui/lib/components/AuthModal/authModal.module.css';
import autoModalCustomClasses from '@magenest/theme/BaseComponents/AuthModal/extendStyle/authModal.module.scss'
import CategoryTree from "../CategoryTree/categoryTree";

const AuthModal = props => {
    const {
        handleCancel,
        handleCreateAccount,
        handleSignOut,
        setUsername,
        showCreateAccount,
        showForgotPassword,
        showMyAccount,
        username
    } = useAuthModal(props);

    const {
        categoryId,
        onNavigate,
        setCategoryId,
        catalogActions,
        tabIndex,
        onBack,
        setView,
    } = props;

    const classes = useStyle(defaultClasses, autoModalCustomClasses, props.classes);

    let child = null;
    switch (props.view) {
        case 'MENU_CHILDREN' : {
            child= (
                <div className={classes.body}>
                    <CategoryTree
                        categoryId={categoryId}
                        onNavigate={onNavigate}
                        setCategoryId={setCategoryId}
                        updateCategories={catalogActions.updateCategories}
                        tabIndex={tabIndex}
                        onBack={onBack}
                        setView={setView}
                    />
                </div>
            );
            break;
        }
        case 'CREATE_ACCOUNT': {
            child = (
                <CreateAccount
                    classes={{
                        actions: classes.createAccountActions,
                        submitButton: classes.createAccountSubmitButton
                    }}
                    initialValues={{ email: username }}
                    isCancelButtonHidden={false}
                    onSubmit={handleCreateAccount}
                    onCancel={handleCancel}
                />
            );
            break;
        }
        case 'FORGOT_PASSWORD': {
            child = (
                <ForgotPassword
                    initialValues={{ email: username }}
                    onCancel={handleCancel}
                />
            );
            break;
        }
        case 'MY_ACCOUNT': {
            child = <MyAccount onSignOut={handleSignOut} />;
            break;
        }
        case 'SIGN_IN':
        default: {
            child = (
                <SignIn
                    setDefaultUsername={setUsername}
                    showCreateAccount={showCreateAccount}
                    showForgotPassword={showForgotPassword}
                    showMyAccount={showMyAccount}
                />
            );
            break;
        }
    }

    return <div className={classes.root}>{child}</div>;
};

export default AuthModal;

AuthModal.propTypes = {
    classes: shape({
        root: string
    }),
    closeDrawer: func.isRequired,
    showCreateAccount: func.isRequired,
    showForgotPassword: func.isRequired,
    showMyAccount: func.isRequired,
    showMainMenu: func.isRequired,
    showSignIn: func.isRequired,
    view: string
};
