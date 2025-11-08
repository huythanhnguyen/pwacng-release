import { useCallback } from 'react';

import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import {useAppContext} from "@magento/peregrine/lib/context/app";
/**
 * The useAccountTrigger talon complements the AccountTrigger component.
 *
 * @returns {Object}    talonProps
 * @returns {Boolean}   talonProps.accountMenuIsOpen - Whether the menu that this trigger toggles is open or not.
 * @returns {Function}  talonProps.setAccountMenuIsOpen  - Set the value of accoutMenuIsOpen.
 * @returns {Ref}       talonProps.accountMenuRef - A React ref to the menu that this trigger toggles.
 * @returns {Ref}       talonProps.accountMenuTriggerRef - A React ref to the trigger element itself.
 * @returns {Function}  talonProps.handleTriggerClick - A function for handling when the trigger is clicked.
 */

const DRAWER_NAME = 'ACCOUNT_MENU'
export const useAccountTrigger = () => {
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();
    const isOpen = drawer === DRAWER_NAME;

    const handleTriggerClick = useCallback(() => {
        toggleDrawer(DRAWER_NAME);
    }, [toggleDrawer]);

    const handleClose = useCallback(() => {
        closeDrawer(DRAWER_NAME);
    }, [closeDrawer])

    const [{ isSignedIn: isUserSignedIn }] = useUserContext();

    return {
        handleTriggerClick,
        isUserSignedIn,
        isOpen,
        handleClose
    };
};
