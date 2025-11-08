import React, { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';

import { useGoogleReCaptcha } from '@magento/peregrine/lib/hooks/useGoogleReCaptcha';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from "@magento/venia-ui/lib/components/Icon";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
const DRAWER_NAME = 'forgotPassword'

/**
 * Returns props necessary to render a ForgotPassword form.
 *
 * @function
 *
 * @param {Function} props.onCancel - callback function to call when user clicks the cancel button
 * @param {RequestPasswordEmailMutations} props.mutations - GraphQL mutations for the forgot password form.
 *
 * @returns {ForgotPasswordProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useForgotPassword } from '@magento/peregrine/lib/talons/ForgotPassword/useForgotPassword.js';
 */
export const useForgotPassword = props => {
    const { onCancel, mutations } = props;
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;

    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(null);
    const [, { addToast }] = useToasts();
    const [
        requestResetEmail,
        { error: requestResetEmailError, loading: isResettingPassword }
    ] = useMutation(mutations.requestPasswordResetEmailMutation);

    const {
        recaptchaLoading,
        generateReCaptchaData,
        recaptchaWidgetProps
    } = useGoogleReCaptcha({
        currentForm: 'CUSTOMER_FORGOT_PASSWORD',
        formAction: 'forgotPassword'
    });

    const handleFormSubmit = useCallback(
        async ({ email }) => {
            try {
                const reCaptchaData = await generateReCaptchaData();

                await requestResetEmail({
                    variables: { email },
                    ...reCaptchaData
                });

                setForgotPasswordEmail(email);
                toggleDrawer(DRAWER_NAME);
            } catch (error) {
                // Error is logged by apollo link - no need to double log.
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: error.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        },
        [generateReCaptchaData, requestResetEmail]
    );

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    const handleClose = useCallback(() => {
        closeDrawer(DRAWER_NAME);
    }, [closeDrawer])

    return {
        forgotPasswordEmail,
        formErrors: [requestResetEmailError],
        handleCancel,
        handleFormSubmit,
        isResettingPassword: isResettingPassword || !!recaptchaLoading,
        recaptchaWidgetProps,
        isOpen,
        handleClose
    };
};

/** JSDocs type definitions */

/**
 * GraphQL mutations for the forgot password form.
 * This is a type used by the {@link useForgotPassword} talon.
 *
 * @typedef {Object} RequestPasswordEmailMutations
 *
 * @property {GraphQLAST} requestPasswordResetEmailMutation mutation for requesting password reset email
 *
 * @see [forgotPassword.gql.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/ForgotPassword/forgotPassword.gql.js}
 * for the query used in Venia
 */

/**
 * Object type returned by the {@link useForgotPassword} talon.
 * It provides props data to use when rendering the forgot password form component.
 *
 * @typedef {Object} ForgotPasswordProps
 *
 * @property {String} forgotPasswordEmail email address of the user whose password reset has been requested
 * @property {Array} formErrors A list of form errors
 * @property {Function} handleCancel Callback function to handle form cancellations
 * @property {Function} handleFormSubmit Callback function to handle form submission
 * @property {Boolean} hasCompleted True if password reset mutation has completed. False otherwise
 * @property {Boolean} isResettingPassword True if form awaits events. False otherwise
 * @property {Object} recaptchaWidgetProps Props for the GoogleReCaptcha component
 */
