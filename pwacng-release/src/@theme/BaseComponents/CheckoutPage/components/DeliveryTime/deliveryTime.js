import {FormattedMessage, useIntl} from "react-intl";
import Field from "@magento/venia-ui/lib/components/Field";
import Select from "../../../../../override/Components/Select/select";
import TextArea from "@magento/venia-ui/lib/components/TextArea";
import React, {useContext} from "react";
import {Form} from "informed";
import defaultClasses from './deliveryTime.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import useDeliveryTime from "../../../../Talons/DeliveryTime/useDeliveryTime";
import {hasLengthAtMost, isRequired} from "../../../../../override/Util/formValidators";
import {FormContext} from "../../../../Context/Checkout/formContext";
import combine from "@magento/venia-ui/lib/util/combineValidators";

const DeliveryTime = props => {
    const {
        deliveryDate,
        setDeliveryDate,
        isExportVat,
        doneEditing,
        doneGuestSubmit,
        deliveryDateInformation,
        isDeliveryTimeInit,
        setIsDeliveryTimeInit
    } = props
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const talonProps = useDeliveryTime({
        setDeliveryDate,
        deliveryDate,
        isExportVat,
        doneEditing,
        doneGuestSubmit,
        deliveryDateInformation,
        isDeliveryTimeInit,
        setIsDeliveryTimeInit
    });
    const { formDeliveryRef } = useContext(FormContext);

    const {
        handeChangeDate,
        handeChangeTime,
        dateData,
        timeData,
        handleChangeNote,
        setFormApi,
        commentMaxLength,
        fieldKey
    } = talonProps;

    return (
        <Form initialValues={deliveryDate} getApi={setFormApi} key={fieldKey}>
            <div className={classes.block}>
                <strong
                    data-cy="ShippingInformation-editTitle"
                    className={classes.contentTitle}
                >
                    <FormattedMessage
                        id={'global.deliveryTime'}
                        defaultMessage={'Delivery time'}
                    />
                </strong>
                <div className={classes.blockContent}>
                    <div className={classes.fields}>
                        <Field
                            id={'date'}
                            label={formatMessage({
                                id: 'global.deliveryDate',
                                defaultMessage: 'Delivery date'
                            })}
                            optional={true}
                        >
                            <Select
                                field={'date'}
                                validate={isRequired}
                                data-cy="date"
                                onChange={(e) => handeChangeDate(e.target.value)}
                                items={dateData}
                                isEmpty={!deliveryDate?.date}
                            />
                        </Field>
                        <Field
                            id={'time_interval_id'}
                            label={formatMessage({
                                id: 'global.deliveryHour',
                                defaultMessage: 'Delivery hour'
                            })}
                            optional={true}
                        >
                            <Select
                                field={'time_interval_id'}
                                validate={isRequired}
                                data-cy="time_interval_id"
                                onChange={(e) => handeChangeTime(e.target.value)}
                                items={timeData}
                                isEmpty={!deliveryDate?.time_interval_id}
                            />
                        </Field>
                    </div>
                    <Field
                        id="comment"
                        label={formatMessage({
                            id: 'global.note',
                            defaultMessage: 'Note'
                        })}
                    >
                        <TextArea
                            field="comment"
                            id="comment"
                            data-cy="GuestForm-comment"
                            placeholder={formatMessage({
                                id: 'global.note',
                                defaultMessage: 'Note'
                            })}
                            validate={combine([
                                [hasLengthAtMost, commentMaxLength]
                            ])}
                            validateOnBlur
                            onChange={e => handleChangeNote(e.target.value)}
                            initialValue={deliveryDate?.comment}
                        />
                        <p className={classes.fieldNote}>
                            <FormattedMessage
                                id={'global.noObligation'}
                                defaultMessage={'* No obligation'}
                            />
                        </p>
                    </Field>
                </div>
            </div>
            <button ref={formDeliveryRef} type={'submit'}></button>
        </Form>
    )
}

export default DeliveryTime
