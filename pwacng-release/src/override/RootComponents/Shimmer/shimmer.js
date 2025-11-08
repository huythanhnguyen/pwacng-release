import React, {Fragment} from 'react';
import { string } from 'prop-types';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import TYPES from '@magento/venia-ui/lib/RootComponents/Shimmer/types';
import Shimmer from "@magento/venia-ui/lib/components/Shimmer";

const RootShimmer = props => {
    const { type } = props;

    if (!type || typeof TYPES[type] === 'undefined') {
        return <div style={{height: 'calc(100vh - 156px)'}}></div>;
    }

    const Component = TYPES[type];

    return <Component />;
};

RootShimmer.defaultProps = {
    type: null
};

RootShimmer.propTypes = {
    type: string
};

export default RootShimmer;
