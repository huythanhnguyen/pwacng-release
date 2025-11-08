import React, {useContext} from "react";
import {Form} from "informed";
import Checkbox from "../../../../../override/Components/Checkbox/checkbox";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "../../../../../override/Components/TextInput/textInput";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import defaultClasses from './includeVat.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {useIntl} from "react-intl";
import useIncludeVat from "../../../../Talons/IncludeVat/useIncludeVat";
import {FormContext} from "../../../../Context/Checkout/formContext";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {hasLengthAtMost, isVatNumber} from "../../../../../override/Util/formValidators";

const IncludeVat = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {
        vatInformation,
        isExportVat,
        setIsExportVat,
        deliveryDate,
        doneEditing,
        vatCompany,
        setVatCompany,
        doneGuestSubmit
    } = props;
    const { formatMessage } = useIntl();
    const talonProps = useIncludeVat({
        vatInformation,
        isExportVat,
        setIsExportVat,
        deliveryDate,
        doneEditing,
        vatCompany,
        setVatCompany,
        doneGuestSubmit
    });

    const {
        handleSubmit,
        setFormApi,
        handleCallBeforeDelivery,
        isCallBeforeDelivery,
        formKey
    } = talonProps;

    const { formVatRef } = useContext(FormContext);

    return (
        <div className={classes.block}>
            <Form>
                <div className={classes.checkbox}>
                    <Checkbox
                        field="call_before_delivery"
                        id="call_before_delivery"
                        label={formatMessage({
                            id: 'global.callBeforeDelivery',
                            defaultMessage: 'Call before delivery'
                        })}
                        onChange={e => handleCallBeforeDelivery(e.target.checked)}
                        initialValue={!!isCallBeforeDelivery}
                    />
                </div>
                <div className={classes.checkbox}>
                    <Checkbox
                        field="export_vat_invoice"
                        id="export_vat_invoice"
                        label={formatMessage({
                            id: 'global.exportVatInvoice',
                            defaultMessage: 'Export VAT invoice'
                        })}
                        onChange={() => setIsExportVat(!isExportVat)}
                        initialValue={isExportVat}
                        key={formKey}
                    />
                </div>
            </Form>
            <Form initialValues={vatCompany} getApi={setFormApi} onSubmit={handleSubmit}>
                {
                    isExportVat && (
                        <div className={classes.vatCompany}>
                            <div className={classes.fields}>
                                <Field
                                    id="company_name"
                                    label={formatMessage({
                                        id: 'global.companyName',
                                        defaultMessage: 'Company name'
                                    })}
                                    optional={true}
                                >
                                    <TextInput
                                        autoComplete={formatMessage({
                                            id: 'global.companyName',
                                            defaultMessage: 'Company name'
                                        })}
                                        field="company_name"
                                        id="company_name"
                                        data-cy="company_name"
                                        validate={combine([
                                            isRequired,
                                            [hasLengthAtMost, 100]
                                        ])}
                                        placeholder={formatMessage({
                                            id: 'global.companyName',
                                            defaultMessage: 'Company name'
                                        })}
                                        onChange={e => setVatCompany({...vatCompany, company_name: e.target.value})}
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
                                        autoComplete={formatMessage({
                                            id: 'global.companyTaxCode',
                                            defaultMessage: 'Company tax code'
                                        })}
                                        field="company_vat_number"
                                        id="company_vat_number"
                                        data-cy="company_vat_number"
                                        validate={combine([isRequired, isVatNumber])}
                                        placeholder={formatMessage({
                                            id: 'global.companyTaxCode',
                                            defaultMessage: 'Company tax code'
                                        })}
                                        onChange={e => setVatCompany({...vatCompany, company_vat_number: e.target.value.trim()})}
                                    />
                                </Field>
                            </div>
                            <Field
                                id="company_address"
                                label={formatMessage({
                                    id: 'global.companyAddress',
                                    defaultMessage: 'Company address'
                                })}
                                optional={true}
                            >
                                <TextInput
                                    autoComplete={formatMessage({
                                        id: 'global.company_address',
                                        defaultMessage: 'Company address'
                                    })}
                                    field="company_address"
                                    id="company_address"
                                    data-cy="company_address"
                                    validate={combine([
                                        isRequired,
                                        [hasLengthAtMost, 180]
                                    ])}
                                    validateOnBlur
                                    placeholder={formatMessage({
                                        id: 'global.companyAddress',
                                        defaultMessage: 'Company address'
                                    })}
                                    onChange={e => setVatCompany({...vatCompany, company_address: e.target.value})}
                                />
                            </Field>
                        </div>
                    )
                }
                <button ref={formVatRef} type={'submit'}></button>
            </Form>
        </div>
    )
}

export default IncludeVat
