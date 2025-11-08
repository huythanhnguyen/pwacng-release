import React from 'react';
import { shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Field/fieldIcons.module.css';
import fieldIconsCustomClasses from '@magenest/theme/BaseComponents/Field/extendStyle/fieldIcons.module.scss';

const FieldIcons = props => {
    const { after, before, children } = props;

    const classes = useStyle(defaultClasses, fieldIconsCustomClasses, props.classes);
    const inputClasses = props.classes ? classes.inputWrapper : classes.input;

    const style = {
        '--iconsBefore': before ? 1 : 0,
        '--iconsAfter': after ? 1 : 0
    };

    return (
        <span className={classes.root} style={style}>
            <span className={inputClasses}>{children}</span>
            <span className={classes.before}>{before}</span>
            <span className={classes.after} aria-hidden="false">
                {after}
            </span>
        </span>
    );
};

FieldIcons.propTypes = {
    classes: shape({
        after: string,
        before: string,
        root: string
    })
};

export default FieldIcons;
