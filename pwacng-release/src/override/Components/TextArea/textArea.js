import React, { Fragment } from 'react';
import { number, node, oneOf, oneOfType, shape, string } from 'prop-types';
import { TextArea as InformedTextArea } from 'informed';
import useFieldState from '@magento/peregrine/lib/hooks/hook-wrappers/useInformedFieldStateWrapper';

import { useStyle } from '@magento/venia-ui/lib/classify';
import { Message } from '@magento/venia-ui/lib/components/Field';
import defaultClasses from '@magento/venia-ui/lib/components/TextArea/textArea.module.css';
import textAreaInputCustomClasses from '@magenest/theme/BaseComponents/TextArea/extendStyle/textArea.module.scss';

const TextArea = props => {
    const { classes: propClasses, field, message, ...rest } = props;
    const fieldState = useFieldState(field);
    const classes = useStyle(defaultClasses, textAreaInputCustomClasses, propClasses);
    const inputClass =
        fieldState.error ? classes.input_error : classes.input;

    return (
        <Fragment>
            <InformedTextArea
                {...rest}
                className={inputClass}
                field={field}
            />
            <Message fieldState={fieldState}>{message}</Message>
        </Fragment>
    );
};

export default TextArea;

TextArea.defaultProps = {
    cols: 40,
    rows: 4,
    wrap: 'hard'
};

TextArea.propTypes = {
    classes: shape({
        input: string
    }),
    cols: oneOfType([number, string]),
    field: string.isRequired,
    message: node,
    rows: oneOfType([number, string]),
    wrap: oneOf(['hard', 'soft'])
};
