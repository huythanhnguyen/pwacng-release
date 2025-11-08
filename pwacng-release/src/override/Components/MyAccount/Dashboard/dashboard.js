import React, { useState } from 'react';
import { useStyle } from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/MyAccount/Dashboard/extendStyle/dashboard.module.scss';
import accountClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';
import MyAccountLayout from "../myAccountLayout";
import DashboardContent from "./dashboardContent";
import { FormattedMessage } from 'react-intl';
import useMediaCheck from "../../../../@theme/Hooks/MediaCheck/useMediaCheck";

const Dashboard = props => {
    const classes = useStyle(defaultClasses, accountClasses, props.classes);

    const { isMobile } = useMediaCheck();
    const [isOpenSidebar, setIsOpenSidebar] = useState(false);

    return (
        <MyAccountLayout currentPage={'dashboard'} isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar}>
            {
                isMobile && (
                    <h2 className={classes.currentPageTitle}>
                        <button className={classes.backButton} onClick={() => setIsOpenSidebar(true)}>
                            <span>{'<'}</span>
                        </button>
                        <span>
                            <FormattedMessage
                                id={'global.dashboard'}
                                defaultMessage={'General information'}
                            />
                        </span>
                    </h2>
                )
            }
            <DashboardContent/>
        </MyAccountLayout>
    );
};

export default Dashboard;
