import React from 'react';
import {FormattedMessage} from 'react-intl';
import { shape, string, bool, array, func, object } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import EditForm from './editForm';
import FormError from '@magento/venia-ui/lib/components/FormError';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha';
import defaultClasses from '@magenest/theme/BaseComponents/AccountInformationPage/extendStyle/editModal.module.scss';
import {Form} from "informed";
import Button from "@magento/venia-ui/lib/components/Button";

const EditModal = props => {
    const {
        classes: propClasses,
        formErrors,
        onCancel,
        onChangePassword,
        onChangeVat,
        onSubmit,
        initialValues,
        isDisabled,
        shouldShowNewPassword,
        shouldShowVat,
        recaptchaWidgetProps
    } = props;

    const classes = useStyle(defaultClasses, propClasses);

    const dialogFormProps = { initialValues };

    return (
        <div className={classes.root}>
            <Form
                className={classes.form}
                {...dialogFormProps}
                onSubmit={onSubmit}
                data-cy="Dialog-form"
            >
                <div className={classes.contents}>
                    <FormError
                        classes={{ root: classes.errorContainer }}
                        errors={formErrors}
                    />
                    <EditForm
                        handleChangePassword={onChangePassword}
                        handleChangeVat={onChangeVat}
                        shouldShowNewPassword={shouldShowNewPassword}
                        shouldShowVat={shouldShowVat}
                    />
                    <GoogleReCaptcha {...recaptchaWidgetProps} />
                </div>
                <div className={classes.buttons}>
                    <Button
                        data-cy="Dialog-cancelButton"
                        classes={{
                            root_normalPriority: classes.cancelButton
                        }}
                        disabled={isDisabled}
                        onClick={onCancel}
                        type="reset"
                    >
                        <FormattedMessage
                            id={'global.cancel'}
                            defaultMessage={'Cancel'}
                        />
                    </Button>
                    <Button
                        data-cy="Dialog-confirmButton"
                        classes={{
                            root_highPriority: classes.confirmButton
                        }}
                        disabled={isDisabled}
                        priority="high"
                        type="submit"
                    >
                        <FormattedMessage
                            id={'global.saveInformation'}
                            defaultMessage={'Save information'}
                        />
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default EditModal;

EditModal.propTypes = {
    classes: shape({
        errorContainer: string
    }),
    formErrors: array,
    handleCancel: func,
    handleSubmit: func,
    initialValues: object,
    isDisabled: bool,
    recaptchaWidgetProps: shape({
        containerElement: func,
        shouldRender: bool
    })
};
