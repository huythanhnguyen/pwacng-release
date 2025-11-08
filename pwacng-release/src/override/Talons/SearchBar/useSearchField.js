import { useCallback, useEffect, useRef } from 'react';
import { useFormApi } from 'informed';
import useFieldState from '@magento/peregrine/lib/hooks/hook-wrappers/useInformedFieldStateWrapper';

import { getSearchParam } from '@magento/peregrine/lib/hooks/useSearchParam';

/**
 * Returns props necessary to render a SearchField component.
 */
export const useSearchField = props => {
    const { isSearchOpen } = props;

    const { value } = useFieldState('search_query');
    const formApi = useFormApi();

    const resetForm = useCallback(() => {
        formApi.reset();
    }, [formApi]);

    // Pre-populate the search field with the search term from the URL.
    // We purposefully only ever run this effect on initial mount.
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const urlTerm = getSearchParam('query', location);

        if (!formApi || !urlTerm) {
            return;
        }

        formApi.setValue('search_query', urlTerm);
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    return {
        resetForm,
        value
    };
};
