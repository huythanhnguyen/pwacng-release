import React from 'react';
import { string, bool, shape, func } from 'prop-types';
import { EyeOff, Eye } from '@magenest/theme/static/icons';
import { useIntl } from 'react-intl';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { usePassword } from '@magento/peregrine/lib/talons/Password/usePassword';

import Button from '@magento/venia-ui/lib/components/Button';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '../TextInput/textInput';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

import defaultClasses from '@magento/venia-ui/lib/components/Password/password.module.css';
import passwordCustomClasses from '@magenest/theme/BaseComponents/Password/extendStyle/password.module.scss';

const Password = props => {
    const {
        classes: propClasses,
        label,
        fieldName,
        isToggleButtonHidden,
        autoComplete,
        validate,
        optional,
        ...otherProps
    } = props;

    const talonProps = usePassword();
    const { handleBlur, togglePasswordVisibility, visible } = talonProps;
    const classes = useStyle(defaultClasses, passwordCustomClasses, propClasses);

    const handleKeypress = e => {
        if (e.code == 'Enter') {
            togglePasswordVisibility;
        }
    };
    const { formatMessage } = useIntl();
    const hidePassword = formatMessage({
        id: 'password.hide',
        defaultMessage: 'Hide Password'
    });
    const viewPassword = formatMessage({
        id: 'password.view',
        defaultMessage: 'View Password'
    });
    const speak = visible ? hidePassword : viewPassword;

    const passwordButton = (
        <Button
            className={classes.passwordButton}
            onClick={togglePasswordVisibility}
            onKeyDown={handleKeypress}
            type="button"
        >
            {visible ? (
                <img src={Eye} alt={speak} />
            ) : (
                <img src={EyeOff} alt={speak} />
            )}
        </Button>
    );

    const fieldType = visible ? 'text' : 'password';

    return (
        <Field
            id="Password"
            label={label}
            classes={{ root: classes.root }}
            optional={optional}
        >
            <TextInput
                after={!isToggleButtonHidden && passwordButton}
                autoComplete={autoComplete}
                field={fieldName}
                type={fieldType}
                validate={validate}
                onBlur={handleBlur}
                classes={classes}
                {...otherProps}
            />
        </Field>
    );
};

Password.propTypes = {
    autoComplete: string,
    classes: shape({
        root: string
    }),
    label: string,
    fieldName: string,
    isToggleButtonHidden: bool,
    validate: func
};

Password.defaultProps = {
    isToggleButtonHidden: true,
    validate: isRequired
};

export default Password;
