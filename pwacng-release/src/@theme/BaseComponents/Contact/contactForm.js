import React, {useEffect, useState} from 'react';
import { useQuery } from '@apollo/client';
import defaultClasses from './contactForm.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";

import FormError from "@magento/venia-ui/lib/components/FormError";
import {Form} from "informed";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "@magento/venia-ui/lib/components/TextInput";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import TextArea from "@magento/venia-ui/lib/components/TextArea";
import Button from "@magento/venia-ui/lib/components/Button";
import {useContactForm} from "./useContactForm";
import {useToasts} from "@magento/peregrine";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isEmail, isPhoneNumber} from "../../../override/Util/formValidators";

const ContactForm = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useContactForm({});

    const {
        contactFields,
        errors,
        handleSubmit,
        isBusy,
        isLoading,
        setFormApi,
        response
    } = talonProps;

    const inputFields = contactFields.map((item, index) => {
        return (
            <div className={`${classes.contactField} ${item.name}`} key={index}>
                <Field
                    id={item.name}
                    label={item.label}
                    optional={!!item.required}
                >
                    {
                        item.name === 'comment' ? (
                            <TextArea
                                autoComplete={item.name}
                                field={item.name}
                                id={item.name}
                                validate={item.required ? isRequired : ''}
                                data-cy={item.name}
                                placeholder={item.label}
                            />
                        ) : (
                            <TextInput
                                autoComplete={item.name}
                                field={item.name}
                                id={item.name}
                                data-cy={item.name}
                                placeholder={item.label}
                                validate={item.name === 'telephone' ? (
                                    item.required ? combine([isRequired, isPhoneNumber]) : combine([isPhoneNumber])
                                ) : (
                                    item.name === 'email' ? (
                                        item.required ? combine([isRequired, isEmail]) : combine([isEmail])
                                    ) : (
                                        item.required ? isRequired : ''
                                    )
                                )}
                            />
                        )
                    }
                </Field>
            </div>
        );
    });

    return (
        <div className={classes.contactFormInner}>
            <FormError
                allowErrorMessages
                errors={Array.from(errors.values())}
            />
            <Form
                getApi={setFormApi}
                className={classes.form}
                onSubmit={handleSubmit}
            >
                <h2>
                    <FormattedMessage
                        id={'contactPage.infoText'}
                        defaultMessage={'How can we help you?'}
                    />
                </h2>
                <div className={classes.contactFieldSet}>
                    {inputFields}
                </div>
                <div className={classes.buttonsContainer}>
                    <Button
                        priority="high"
                        type="submit"
                        disabled={isBusy || false}
                        data-cy="submit"
                    >
                        <FormattedMessage
                            id={'contactPage.submit'}
                            defaultMessage={'Send support'}
                        />
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default ContactForm;
