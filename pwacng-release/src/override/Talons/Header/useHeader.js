import {useCallback, useEffect, useState} from 'react';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';

const DRAWER_NAME = 'megaMenu';

export const useHeader = () => {
    const [{ hasBeenOffline, isOnline, isPageLoading }] = useAppContext();
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const [ isHover, setIsHover ] = useState(false);

    const isOpen = drawer === DRAWER_NAME;
    const {
        elementRef: searchRef,
        expanded: isSearchOpen,
        setExpanded: setIsSearchOpen,
        triggerRef: searchTriggerRef
    } = useDropdown();

    const handleSearchTriggerClick = useCallback(() => {
        // Toggle the Search input form.
        setIsSearchOpen(isOpen => !isOpen);
    }, [setIsSearchOpen]);

    const handleMegaMenu = useCallback(() => {
        if (isOpen) {
            closeDrawer(DRAWER_NAME);
        } else {
            toggleDrawer(DRAWER_NAME);
        }
    }, [toggleDrawer, isOpen]);

    return {
        handleSearchTriggerClick,
        hasBeenOffline,
        isOnline,
        isPageLoading,
        isSearchOpen,
        searchRef,
        searchTriggerRef,
        handleMegaMenu,
        isOpen,
        isHover,
        setIsHover
    };
};
