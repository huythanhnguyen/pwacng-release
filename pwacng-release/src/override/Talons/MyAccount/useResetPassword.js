import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {useMutation, useQuery} from '@apollo/client';
import { GET_STORE_CONFIG_DATA } from '../CreateAccount/createAccount.gql';
import { useGoogleReCaptcha } from '@magento/peregrine/lib/hooks/useGoogleReCaptcha';
import {useAppContext} from "@magento/peregrine/lib/context/app";
const DRAWER_NAME = 'resetPasswordSuccess';
/**
 * Returns props necessary to render a ResetPassword form.
 *
 * @param {function} props.mutations - mutation to call when the user submits the new password.
 *
 * @returns {ResetPasswordProps} - GraphQL mutations for the reset password form.
 *
 * @example <caption>Importing into your project</caption>
 * import { useResetPassword } from '@magento/peregrine/lib/talons/MyAccount/useResetPassword.js';
 */
export const useResetPassword = props => {
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;
    const { mutations } = props;

    const [hasCompleted, setHasCompleted] = useState(false);
    const location = useLocation();
    const [
        resetPassword,
        { error: resetPasswordErrors, loading }
    ] = useMutation(mutations.resetPasswordMutation);

    const { data: storeConfigData } = useQuery(GET_STORE_CONFIG_DATA, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const {
        recaptchaLoading,
        generateReCaptchaData,
        recaptchaWidgetProps
    } = useGoogleReCaptcha({
        currentForm: 'CUSTOMER_FORGOT_PASSWORD',
        formAction: 'resetPassword'
    });

    const {
        minimumPasswordLength
    } = useMemo(() => {
        const storeConfig = storeConfigData?.storeConfig || {};

        return {
            minimumPasswordLength: storeConfig.minimum_password_length
        };
    }, [storeConfigData]);

    const searchParams = useMemo(() => new URLSearchParams(location.search), [
        location
    ]);
    const token = searchParams.get('token');

    const handleSubmit = useCallback(
        async ({ email, newPassword }) => {
            try {
                if (email && token && newPassword) {
                    const reCaptchaData = await generateReCaptchaData();

                    await resetPassword({
                        variables: { email, token, newPassword },
                        ...reCaptchaData
                    });

                    setHasCompleted(true);
                    toggleDrawer(DRAWER_NAME);
                }
            } catch (err) {
                // Error is logged by apollo link - no need to double log.
                console.error(err)
                setHasCompleted(false);
            }
        },
        [generateReCaptchaData, resetPassword, token]
    );

    const handleClose = useCallback(() => {
        closeDrawer(DRAWER_NAME);
    }, [closeDrawer])

    return {
        errors: resetPasswordErrors,
        handleSubmit,
        hasCompleted,
        loading: loading || recaptchaLoading,
        token,
        recaptchaWidgetProps,
        isOpen,
        handleClose,
        minimumPasswordLength
    };
};

/** JSDocs type definitions */

/**
 * GraphQL mutations for the reset password form.
 * This is a type used by the {@link useResetPassword} talon.
 *
 * @typedef {Object} ResetPasswordMutations
 *
 * @property {GraphQLAST} resetPasswordMutation mutation for resetting password
 *
 * @see [resetPassword.gql.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/MyAccount/ResetPassword/resetPassword.gql.js}
 * for the query used in Venia
 */

/**
 * Object type returned by the {@link useResetPassword} talon.
 * It provides props data to use when rendering the reset password form component.
 *
 * @typedef {Object} ResetPasswordProps
 *
 * @property {Array} formErrors A list of form errors
 * @property {Function} handleSubmit Callback function to handle form submission
 * @property {Boolean} hasCompleted True if password reset mutation has completed. False otherwise
 * @property {Boolean} loading True if form awaits events. False otherwise
 * @property {String} token token needed for password reset, will be sent in the mutation
 * @property {Object} recaptchaWidgetProps Props for the GoogleReCaptcha component
 */
