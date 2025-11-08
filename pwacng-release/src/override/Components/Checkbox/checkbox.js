import React, { Fragment, useEffect } from 'react';
import { node, shape, string } from 'prop-types';
import { Checkbox as InformedCheckbox, useFieldApi } from 'informed';
import useFieldState from '@magento/peregrine/lib/hooks/hook-wrappers/useInformedFieldStateWrapper';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { Message } from '@magento/venia-ui/lib/components/Field';
import { CheckSquare, Square } from '@magenest/theme/static/icons';
import defaultClasses from '@magento/venia-ui/lib/components/Checkbox/checkbox.module.css';
import checkBoxCustomClasses from '@magenest/theme/BaseComponents/Checkbox/extendStyle/checkbox.module.scss';

/* TODO: change lint config to use `label-has-associated-control` */
/* eslint-disable jsx-a11y/label-has-for */

const Checkbox = props => {
    const {
        ariaLabel,
        classes: propClasses,
        field,
        fieldValue,
        id,
        label,
        message,
        ...rest
    } = props;
    const fieldApi = useFieldApi(field);
    const fieldState = useFieldState(field);
    const classes = useStyle(defaultClasses, checkBoxCustomClasses, propClasses);
    const icon = fieldState.value ? CheckSquare : Square;

    useEffect(() => {
        if (fieldValue != null && fieldValue !== fieldState.value) {
            fieldApi.setValue(fieldValue);
        }
    }, [fieldApi, fieldState.value, fieldValue]);

    return (
        <Fragment>
            <label
                data-cy="Checkbox-label"
                aria-label={ariaLabel}
                className={classes.root}
                htmlFor={id}
            >
                <InformedCheckbox
                    {...rest}
                    className={classes.input}
                    field={field}
                    id={id}
                />
                <span className={classes.icon}>
                    <img src={icon} alt={field} />
                </span>
                <span className={classes.label}>{label}</span>
            </label>
            <Message fieldState={fieldState}>{message}</Message>
        </Fragment>
    );
};

export default Checkbox;

Checkbox.propTypes = {
    ariaLabel: string,
    classes: shape({
        icon: string,
        input: string,
        label: string,
        message: string,
        root: string
    }),
    field: string.isRequired,
    id: string,
    label: node.isRequired,
    message: node
};

/* eslint-enable jsx-a11y/label-has-for */
