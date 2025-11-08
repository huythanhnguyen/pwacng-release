import React, {useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import defaultClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';
import { useStyle } from '@magento/venia-ui/lib/classify';
import StaticBreadcrumbs from "../Breadcrumbs/staticBreadcrumbs";
import useMediaCheck from "@magenest/theme/Hooks/MediaCheck/useMediaCheck";
import AccountSidebar from "../MyAccount/accountSidebar";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {Redirect} from "react-router-dom";

const myAccountLayout = ({ children, currentPage, isOpenSidebar, setIsOpenSidebar }) => {
    const classes = useStyle(defaultClasses);

    const [{ isSignedIn }] = useUserContext();

    if (!isSignedIn) {
        return <Redirect to="/sign-in" />;
    }

    const { formatMessage } = useIntl();
    const { isMobile } = useMediaCheck();

    return (
        <div className={classes.root}>
            <div className={classes.breadcrumbs}>
                <StaticBreadcrumbs pageTitle={
                    formatMessage(
                        {
                            id: "global.myAccount",
                            defaultMessage: 'My account'
                        }
                    )
                } />
            </div>
            {
                !isMobile ? (
                    <h1 className={classes.accountHead}>
                        <FormattedMessage
                            id={'global.myAccount'}
                            defaultMessage={'My account'}
                        />
                    </h1>
                ) : (<></>)
            }
            <div className={classes.accountRoot}>
                <AccountSidebar
                    currentLink={currentPage}
                    isOpen={isOpenSidebar}
                    setIsOpen={setIsOpenSidebar}
                />
                {
                    (!isOpenSidebar || !isMobile) && (
                        <div className={classes.accountMain}>
                            {children}
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default myAccountLayout;
