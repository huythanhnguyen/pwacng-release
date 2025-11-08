import React from 'react';
import combine from "@magento/venia-ui/lib/util/combineValidators";
import {isRequired, isConfirmPassword} from "@magento/venia-ui/lib/util/formValidators";
import Password from "../../../../override/Components/Password/password";
import {useIntl} from "react-intl";

const ConfirmPassword = props => {

    const {
        password,
        optional,
        label
    } = props

    const { formatMessage } = useIntl();

    return (
        <Password
            id="Confirm_Password"
            fieldName="confirm_password"
            isToggleButtonHidden={false}
            label={label ? label : formatMessage({
                id: 'global.confirmPassword',
                defaultMessage: 'Confirm Password'
            })}
            validate={combine([
                isRequired,
                [isConfirmPassword, password]
            ])}
            validateOnBlur
            mask={value => value && value.trim()}
            maskOnBlur={true}
            data-cy="confirm password"
            aria-label={formatMessage({
                id: 'global.passwordRequired',
                defaultMessage: 'Password Required'
            })}
            optional={optional}
            placeholder={label ? label : formatMessage({
                id: 'global.confirmPassword',
                defaultMessage: 'Confirm Password'
            })}
        />
    )
}

export default ConfirmPassword
