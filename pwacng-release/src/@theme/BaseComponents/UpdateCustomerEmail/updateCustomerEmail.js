import React from "react";
import defaultClasses from './updateCustomerEmail.module.scss';
import {StoreTitle, Style} from "@magento/venia-ui/lib/components/Head";
import {FormattedMessage, useIntl} from "react-intl";
import {Form} from "informed";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "../../../override/Components/TextInput/textInput";
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isRequired} from "@magento/venia-ui/lib/util/formValidators";
import {isEmail} from "../../../override/Util/formValidators";
import Button from "../../../override/Components/Button/button";
import {useStyle} from "@magento/venia-ui/lib/classify";
import useUpdateEmail from "../../Talons/UpdateCustomerEmail/useUpdateCustomerEmail";

const UpdateCustomerEmail = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const talonProps = useUpdateEmail({});
    const {
        handleSubmit,
        loading
    } = talonProps;

    return (
        <div className={classes.root}>
            <Style>{'header.header-cls { display: none !important; }'}</Style>
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
                            id={'global.updateCustomerEmail'}
                            defaultMessage={'You need to update your Email{br} to continue shopping'}
                            values={{
                                br: <br />
                            }}
                        />
                    </span>
                    <Form onSubmit={handleSubmit}>
                        <Field
                            id="email"
                            optional={true}
                        >
                            <TextInput
                                id="email"
                                field="email"
                                autoComplete="Email"
                                validate={combine([isRequired, isEmail])}
                                validateOnBlur
                                mask={value => value && value.trim()}
                                maskOnBlur={true}
                                data-cy="email"
                                aria-label={formatMessage({
                                    id: 'global.emailRequired',
                                    defaultMessage: 'Email Required'
                                })}
                                placeholder={formatMessage({
                                    id: 'global.email',
                                    defaultMessage: 'Email'
                                })}
                            />
                        </Field>
                        <Button disabled={loading} priority={'high'} type={'submit'}>
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

export default UpdateCustomerEmail
