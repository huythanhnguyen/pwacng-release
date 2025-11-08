import {StoreTitle} from "@magento/venia-ui/lib/components/Head";
import React from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./updatePhoneNumber.module.scss";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "../../../override/Components/TextInput/textInput";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import {isPhoneNumber} from "../../../override/Util/formValidators";
import Button from "../../../override/Components/Button/button";
import {Form} from "informed";
import useUpdatePhoneNumber from "../../Talons/UpdatePhoneNumber/useUpdatePhoneNumber";

const UpdatePhoneNumber = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const talonProps = useUpdatePhoneNumber();
    const {
        handleSubmit
    } = talonProps;

    return (
        <div className={classes.root}>
            <StoreTitle>
                {formatMessage({
                    id: 'signInPage.title',
                    defaultMessage: 'Sign In'
                })}
            </StoreTitle>
            <div className={classes.contentContainer}>
                <div className={classes.wrapper}>
                    <span data-cy="SignIn-title" className={classes.title}>
                        <FormattedMessage
                            id={'global.updatePhoneNumber'}
                            defaultMessage={'Update phone number'}
                        />
                    </span>
                    <Form onSubmit={handleSubmit}>
                        <Field
                            id="telephone"
                            label={formatMessage({
                                id: 'global.telephone',
                                defaultMessage: 'Phone number'
                            })}
                            optional={true}
                        >
                            <TextInput
                                id="telephone"
                                field="telephone"
                                autoComplete="Phone Number"
                                validate={combine([isRequired, isPhoneNumber])}
                                validateOnBlur
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                data-cy="customer-telephone"
                                aria-label={formatMessage({
                                    id: 'global.telephoneRequired',
                                    defaultMessage: 'Telephone Required'
                                })}
                                placeholder={formatMessage({
                                    id: 'global.telephone',
                                    defaultMessage: 'Phone number'
                                })}
                            />
                        </Field>
                        <Button priority={'high'} type={'submit'}>
                            <FormattedMessage
                                id={'global.update'}
                                defaultMessage={'Update'}
                            />
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default UpdatePhoneNumber
