import React, { Suspense } from 'react';
import { shape, string } from 'prop-types';
import { useNavigation } from '../../Talons/Navigation/useNavigation';

import { useStyle } from '@magento/venia-ui/lib/classify';
import CategoryTree from '../CategoryTree/categoryTree';
import StoreSwitcher from '@magento/venia-ui/lib/components/Header/storeSwitcher';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import defaultClasses from '@magento/venia-ui/lib/components/Navigation/navigation.module.css';
import navigationCustomClasses from '@magenest/theme/BaseComponents/Navigation/extentStyle/navigation.module.scss';
import { FocusScope } from 'react-aria';
import { Portal } from '@magento/venia-ui/lib/components/Portal';
import WishlistTrigger from "../Header/wishlistTrigger";
import AccountTrigger from "../Header/accountTrigger";
import Button from "@magento/venia-ui/lib/components/Button";
import {FormattedMessage} from "react-intl";
import LanguageSwitcher from "../../../@theme/BaseComponents/Header/components/LanguageSwitcher";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
const AuthModal = React.lazy(() => import('@magento/venia-ui/lib/components/AuthModal'));

const Navigation = props => {
    const {
        catalogActions,
        categoryId,
        handleBack,
        handleClose,
        hasModal,
        isOpen,
        isTopLevel,
        setCategoryId,
        showCreateAccount,
        showForgotPassword,
        showMainMenu,
        showMyAccount,
        showSignIn,
        view,
        setView
    } = useNavigation();

    const classes = useStyle(defaultClasses, navigationCustomClasses, props.classes);
    const rootClassName = isOpen ? classes.root_open : classes.root;
    const modalClassName = hasModal ? classes.modal_open : classes.modal;
    const bodyClassName = hasModal ? classes.body_masked : classes.body;
    const tabIndex = isOpen ? '0' : '-1';
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeInformation = store && store.storeInformation;

    // Lazy load the auth modal because it may not be needed.
    const authModal = hasModal ? (
        <Suspense fallback={<LoadingIndicator />}>
            <AuthModal
                closeDrawer={handleClose}
                showCreateAccount={showCreateAccount}
                showForgotPassword={showForgotPassword}
                showMainMenu={showMainMenu}
                showMyAccount={showMyAccount}
                showSignIn={showSignIn}
                view={view}
                categoryId={categoryId}
                onNavigate={handleClose}
                setCategoryId={setCategoryId}
                catalogActions={catalogActions}
                tabIndex={tabIndex}
                onBack={handleBack}
                setView={setView}
            />
        </Suspense>
    ) : null;

    return (
        <Portal>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <FocusScope contain={isOpen} restoreFocus autoFocus>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                <aside className={rootClassName}>
                    <div className={classes.customerInformation}>
                        <StoreSwitcher/>
                        <WishlistTrigger/>
                        <AccountTrigger/>
                    </div>
                    <div className={classes.storeCurrent}>
                        <p className={classes.storeCurrentName}>
                            {storeInformation && storeInformation.name}
                        </p>
                        <p className={classes.storeCurrentAddress}>
                            {storeInformation && storeInformation.address}
                        </p>
                    </div>
                    <div className={classes.businessCustomer}>
                        <Button
                            priority={'low'}
                            onClick={() => window.location.href = 'https://mmpro.vn/'}
                        >
                            <FormattedMessage
                                id={'header.customerB2B'}
                                defaultMessage={'Business Customer'}
                            />
                        </Button>
                    </div>
                    <div className={bodyClassName}>
                        <CategoryTree
                            categoryId={categoryId}
                            onNavigate={handleClose}
                            setCategoryId={setCategoryId}
                            updateCategories={catalogActions.updateCategories}
                            tabIndex={tabIndex}
                            onBack={handleBack}
                            setView={setView}
                        />
                    </div>
                    <div className={classes.footer}>
                        <LanguageSwitcher />
                    </div>
                    <div className={modalClassName}>{authModal}</div>
                </aside>
            </FocusScope>
        </Portal>
    );
};

export default Navigation;

Navigation.propTypes = {
    classes: shape({
        body: string,
        form_closed: string,
        form_open: string,
        footer: string,
        header: string,
        root: string,
        root_open: string,
        signIn_closed: string,
        signIn_open: string
    })
};
