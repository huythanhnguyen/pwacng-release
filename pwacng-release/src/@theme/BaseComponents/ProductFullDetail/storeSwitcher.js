import React, {useCallback, useState} from 'react';
import { shape, string } from 'prop-types';

import { useStoreSwitcher } from '@magenest/theme/Talons/StoreSwitcher/useStoreSwitcher.js';
import { availableRoutes } from '@magento/venia-ui/lib/components/Routes/routes';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Header/storeSwitcher.module.css';
import customClasses from './storeSwitcher.module.scss';
import SwitcherItem from './switcherItem';
import Shimmer from '@magento/venia-ui/lib/components/Header/storeSwitcher.shimmer';
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import {FormattedMessage, useIntl} from "react-intl";

const StoreSwitcher = props => {
    const {
        availableStores,
        currentGroupName,
        currentStoreCode,
        currentStoreName,
        currentLanguage,
        handleSwitchStore,
        storeGroups,
        storeMenuRef,
        storeMenuTriggerRef,
        storeMenuIsOpen,
        handleTriggerClick
    } = useStoreSwitcher({ availableRoutes });

    const classes = useStyle(defaultClasses, props.classes, customClasses);
    const { formatMessage } = useIntl();

    const [storeCodeSelected, setStoreCodeSelected] = useState(currentStoreCode);

    const handleOpenDialog = useCallback(() => {
        setStoreCodeSelected(currentStoreCode)
        handleTriggerClick();
    }, [currentStoreCode]);

    if (!availableStores) return <Shimmer />;

    if (availableStores.size <= 1) return null;

    const groups = [];
    const hasOnlyOneGroup = storeGroups.size === 1;

    storeGroups.forEach((group, key) => {
        const stores = [];
        group.forEach(({ storeGroupName, storeName, isCurrent, storeCode }) => {
            if (storeCode.slice(-2) === currentLanguage.code) {
                stores.push(
                    <li
                        aria-label={storeName}
                        aria-selected={currentStoreName}
                        role="option"
                        key={storeCode}
                        className={[
                            classes.menuItem,
                            storeCodeSelected === storeCode && classes.menuItemActive,
                            currentStoreCode === storeCode && classes.menuItemCurrent
                        ].filter(Boolean).join(' ')}
                        data-cy="StoreSwitcher-view"
                    >
                        <SwitcherItem
                            active={isCurrent}
                            onClick={setStoreCodeSelected}
                            option={storeCode}
                            classes={classes}
                        >
                            <span className={classes.text}>{storeGroupName}</span>
                        </SwitcherItem>
                    </li>
                );
            }
        });

        groups.push(...stores);
    });

    return (
        <div className={classes.root} data-cy="StoreSwitcher-root">
            <div className={classes.storeSwitcherTrigger}>
                <FormattedMessage
                    id={'global.priceAt'}
                    defaultMessage={'Price at'}
                />
                <button
                    data-cy="StoreSwitcher-triggerButton"
                    className={classes.trigger}
                    aria-label={currentStoreName}
                    onClick={handleOpenDialog}
                    ref={storeMenuTriggerRef}
                    aria-expanded={storeMenuIsOpen}
                >
                    <span>{currentGroupName}</span>
                </button>
            </div>
            <Dialog
                isOpen={storeMenuIsOpen}
                onCancel={handleTriggerClick}
                shouldShowButtons={false}
                setScrollLock={false}
                zIndex={true}
                title={formatMessage({
                    id: 'global.selectStore',
                    defaultMessage: 'Select store'
                })}
                classes={classes}
                customClass={classes.storeSwitcherDialog}
            >
                <div
                    ref={storeMenuRef}
                    className={classes.storeList}
                    data-cy="StoreSwitcher-menu"
                >
                    <div className={classes.groups}>
                        <ul className={classes.groupList}>
                            {groups}
                        </ul>
                    </div>
                    <button
                        className={classes.submit}
                        onClick={() => handleSwitchStore(storeCodeSelected)}
                        disabled={storeCodeSelected === currentStoreCode}
                    >
                        <FormattedMessage
                            id={'global.choose'}
                            defaultMessage={'Submit'}
                        />
                    </button>
                </div>
            </Dialog>
        </div>
    );
};

export default StoreSwitcher;

StoreSwitcher.propTypes = {
    classes: shape({
        groupList: string,
        groups: string,
        menu: string,
        menu_open: string,
        menuItem: string,
        root: string,
        trigger: string
    })
};
