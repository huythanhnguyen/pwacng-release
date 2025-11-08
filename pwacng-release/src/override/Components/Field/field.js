import React from 'react';
import { FormattedMessage } from 'react-intl';
import { bool, node, shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Field/field.module.css';
import fieldClasses from '@magenest/theme/BaseComponents/Field/extendStyle/field.module.scss';

const Field = props => {
    const { children, id, label, optional } = props;
    const classes = useStyle(defaultClasses, fieldClasses, props.classes);
    const optionalSymbol = optional ? (
        <span className={classes.optional}>
            <FormattedMessage
                id={'field.optional'}
                defaultMessage={'Optional'}
            />
        </span>
    ) : null;

    return (
        <div className={classes.root}>
            {
                label && (
                    <label className={classes.label} htmlFor={id}>
                        {label}
                        {optionalSymbol}
                    </label>
                )
            }
            {children}
        </div>
    );
};

Field.propTypes = {
    children: node,
    classes: shape({
        label: string,
        root: string
    }),
    id: string,
    label: node,
    optional: bool
};

export default Field;
