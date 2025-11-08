import React, {useCallback, useMemo, useState} from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useGoogleReCaptcha } from '@magento/peregrine/lib/hooks/useGoogleReCaptcha';
import { useEventingContext } from '@magento/peregrine/lib/context/eventing';
import {useHistory} from "react-router-dom";
import { useToasts } from '@magento/peregrine';
import {useIntl} from "react-intl";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

export const useAccountInformationPage = props => {
    const {
        mutations: {
            setCustomerInformationMutation,
            changeCustomerPasswordMutation
        },
        queries: { getCustomerInformationQuery }
    } = props;

    const history = useHistory();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    const [{ isSignedIn }] = useUserContext();
    const [shouldShowNewPassword, setShouldShowNewPassword] = useState(false);
    const [shouldShowVat, setShouldShowVat] = useState(false);

    const [isUpdateMode, setIsUpdateMode] = useState(false);

    const [, { dispatch }] = useEventingContext();

    // Use local state to determine whether to display errors or not.
    // Could be replaced by a "reset mutation" function from apollo client.
    // https://github.com/apollographql/apollo-feature-requests/issues/170
    const [displayError, setDisplayError] = useState(false);

    const { data: accountInformationData, error: loadDataError } = useQuery(
        getCustomerInformationQuery,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const [
        setCustomerInformation,
        {
            error: customerInformationUpdateError,
            loading: isUpdatingCustomerInformation
        }
    ] = useMutation(setCustomerInformationMutation);

    const [
        changeCustomerPassword,
        {
            error: customerPasswordChangeError,
            loading: isChangingCustomerPassword
        }
    ] = useMutation(changeCustomerPasswordMutation);

    const {
        generateReCaptchaData,
        recaptchaLoading,
        recaptchaWidgetProps
    } = useGoogleReCaptcha({
        currentForm: 'CUSTOMER_EDIT',
        formAction: 'editCustomer'
    });

    const initialValues = useMemo(() => {
        if (accountInformationData) {
            const customerPhone = accountInformationData.customer.custom_attributes.find(attr => attr.code === 'company_user_phone_number');
            const customerVat = accountInformationData.customer.vat_address;
            const updatedAccountInformationData = {
                ...accountInformationData.customer,
                telephone: customerPhone ? customerPhone.value : '',
                company_name: customerVat?.company_name ? customerVat.company_name : '',
                company_vat_number: customerVat?.company_vat_number ? customerVat.company_vat_number : '',
                company_address: customerVat?.company_address ? customerVat.company_address : ''
            };
            return { customer: updatedAccountInformationData };
        }
    }, [accountInformationData]);

    const handleChangePassword = useCallback(() => {
        setShouldShowNewPassword(!shouldShowNewPassword);
    }, [shouldShowNewPassword, setShouldShowNewPassword]);

    const handleChangeVat = useCallback(() => {
        setShouldShowVat(!shouldShowVat);
    }, [shouldShowVat, setShouldShowVat]);

    const handleCancel = useCallback(() => {
        setIsUpdateMode(false);
        setShouldShowNewPassword(false);
        setShouldShowVat(false);
        // history.push('/dashboard');
    }, [setIsUpdateMode]);

    const showUpdateMode = useCallback(() => {
        setIsUpdateMode(true);

        // If there were errors from removing/updating info, hide them
        // when we open the modal.
        setDisplayError(false);
    }, [setIsUpdateMode]);

    const handleSubmit = useCallback(
        async ({ email, firstname, telephone, customer_no, company_name, company_vat_number, company_address, password, newPassword }) => {
            try {
                email = email.trim();
                firstname = firstname.trim();
                telephone = telephone.trim();
                customer_no = customer_no ? customer_no.trim() : null;
                password = password && password.trim();
                newPassword = newPassword ? newPassword.trim() : newPassword;
                company_name = company_name ? company_name.trim() : company_name;
                company_vat_number = company_vat_number ? company_vat_number.trim() : company_vat_number;
                company_address = company_address ? company_address.trim() : company_address;

                let isChanged = false;

                if (
                    !shouldShowVat && (
                        initialValues.customer.email !== email ||
                        initialValues.customer.firstname !== firstname ||
                        initialValues.customer.telephone !== telephone ||
                        initialValues.customer.customer_no !== customer_no
                    )
                ) {
                    isChanged = true;
                    await setCustomerInformation({
                        variables: {
                            customerInput: {
                                email: email,
                                firstname: firstname,
                                password: password,
                                customer_no: customer_no?.length === 13 ? customer_no : null,
                                mcard_no: customer_no?.length === 16 ? customer_no : null,
                                custom_attributes: [
                                    {
                                        attribute_code: "company_user_phone_number",
                                        value: telephone
                                    }
                                ]
                            }
                        }
                    });
                } else if (
                    shouldShowVat && (
                        initialValues.customer.email !== email ||
                        initialValues.customer.firstname !== firstname ||
                        initialValues.customer.telephone !== telephone ||
                        initialValues.customer.customer_no !== customer_no ||
                        initialValues.customer.company_name !== company_name ||
                        initialValues.customer.company_vat_number !== company_vat_number ||
                        initialValues.customer.company_address !== company_address
                    )
                ) {
                    isChanged = true;
                    await setCustomerInformation({
                        variables: {
                            customerInput: {
                                email: email,
                                firstname: firstname,
                                password: password,
                                customer_no: customer_no?.length === 13 ? customer_no : null,
                                mcard_no: customer_no?.length === 16 ? customer_no : null,
                                vat_address: {
                                    company_name: company_name,
                                    company_vat_number: company_vat_number,
                                    company_address: company_address
                                },
                                custom_attributes: [
                                    {
                                        attribute_code: "company_user_phone_number",
                                        value: telephone
                                    }
                                ]
                            }
                        }
                    });
                }
                if (password && newPassword) {
                    isChanged = true;
                    const recaptchaDataForChangeCustomerPassword = await generateReCaptchaData();
                    await changeCustomerPassword({
                        variables: {
                            currentPassword: password,
                            newPassword: newPassword
                        },
                        ...recaptchaDataForChangeCustomerPassword
                    });
                }

                if (isChanged) {
                    dispatch({
                        type: 'USER_ACCOUNT_UPDATE',
                        payload: {
                            email,
                            firstName: firstname
                        }
                    });

                    // After submission, close the form if there were no errors.
                    requestAnimationFrame(() => {
                        addToast({
                            type: 'success',
                            message: formatMessage({
                                id: 'useAccountInformationPage.submitMessage',
                                defaultMessage: 'Your information has been updated.'
                            }),
                            timeout: 5000
                        });
                        handleCancel(false);
                    });
                } else {
                    addToast({
                        type: 'error',
                        message: formatMessage({
                            id: 'useAccountInformationPage.noUpdated',
                            defaultMessage: 'No information has been updated.'
                        }),
                        timeout: 5000
                    });
                }
            } catch (error) {
                // Make sure any errors from the mutation are displayed.
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error.message,
                    dismissable: true,
                    timeout: 7000
                })
                // setDisplayError(true);

                // we have an onError link that logs errors, and FormError
                // already renders this error, so just return to avoid
                // triggering the success callback
                return;
            }
        },
        [
            initialValues,
            handleCancel,
            setCustomerInformation,
            generateReCaptchaData,
            changeCustomerPassword,
            shouldShowVat,
            dispatch
        ]
    );

    const errors = displayError
        ? [customerInformationUpdateError, customerPasswordChangeError]
        : [];

    return {
        handleCancel,
        formErrors: errors,
        handleSubmit,
        handleChangePassword,
        handleChangeVat,
        initialValues,
        isDisabled:
            isUpdatingCustomerInformation ||
            isChangingCustomerPassword ||
            recaptchaLoading ||
            false,
        isUpdateMode,
        loadDataError,
        shouldShowNewPassword,
        shouldShowVat,
        showUpdateMode,
        recaptchaWidgetProps
    };
};
