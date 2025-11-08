import React, { Fragment } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { useCustomerForm } from '../../../../Talons/CheckoutPage/ShippingInformation/AddressForm/useCustomerForm';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Button from '@magento/venia-ui/lib/components/Button';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Field, { Message } from '@magento/venia-ui/lib/components/Field';
import FormError from '@magento/venia-ui/lib/components/FormError';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/AddressForm/customerForm.module.css';
import customerFormClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/customerForm.module.scss';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import City from "../../../../../@theme/BaseComponents/City";
import Ward from "../../../../../@theme/BaseComponents/Ward";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isEmail, isPhoneNumber} from "../../../../Util/formValidators";
import Modal from "../../../../../@theme/BaseComponents/Modal";

const CustomerForm = props => {
    const {
        afterSubmit,
        classes: propClasses,
        onCancel,
        shippingData,
        setSelectedAddress,
        setSelectedAddressId
    } = props;

    const talonProps = useCustomerForm({
        afterSubmit,
        onCancel,
        shippingData,
        setSelectedAddress,
        setSelectedAddressId
    });
    const {
        errors,
        handleCancel,
        handleSubmit,
        hasDefaultShipping,
        initialValues,
        isLoading,
        isSaving,
        isUpdate,
        address,
        setAddress
    } = talonProps;
    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, customerFormClasses, propClasses);

    if (isLoading) {
        return (
            <LoadingIndicator>
                <FormattedMessage
                    id={'customerForm.loading'}
                    defaultMessage={'Fetching Customer Details...'}
                />
            </LoadingIndicator>
        );
    }

    const emailRow = !hasDefaultShipping ? (
        <div className={classes.email}>
            <Field
                id="email"
                label={formatMessage({
                    id: 'global.email',
                    defaultMessage: 'Email'
                })}
            >
                <TextInput
                    disabled={true}
                    field="email"
                    id="email"
                    validate={combine([isRequired, isEmail])}
                />
            </Field>
        </div>
    ) : null;

    const formMessageRow = !hasDefaultShipping ? (
        <div data-cy="CustomerForm-formMessage" className={classes.formMessage}>
            <Message>
                <FormattedMessage
                    id={'customerForm.formMessage'}
                    defaultMessage={
                        'The shipping address you enter will be saved to your address book and set as your default for future purchases.'
                    }
                />
            </Message>
        </div>
    ) : null;

    const cancelButton = isUpdate ? (
        <Button disabled={isSaving} onClick={handleCancel} priority="low">
            <FormattedMessage
                id={'global.cancelButton'}
                defaultMessage={'Cancel'}
            />
        </Button>
    ) : null;

    const submitButtonText = !hasDefaultShipping
        ? formatMessage({
            id: 'global.saveInformation',
            defaultMessage: 'Save information'
        })
        : isUpdate
            ? formatMessage({
                id: 'global.saveInformation',
                defaultMessage: 'Save information'
            })
            : formatMessage({
                id: 'global.saveInformation',
                defaultMessage: 'Save information'
            });
    const submitButtonProps = {
        disabled: isSaving,
        priority: 'high',
        type: 'submit'
    };

    const createErrorMessage = JSON.stringify(
        errors.get('createCustomerAddressMutation')
    );
    const updateErrorMessage = JSON.stringify(
        errors.get('updateCustomerAddressMutation')
    );
    const errorMessage = 'region_id is required for the specified country code';
    const regionError =
        createErrorMessage?.includes(errorMessage) ||
        updateErrorMessage?.includes(errorMessage);

    // errors
    return (
        <Fragment>
            <Form
                className={classes.root}
                data-cy="CustomerForm-root"
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                <div className={classes.newAdministrativeNote}>
                    <FormattedMessage
                        id={'global.newAdministrativeNote'}
                        defaultMessage={'Please enter the address according to the new administrative divisions to ensure correct delivery address.'}
                    />
                </div>
                <FormError errors={Array.from(errors.values())} />
                <div className={classes.firstname}>
                    <Field
                        id="customer_firstname"
                        label={formatMessage({
                            id: 'global.recipientName',
                            defaultMessage: 'Recipient name'
                        })}
                        optional={true}
                    >
                        <TextInput
                            field="firstname"
                            id="customer_firstname"
                            data-cy="CustomerForm-firstName"
                            validate={isRequired}
                            validateOnBlur
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            aria-label={formatMessage({
                                id: 'global.firstNameRequired',
                                defaultMessage: 'First Name Required'
                            })}
                            placeholder={formatMessage({
                                id: 'global.recipientName',
                                defaultMessage: 'Recipient name'
                            })}
                        />
                    </Field>
                </div>
                <div className={classes.telephone}>
                    <Field
                        id="customer_telephone"
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Phone Number'
                        })}
                        optional={true}
                    >
                        <TextInput
                            field="telephone"
                            validateOnBlur
                            validate={combine([isRequired, isPhoneNumber])}
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            id="customer_telephone"
                            data-cy="CustomerForm-telephone"
                            aria-label={formatMessage({
                                id: 'global.phonenumberRequired',
                                defaultMessage: 'Phone Number Required'
                            })}
                            placeholder={formatMessage({
                                id: 'global.telephone',
                                defaultMessage: 'Telephone'
                            })}
                        />
                    </Field>
                </div>
                <City
                    field={'city'}
                    validate={isRequired}
                    data-cy="city"
                    setAddress={setAddress}
                    address={address}
                    initialValue={address.is_new_administrative ? address.city : ''}
                    optional={true}
                />
                <Ward
                    field={'ward'}
                    validate={isRequired}
                    data-cy="ward"
                    address={address}
                    setAddress={setAddress}
                    initialValue={address.is_new_administrative ? address.ward : ''}
                    optional={true}
                />
                <div className={classes.street}>
                    <Field
                        id="customer_street0"
                        label={formatMessage({
                            id: 'global.streetAddress',
                            defaultMessage: 'Street Address'
                        })}
                        optional={true}
                    >
                        <TextInput
                            field="street[0]"
                            validate={isRequired}
                            id="customer_street0"
                            data-cy="CustomerForm-street0"
                            aria-label={formatMessage({
                                id: 'global.streetAddressRequired',
                                defaultMessage: 'Street Address Required'
                            })}
                            placeholder={formatMessage({
                                id: 'global.streetAddress',
                                defaultMessage: 'Street Address'
                            })}
                        />
                    </Field>
                </div>
                <div className={classes.defaultShipping}>
                    <Checkbox
                        disabled={!!initialValues.default_shipping}
                        id="default_shipping"
                        data-cy="CustomerForm-defaultShipping"
                        field="default_shipping"
                        label={formatMessage({
                            id: 'customerForm.defaultShipping',
                            defaultMessage: 'Make this my default address'
                        })}
                    />
                </div>
                <div className={classes.buttons}>
                    <Button
                        {...submitButtonProps}
                        data-cy="CustomerForm-submitButton"
                    >
                        {submitButtonText}
                    </Button>
                </div>
            </Form>
        </Fragment>
    );
};

export default CustomerForm;

CustomerForm.defaultProps = {
    shippingData: {
        country: {
            code: DEFAULT_COUNTRY_CODE
        },
        region: {
            id: null
        }
    }
};

CustomerForm.propTypes = {
    afterSubmit: func,
    classes: shape({
        root: string,
        field: string,
        email: string,
        firstname: string,
        country: string,
        street0: string,
        street1: string,
        city: string,
        region: string,
        postcode: string,
        telephone: string,
        buttons: string,
        formMessage: string,
        defaultShipping: string
    }),
    onCancel: func,
    shippingData: shape({
        city: string,
        country: shape({
            code: string.isRequired
        }).isRequired,
        default_shipping: bool,
        email: string,
        firstname: string,
        id: number,
        postcode: string,
        region: shape({
            id: number
        }).isRequired,
        street: arrayOf(string),
        telephone: string
    })
};
