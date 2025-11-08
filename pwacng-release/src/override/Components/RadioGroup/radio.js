import React from 'react';
import { Circle } from 'react-feather';
import { node, shape, string } from 'prop-types';
import { Radio as InformedRadio } from 'informed';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/RadioGroup/radio.module.css';
import RadioClasses from '@magenest/theme/BaseComponents/RadioGroup/extendStyle/radio.module.scss'

/* TODO: change lint config to use `label-has-associated-control` */
/* eslint-disable jsx-a11y/label-has-for */

const RadioOption = props => {
    const {
        ariaLabel,
        classes: propClasses,
        id,
        label,
        value,
        image,
        note,
        ...rest
    } = props;
    const classes = useStyle(defaultClasses, RadioClasses, propClasses);

    return (
        <label
            className={classes.root}
            htmlFor={id}
            aria-label={ariaLabel ? ariaLabel : ''}
        >
            <p className={classes.wrapper}>
                <InformedRadio
                    {...rest}
                    className={classes.input}
                    id={id}
                    value={value}
                />
                <span className={classes.icon}>
                <Circle />
            </span>
                {
                    image && (
                        <img src={image} alt={value} />
                    )
                }
                <span className={classes.label}>
                {label || (value != null ? value : '')}
            </span>
            </p>
            {
                note && (
                    <span className={classes.note}>{note}</span>
                )
            }
        </label>
    );
};

export default RadioOption;

RadioOption.propTypes = {
    ariaLabel: string,
    classes: shape({
        icon: string,
        input: string,
        label: string,
        root: string
    }),
    id: string.isRequired,
    label: node.isRequired,
    value: node.isRequired
};

/* eslint-enable jsx-a11y/label-has-for */
