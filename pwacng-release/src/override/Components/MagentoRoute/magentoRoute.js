import React from 'react';
import { useIntl } from 'react-intl';
import { useMagentoRoute } from '@magento/peregrine/lib/talons/MagentoRoute';
import ErrorView from '@magento/venia-ui/lib/components/ErrorView';
import RootShimmerComponent from '@magento/venia-ui/lib/RootComponents/Shimmer';

const MESSAGES = new Map()
    .set(
        'NOT_FOUND',
        "Content not available"
    )
    .set('INTERNAL_ERROR', 'Content not available');

const MagentoRoute = () => {
    const { formatMessage } = useIntl();
    const talonProps = useMagentoRoute();
    const {
        component: RootComponent,
        isLoading,
        isNotFound,
        isRedirect,
        shimmer,
        initial,
        ...componentData
    } = talonProps;

    if (isLoading || isRedirect) {
        // Show root component shimmer
        if (shimmer) {
            return <RootShimmerComponent type={shimmer} />;
        }

        return initial ? null : <RootShimmerComponent />;
    } else if (RootComponent) {
        return <RootComponent {...componentData} />;
    } else if (isNotFound) {
        return (
            <ErrorView
                message={formatMessage({
                    id: 'magentoRoute.routeError',
                    defaultMessage: MESSAGES.get('NOT_FOUND')
                })}
            />
        );
    }

    return (
        <ErrorView
            message={formatMessage({
                id: 'magentoRoute.internalError',
                defaultMessage: MESSAGES.get('INTERNAL_ERROR')
            })}
        />
    );
};

export default MagentoRoute;
