import React from 'react';
import {useWindowSize} from '@magento/peregrine';

const useMediaCheck = () => {
    const windowSize = useWindowSize();

    const isMobile = windowSize.innerWidth < 769;
    const isTablet = windowSize.innerWidth < 1024 && windowSize.innerWidth >= 769
    const isDesktop = windowSize.innerWidth >= 1024;

    return {
        isMobile,
        isDesktop,
        isTablet
    }
}

export default useMediaCheck
