import React, {Fragment, useContext, useRef} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { func, shape, string, arrayOf, number } from 'prop-types';
import { useGuestForm } from '../../../../Talons/CheckoutPage/ShippingInformation/AddressForm/useGuestForm';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '../../../TextInput/textInput';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/AddressForm/guestForm.module.css';
import guestFormClasses from '@magenest/theme/BaseComponents/CheckoutPage/extendStyle/guestForm.module.scss';
import City from "../../../../../@theme/BaseComponents/City";
import Ward from "../../../../../@theme/BaseComponents/Ward";
import {FormContext} from "../../../../../@theme/Context/Checkout/formContext";
import Region from "@magento/venia-ui/lib/components/Region";
import Country from "@magento/venia-ui/lib/components/Country";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {hasLengthAtMost, isEmail, isPhoneNumber, isName} from "../../../../Util/formValidators";
import Modal from "../../../../../@theme/BaseComponents/Modal";

const GuestForm = props => {
    const {
        isReady,
        afterSubmit,
        classes: propClasses,
        shippingData,
        setCheckoutStep,
        CHECKOUT_STEP,
        setDoneGuestSubmit,
        submitCount,
        setSelectedAddressId,
        setLoading,
        selectedAddressId
    } = props;

    const talonProps = useGuestForm({
        isReady,
        afterSubmit,
        shippingData,
        setCheckoutStep,
        CHECKOUT_STEP,
        setDoneGuestSubmit,
        setSelectedAddressId,
        setLoading
    });
    const {
        handleSubmit,
        initialValues,
        address,
        setAddress,
        handleValidateEmail,
        setFormApi,
        formApiRef,
        formKey,
        setAddressUpdated,
        setCheckoutCity,
        setCheckoutWard,
        setCheckoutStreet
    } = talonProps;

    const { formShippingRef } = useContext(FormContext);

    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, guestFormClasses, propClasses);

    return (
        <Fragment>
            <Form
                className={classes.root}
                data-cy="GuestForm-root"
                initialValues={initialValues}
                onSubmit={handleSubmit}
                getApi={setFormApi}
                key={formKey}
            >
                <div className={classes.block}>
                    <strong
                        data-cy="ShippingInformation-editTitle"
                        className={classes.contentTitle}
                    >
                        <FormattedMessage
                            id={'global.shippingInformation'}
                            defaultMessage={'Shipping information'}
                        />
                    </strong>
                    <div className={classes.guestInformation}>
                        <Field
                            id="firstname"
                            label={formatMessage({
                                id: 'global.recipient',
                                defaultMessage: 'Recipient'
                            })}
                            optional={true}
                        >
                            <TextInput
                                autoComplete={formatMessage({
                                    id: 'global.firstname',
                                    defaultMessage: 'firstname'
                                })}
                                field="firstname"
                                id="firstname"
                                data-cy="GuestForm-firstname"
                                validate={combine([
                                    isRequired,
                                    [hasLengthAtMost, 50],
                                    isName
                                ])}
                                validateOnBlur
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                placeholder={formatMessage({
                                    id: 'global.recipient',
                                    defaultMessage: 'Recipient'
                                })}
                            />
                        </Field>
                        <Field
                            id="email"
                            label={formatMessage({
                                id: 'global.email',
                                defaultMessage: 'Email'
                            })}
                            optional={true}
                        >
                            <TextInput
                                autoComplete={formatMessage({
                                    id: 'shippingForm.shippingEmail',
                                    defaultMessage: 'Shipping Email'
                                })}
                                field="email"
                                id="email"
                                data-cy="GuestForm-email"
                                validate={combine([isRequired, isEmail])}
                                validateOnBlur
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                aria-label={formatMessage({
                                    id: 'global.emailRequired',
                                    defaultMessage: 'Email Required'
                                })}
                                placeholder={formatMessage({
                                    id: 'global.enterEmail',
                                    defaultMessage: 'Enter Email'
                                })}
                            />
                        </Field>
                        <Field
                            id="telephone"
                            label={formatMessage({
                                id: 'global.phoneNumber',
                                defaultMessage: 'Phone Number'
                            })}
                            optional={true}
                        >
                            <TextInput
                                autoComplete={formatMessage({
                                    id: 'global.phoneNumber',
                                    defaultMessage: 'Phone Number'
                                })}
                                field="telephone"
                                id="telephone"
                                data-cy="GuestForm-telephone"
                                validateOnBlur
                                validate={combine([isRequired, isPhoneNumber])}
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                aria-label={formatMessage({
                                    id: 'global.phonenumberRequired',
                                    defaultMessage: 'Phone Number Required'
                                })}
                                placeholder={formatMessage({
                                    id: 'global.phoneNumber',
                                    defaultMessage: 'Phone Number'
                                })}
                            />
                        </Field>
                    </div>
                </div>
                <div className={classes.block}>
                    <strong
                        data-cy="ShippingInformation-editTitle"
                        className={classes.contentTitle}
                    >
                        <FormattedMessage
                            id={'global.deliveryAddress'}
                            defaultMessage={'Delivery address'}
                        />
                    </strong>
                    <div className={classes.guestAddress}>
                        <div className={classes.newAdministrativeNote}>
                            <FormattedMessage
                                id={'global.newAdministrativeNote'}
                                defaultMessage={'Please enter the address according to the new administrative divisions to ensure correct delivery address.'}
                            />
                        </div>
                        <div className={classes.fields}>
                            <City
                                field={'city'}
                                validate={isRequired}
                                data-cy="city"
                                setAddress={setSelectedAddressId}
                                address={selectedAddressId}
                                validateOnBlur
                                optional={true}
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                onChange={(e) => {
                                    setCheckoutCity(e.target.value || '');
                                    setCheckoutWard('');
                                    setAddressUpdated(true);
                                }}
                            />
                            <Ward
                                field={'ward'}
                                validate={isRequired}
                                data-cy="ward"
                                address={selectedAddressId}
                                setAddress={setSelectedAddressId}
                                validateOnBlur
                                optional={true}
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                onChange={(e) => {
                                    setCheckoutWard(e.target.value || '')
                                    setAddressUpdated(true);
                                }}
                            />
                        </div>
                        <Field
                            id="street0"
                            label={formatMessage({
                                id: 'global.detailedAddress',
                                defaultMessage: 'Detailed address'
                            })}
                            optional={true}
                        >
                            <TextInput
                                autoComplete={formatMessage({
                                    id: 'global.streetAddress',
                                    defaultMessage: 'Street Address'
                                })}
                                field="street[0]"
                                id="street0"
                                data-cy="GuestForm-street0"
                                validate={combine([
                                    isRequired,
                                    [hasLengthAtMost, 150]
                                ])}
                                validateOnBlur
                                aria-label={formatMessage({
                                    id: 'global.streetAddressRequired',
                                    defaultMessage: 'Street Address Required'
                                })}
                                placeholder={formatMessage({
                                    id: 'global.detailedAddress',
                                    defaultMessage: 'Detailed address'
                                })}
                                onBlur={(e) => {
                                    setCheckoutStreet(e.target.value?.trim() || '');
                                    setAddressUpdated(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setCheckoutStreet(e.target.value?.trim() || '');
                                        setAddressUpdated(true);
                                    }
                                }}
                            />
                        </Field>
                    </div>
                </div>
                <button key={submitCount} ref={formShippingRef} type={'submit'}></button>
            </Form>
        </Fragment>
    );
};

export default GuestForm;

GuestForm.defaultProps = {
    shippingData: {
        country: {
            code: DEFAULT_COUNTRY_CODE
        }
    }
};

GuestForm.propTypes = {
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
        postcode: string,
        telephone: string,
        buttons: string,
        submit: string,
        submit_update: string
    }),
    onCancel: func,
    shippingData: shape({
        city: string,
        country: shape({
            code: string.isRequired
        }).isRequired,
        email: string,
        firstname: string,
        postcode: string,
        street: arrayOf(string),
        telephone: string
    })
};
