import React, {Fragment, useMemo, useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shape, string } from 'prop-types';
import {useQuery} from '@apollo/client';
import { GET_STORE_CONFIG_DATA } from '../../Talons/CreateAccount/createAccount.gql';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Field from '@magento/venia-ui/lib/components/Field';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton';
import Password from '@magento/venia-ui/lib/components/Password';
import TextInput from '@magento/venia-ui/lib/components/TextInput';

import {
    isRequired,
    hasLengthAtLeast,
    validatePassword
} from '../../Util/formValidators';
import combine from '@magento/venia-ui/lib/util/combineValidators';
import defaultClasses from '@magenest/theme/BaseComponents/AccountInformationPage/extendStyle/editForm.module.scss';
import ConfirmPassword from "@magenest/theme/BaseComponents/ConfirmPasword/components/confirmPassword";
import {Form} from "informed";
import Checkbox from "../Checkbox/checkbox";
import {isPhoneNumber, isCustomerNo, isVatNumber} from "../../Util/formValidators";
import {Link} from "react-router-dom";

const EditForm = props => {
    const {
        classes: propClasses,
        handleChangePassword,
        shouldShowNewPassword,
        handleChangeVat,
        shouldShowVat
    } = props;
    const { formatMessage } = useIntl();

    const classes = useStyle(defaultClasses, propClasses);

    const { data: storeConfigData } = useQuery(GET_STORE_CONFIG_DATA, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const {
        minimumPasswordLength
    } = useMemo(() => {
        const storeConfig = storeConfigData?.storeConfig || {};

        return {
            minimumPasswordLength: storeConfig.minimum_password_length
        };
    }, [storeConfigData]);

    const [ newPassword, setNewPassword ] = useState('');

    const maybeNewPasswordField = shouldShowNewPassword ? (
        <div className={`${classes.newPasswordContainer} ${classes.additionalFieldsContainer}`}>
            <div className={classes.legend}>
                <FormattedMessage
                    id={'global.changePassword'}
                    defaultMessage={'Change Password'}
                />
            </div>
            <div className={classes.newPasswordFields}>
                <Password
                    fieldName="newPassword"
                    label={formatMessage({
                        id: 'global.enterNewPassword',
                        defaultMessage: 'Enter New Password'
                    })}
                    placeholder={formatMessage({
                        id: 'global.enterNewPassword',
                        defaultMessage: 'Enter New Password'
                    })}
                    validate={combine([
                        isRequired,
                        [hasLengthAtLeast, minimumPasswordLength],
                        validatePassword
                    ])}
                    isToggleButtonHidden={false}
                    data-cy="newPassword"
                    onChange={(e) => setNewPassword(e.target.value)}
                    optional={true}
                />
                <ConfirmPassword
                    password={newPassword}
                    optional={true}
                />
            </div>
        </div>
    ) : null;

    const maybeVatField = shouldShowVat ? (
        <div className={`${classes.vatContainer} ${classes.additionalFieldsContainer}`}>
            <div className={classes.legend}>
                <FormattedMessage
                    id={'global.addVat'}
                    defaultMessage={'Export company invoices'}
                />
            </div>
            <Field
                id="company_name"
                label={formatMessage({
                    id: 'global.companyName',
                    defaultMessage: 'Company name'
                })}
                optional={true}
            >
                <TextInput
                    field="company_name"
                    data-cy="company_name"
                    placeholder={formatMessage({
                        id: 'global.enterCompanyName',
                        defaultMessage: 'Enter company name'
                    })}
                    validate={isRequired}
                />
            </Field>
            <Field
                id="company_vat_number"
                label={formatMessage({
                    id: 'global.companyTaxCode',
                    defaultMessage: 'Company tax code'
                })}
                optional={true}
            >
                <TextInput
                    field="company_vat_number"
                    data-cy="company_vat_number"
                    placeholder={formatMessage({
                        id: 'global.enterCompanyTaxCode',
                        defaultMessage: 'Enter company tax code'
                    })}
                    validate={combine([isRequired, isVatNumber])}
                />
            </Field>
            <Field
                id="company_address"
                label={formatMessage({
                    id: 'global.companyAddress',
                    defaultMessage: 'Company address'
                })}
                optional={true}
            >
                <TextInput
                    field="company_address"
                    data-cy="company_address"
                    placeholder={formatMessage({
                        id: 'global.enterCompanyAddress',
                        defaultMessage: 'Enter company address'
                    })}
                    validate={isRequired}
                />
            </Field>
        </div>
    ) : null;

    const maybeChangePasswordButton = (
        <div
            className={shouldShowNewPassword ? `${classes.checkboxButtonContainer} ${classes.checkedButton}` : classes.checkboxButtonContainer}
            data-cy="editForm-changePasswordButtonContainer"
        >
            <LinkButton
                classes={classes.changePasswordButton}
                type="button"
                onClick={handleChangePassword}
                data-cy="linkButton-root"
            >
                <FormattedMessage
                    id={'global.changePassword'}
                    defaultMessage={'Change Password'}
                />
            </LinkButton>
        </div>
    );

    const maybeAddVatButton = (
        <div
            className={shouldShowVat ? `${classes.checkboxButtonContainer} ${classes.checkedButton}` : classes.checkboxButtonContainer}
            data-cy="editForm-addVatButtonContainer"
        >
            <LinkButton
                classes={classes.addVatButton}
                type="button"
                onClick={handleChangeVat}
                data-cy="linkButton-root"
            >
                <FormattedMessage
                    id={'global.addVat'}
                    defaultMessage={'Export company invoices'}
                />
            </LinkButton>
        </div>
    );

    const passwordLabel = shouldShowNewPassword
        ? formatMessage({
              id: 'global.currentPassword',
              defaultMessage: 'Current Password'
          })
        : formatMessage({
              id: 'global.password',
              defaultMessage: 'Password'
          });
    return (
        <Fragment>
            <div className={classes.root}>
                <Field
                    id="firstname"
                    label={formatMessage({
                        id: 'global.firstName',
                        defaultMessage: 'Full Name'
                    })}
                    optional={true}
                >
                    <TextInput
                        field="firstname"
                        validate={isRequired}
                        data-cy="firstname"
                        placeholder={formatMessage({
                            id: 'global.firstName',
                            defaultMessage: 'Full Name'
                        })}
                    />
                </Field>
                <div className={classes.fields}>
                    <Field
                        id="email"
                        label={formatMessage({
                            id: 'global.email',
                            defaultMessage: 'Email'
                        })}
                        optional={true}
                    >
                        <TextInput
                            field="email"
                            validate={isRequired}
                            data-cy="email"
                            placeholder={formatMessage({
                                id: 'global.email',
                                defaultMessage: 'Email'
                            })}
                        />
                    </Field>
                    <Field
                        id="telephone"
                        label={formatMessage({
                            id: 'global.telephone',
                            defaultMessage: 'Telephone'
                        })}
                        optional={true}
                    >
                        <TextInput
                            field="telephone"
                            data-cy="telephone"
                            validate={combine([isRequired, isPhoneNumber])}
                            validateOnBlur
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            aria-label={formatMessage({
                                id: 'global.telephoneRequired',
                                defaultMessage: 'Telephone Required'
                            })}
                            placeholder={formatMessage({
                                id: 'global.telephone',
                                defaultMessage: 'Telephone'
                            })}
                        />
                    </Field>
                </div>
                <Field
                    id="customer_no"
                    label={formatMessage({
                        id: 'global.customerNo',
                        defaultMessage: 'Mcard code'
                    })}
                >
                    <TextInput
                        field="customer_no"
                        data-cy="customer_no"
                        validate={isCustomerNo}
                        placeholder={formatMessage({
                            id: 'global.enterCustomerNo',
                            defaultMessage: 'Enter Mcard code'
                        })}
                    />
                    <p className={classes.fieldNote}>
                        <FormattedMessage
                            id="global.customerNoNote"
                            defaultMessage="* Enter {mcard} code or {customerCode}"
                            values={{
                                mcard: <b>Mcard</b>,
                                customerCode: <b><FormattedMessage id="global.customerCode" defaultMessage="Customer code" /></b>
                            }}
                        />
                    </p>
                </Field>
                <Field
                    id="password"
                    label={formatMessage({
                        id: 'global.password',
                        defaultMessage: 'Password'
                    })}
                    optional={true}
                >
                    <Password
                        fieldName="password"
                        placeholder={formatMessage({
                            id: 'global.enterPassword',
                            defaultMessage: 'Enter Password'
                        })}
                        validate={null}
                        autoComplete="current-password"
                        isToggleButtonHidden={false}
                        data-cy="password"
                    />
                </Field>
            </div>
            <div className={classes.moreChangeActions}>
                {maybeChangePasswordButton}
                {maybeAddVatButton}
            </div>
            {maybeNewPasswordField}
            {maybeVatField}
        </Fragment>
    );
};

export default EditForm;

EditForm.propTypes = {
    classes: shape({
        changePasswordButton: string,
        checkboxButtonContainer: string,
        addVatButton: string,
        additionalFieldsContainer: string,
        newPasswordContainer: string,
        newPasswordFields: string,
        vatContainer: string,
        root: string,
        field: string,
        email: string,
        firstname: string,
        fieldNote: string,
        buttons: string,
        passwordLabel: string,
        password: string,
        newPassword: string
    })
};
