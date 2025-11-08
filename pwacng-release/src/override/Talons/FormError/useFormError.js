import { useMemo } from 'react';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { useIntl } from 'react-intl';

export const useFormError = props => {
    const { errors, allowErrorMessages } = props;
    const { formatMessage } = useIntl();

    const derivedErrorMessage = useMemo(() => {
        const defaultErrorMessage = allowErrorMessages
            ? ''
            : formatMessage({
                id: 'formError.errorMessage',
                defaultMessage:
                    'An error has occurred. Please check the input and try again.'
            });
        return deriveErrorMessage(errors);
    }, [errors, formatMessage, allowErrorMessages]);

    return {
        errorMessage: derivedErrorMessage
    };
};
