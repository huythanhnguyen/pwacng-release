import React, {Fragment, useEffect, useMemo, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAccountInformationPage } from '../../Talons/AccountInformationPage/useAccountInformationPage';
import accountClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/account.module.scss';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { Message } from '@magento/venia-ui/lib/components/Field';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import MyAccountLayout from "../MyAccount/myAccountLayout";
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { useToasts } from '@magento/peregrine';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

import defaultClasses from '@magenest/theme/BaseComponents/AccountInformationPage/extendStyle/accountInformationPage.module.scss';
import AccountInformationPageOperations from '@magento/venia-ui/lib/components/AccountInformationPage/accountInformationPage.gql';

const EditModal = React.lazy(() => import('./editModal'));

const AccountInformationPage = props => {
    const classes = useStyle(defaultClasses, accountClasses, props.classes);
    const [, { addToast }] = useToasts();

    const [isOpenSidebar, setIsOpenSidebar] = useState(false);

    const talonProps = useAccountInformationPage({
        ...AccountInformationPageOperations
    });

    const {
        handleCancel,
        formErrors,
        handleChangePassword,
        handleChangeVat,
        handleSubmit,
        initialValues,
        isDisabled,
        loadDataError,
        shouldShowNewPassword,
        setShouldShowNewPassword,
        shouldShowVat,
        setShouldShowVat,
        recaptchaWidgetProps
    } = talonProps;
    const { formatMessage } = useIntl();

    const pageContent = useMemo(() => {
        if (loadDataError) {
            return (
                <>
                    <FormattedMessage
                        id={'accountInformationPage.errorTryAgain'}
                        defaultMessage={
                            'Something went wrong. Please refresh and try again.'
                        }
                    />
                </>
            );
        }
        if (!initialValues) return <LoadingIndicator />;

        let { customer } = initialValues;
        return (
            <Fragment>
                <EditModal
                    formErrors={formErrors}
                    initialValues={customer}
                    isDisabled={isDisabled}
                    onCancel={handleCancel}
                    onChangePassword={handleChangePassword}
                    onChangeVat={handleChangeVat}
                    onSubmit={handleSubmit}
                    shouldShowNewPassword={shouldShowNewPassword}
                    setShouldShowNewPassword={setShouldShowNewPassword}
                    shouldShowVat={shouldShowVat}
                    setShouldShowVat={setShouldShowVat}
                    recaptchaWidgetProps={recaptchaWidgetProps}
                />
            </Fragment>
        )
    }, [
        initialValues,
        loadDataError,
        formErrors,
        isDisabled,
        handleCancel,
        handleChangePassword,
        handleChangeVat,
        handleSubmit,
        shouldShowNewPassword,
        setShouldShowNewPassword,
        shouldShowVat,
        setShouldShowVat,
        recaptchaWidgetProps
    ])


    useEffect(() => {
        if (loadDataError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: loadDataError.message,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [loadDataError])

    return (
        <MyAccountLayout currentPage={'accountInformation'} isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar}>
            <StoreTitle>
                {formatMessage({
                    id: 'accountInformationPage.titleAccount',
                    defaultMessage: 'My profile'
                })}
            </StoreTitle>
            <h2 className={classes.currentPageTitle}>
                <button className={classes.backButton} onClick={() => setIsOpenSidebar(true)}>
                    <span>{'<'}</span>
                </button>
                <span>
                    <FormattedMessage
                        id={'accountInformationPage.accountInformation'}
                        defaultMessage={'My profile'}
                    />
                </span>
            </h2>
            {pageContent}
        </MyAccountLayout>
    );
};

export default AccountInformationPage;
