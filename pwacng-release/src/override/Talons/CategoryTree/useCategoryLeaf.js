import { useCallback } from 'react';

/**
 * Returns props necessary to render a CategoryLeaf component.
 *
 * @param {object} props
 * @param {function} props.onNavigate - callback to fire on link click
 * @return {{ handleClick: function }}
 */
export const useCategoryLeaf = props => {
    const { onNavigate, onBack } = props;

    const handleClick = useCallback(() => {
        onNavigate();
    }, [onNavigate]);

    const handleBack = useCallback(() => {
        onBack();
    }, [onBack]);

    return {
        handleClick,
        handleBack
    };
};
