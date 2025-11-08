import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/ForgotPassword/FormSubmissionSuccessful/formSubmissionSuccessful.module.css';
import formSubmissionSuccessfulClasses from '@magenest/theme/BaseComponents/ForgotPassword/formSubmissionSuccessful.module.scss';
import Modal from "../../../../@theme/BaseComponents/Modal";

const FormSubmissionSuccessful = props => {
    const { email, isOpen, handleClose } = props;
    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, formSubmissionSuccessfulClasses, props.classes);

    const textMessage = formatMessage(
        {
            id: 'formSubmissionSuccessful.textMessage',
            defaultMessage:
                'If there is an account associated with {email} you will receive an email with a link to change your password.'
        },
        { email }
    );

    return (
        <Modal
            title={formatMessage({
                id: 'global.notification',
                defaultMessage: 'Notification'
            })}
            isOpen={isOpen}
            handleClose={handleClose}
            classes={classes}
        >
            <p className={classes.text} data-cy="formSubmissionSuccessful-text">
                {textMessage}
            </p>
        </Modal>
    );
};

export default FormSubmissionSuccessful;

FormSubmissionSuccessful.propTypes = {
    classes: shape({
        root: string,
        text: string
    }),
    email: string
};
