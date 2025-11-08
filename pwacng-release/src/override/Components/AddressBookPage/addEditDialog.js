import React, {useEffect, useState} from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import {FormattedMessage, useIntl} from 'react-intl';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Dialog from '@magento/venia-ui/lib/components/Dialog';
import Field from '@magento/venia-ui/lib/components/Field';
import FormError from '@magento/venia-ui/lib/components/FormError';
import City from "@magenest/theme/BaseComponents/City";
import Ward from "@magenest/theme/BaseComponents/Ward";
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import defaultClasses from '@magenest/theme/BaseComponents/AddressBookPage/extendStyle/addEditDialog.module.scss';
import {Form} from "informed";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isPhoneNumber} from "../../Util/formValidators";

const AddEditDialog = props => {
    const {
        formErrors,
        formProps,
        isBusy,
        isEditMode,
        isOpen,
        onCancel,
        onConfirm
    } = props;

    const { formatMessage } = useIntl();
    const [ cityKey, setCityKey ] = useState(1);
    const [ wardKey, setWardKey ] = useState(1);

    const classes = useStyle(defaultClasses, props.classes);

    const initialValueFirstName = isEditMode ? formProps.initialValues?.firstname : '';
    const initialValueTelephone = isEditMode ? formProps.initialValues?.telephone : '';
    const initialValueStreet0 = isEditMode ? formProps.initialValues?.street[0] : '';
    const initialValueCity = isEditMode && formProps.initialValues?.is_new_administrative ? formProps.initialValues?.custom_attributes?.find(attr => attr.attribute_code === 'city_code')?.value : '';
    const initialValueWard = isEditMode && formProps.initialValues?.is_new_administrative ? formProps.initialValues?.custom_attributes?.find(attr => attr.attribute_code === 'ward_code')?.value : '';

    const [ storeLocationValue, setStoreLocationValue ] = useState({
        city: initialValueCity,
        ward: initialValueWard
    });
    useEffect(() => {
        setStoreLocationValue({
            city: initialValueCity,
            ward: initialValueWard
        })
    }, [isOpen, formProps.initialValues]);

    let formatTitleArgs;
    if (isEditMode) {
        formatTitleArgs = {
            id: 'addressBookPage.editDialogTitle',
            defaultMessage: 'Edit Address'
        };
    } else {
        formatTitleArgs = {
            id: 'addressBookPage.addDialogTitle',
            defaultMessage: 'New Address'
        };
    }
    const title = formatMessage(formatTitleArgs);

    const firstNameLabel = formatMessage({
        id: 'global.firstName',
        defaultMessage: 'First Name'
    });
    const street1Label = formatMessage({
        id: 'global.streetAddress',
        defaultMessage: 'Address details'
    });
    const cityLabel = formatMessage({
        id: 'global.city',
        defaultMessage: 'City'
    });
    const telephoneLabel = formatMessage({
        id: 'global.telephone',
        defaultMessage: 'Phone number'
    });
    const defaultAddressCheckLabel = formatMessage({
        id: 'addressBookPage.makeDefaultAddress',
        defaultMessage: 'Make this my default address'
    });

    useEffect(() => {
        if (isOpen) {
            setCityKey(prev => prev + 1);
            setWardKey(prev => prev + 1);
        }
    }, [isOpen]);

    return (
        <Dialog
            classes={{
                dialog: classes.addressDialog,
                cancelButton: classes.addressCancelButton
            }}
            confirmTranslationId={'addressBookPage.saveDialogButton'}
            confirmText="Save address"
            formProps={formProps}
            isOpen={isOpen}
            onCancel={onCancel}
            onConfirm={onConfirm}
            shouldDisableAllButtons={isBusy}
            title={title}
        >
            <div className={classes.newAdministrativeNote}>
                <FormattedMessage
                    id={'global.newAdministrativeNote'}
                    defaultMessage={'Please enter the address according to the new administrative divisions to ensure correct delivery address.'}
                />
            </div>
            <FormError
                classes={{ root: classes.errorContainer }}
                errors={Array.from(formErrors.values())}
            />
            <div className={classes.root} data-cy="AddEditDialog-root">
                <div className={`${classes.firstname} ${classes.fullWidthField}`}>
                    <Field
                        id="firstname"
                        label={firstNameLabel}
                        optional={true}
                    >
                        <TextInput
                            field="firstname"
                            validate={isRequired}
                            data-cy="firstname"
                            placeholder={firstNameLabel}
                            initialValue={initialValueFirstName}
                        />
                    </Field>
                </div>
                <div className={`${classes.telephone} ${classes.fullWidthField}`}>
                    <Field
                        id="telephone"
                        label={telephoneLabel}
                        optional={true}
                    >
                        <TextInput
                            field="telephone"
                            validate={combine([isRequired, isPhoneNumber])}
                            data-cy="telephone"
                            placeholder={telephoneLabel}
                            initialValue={initialValueTelephone}
                        />
                    </Field>
                </div>
                <div className={`${classes.city} ${classes.fullWidthField}`}>
                    <City
                        field={'city_code'}
                        validate={isRequired}
                        data-cy="city_code"
                        setAddress={setStoreLocationValue}
                        address={storeLocationValue}
                        optional={true}
                        cityKey={cityKey}
                    />
                </div>
                <div className={`${classes.ward} ${classes.fullWidthField}`}>
                    <Ward
                        field={'ward_code'}
                        validate={isRequired}
                        data-cy="ward_code"
                        address={storeLocationValue}
                        setAddress={setStoreLocationValue}
                        optional={true}
                        wardKey={wardKey}
                    />
                </div>
                <div className={`${classes.street1} ${classes.fullWidthField}`}>
                    <Field
                        id="street1"
                        label={street1Label}
                        optional={true}>
                        <TextInput
                            field="street[0]"
                            validate={isRequired}
                            data-cy="street[0]"
                            placeholder={street1Label}
                            initialValue={initialValueStreet0}
                        />
                    </Field>
                </div>
                <div className={`${classes.default_address_check} ${classes.fullWidthField}`}>
                    <Checkbox
                        field="default_shipping"
                        label={defaultAddressCheckLabel}
                        data-cy="default_shipping"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default AddEditDialog;

AddEditDialog.propTypes = {
    classes: shape({
        root: string,
        fullWidthField: string,
        default_address_check: string,
        errorContainer: string,
        firstname: string,
        street1: string,
        telephone: string,
        addressDialog: string,
        addressCancelButton: string
    }),
    formErrors: object,
    isEditMode: bool,
    isOpen: bool,
    onCancel: func,
    onConfirm: func
};
