import { useCallback, useRef, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './contactForm.gql';
import {useToasts} from "@magento/peregrine";

export const useContactForm = props => {
    const { operations } = props;
    const {
        getContactFormQuery,
        submitContactFormMutation
    } = mergeOperations(DEFAULT_OPERATIONS, operations);

    const formApiRef = useRef(null);
    const [, { addToast }] = useToasts();

    const [
        submitForm,
        { data, error: contactError, loading: submitLoading }
    ] = useMutation(submitContactFormMutation, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {}
    });

    const { data: storeConfigData, loading: configLoading } = useQuery(
        getContactFormQuery,
        {
            fetchPolicy: 'cache-and-network'
        }
    );
    const contactFields = useMemo(() => {
        return storeConfigData?.contactForm || [];
    }, [storeConfigData]);

    const setFormApi = useCallback(api => (formApiRef.current = api), []);
    const handleSubmit = useCallback(async (formValues) => {
            try {
                const formattedValues = Object.entries(formValues).map(([key, value]) => ({
                    field_name: key,
                    value: value
                }));

                const submitResult = await submitForm({
                    variables: {
                        input: formattedValues
                    }
                });
                const successMessage = submitResult?.data?.contactSubmit?.message || formatMessage({
                    id: 'global.submitContactSuccess',
                    defaultMessage: 'Thank you for contacting us with your comments and questions. We will respond to you promptly.'
                });
                addToast({
                    type: 'success',
                    message: successMessage,
                    timeout: 5000
                });
                if (formApiRef.current) {
                    formApiRef.current.reset();
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
            }
        },
        [submitForm]
    );
    const errors = useMemo(() => new Map([['submitContactFormMutation', contactError]]), [
        contactError
    ]);

    return {
        contactFields,
        errors,
        handleSubmit,
        isBusy: submitLoading,
        isLoading: configLoading,
        setFormApi,
        response: data
    };
};
