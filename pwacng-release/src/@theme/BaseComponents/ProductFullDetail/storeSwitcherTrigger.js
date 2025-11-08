import React, {useCallback} from 'react';
import { shape, string } from 'prop-types';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Header/storeSwitcher.module.css';
import customClasses from './storeSwitcher.module.scss';
import {FormattedMessage} from "react-intl";
import {useAppContext} from "@magento/peregrine/lib/context/app";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";

const DRAWER_NAME = 'storeSwitcher';

const StoreSwitcherTrigger = props => {
    const {
        onClick = () => {}
    } = props;
    const classes = useStyle(defaultClasses, props.classes, customClasses);
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();

    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeInformation = store && store.storeInformation;

    const handleTriggerClick = useCallback(() => {
        onClick();
        toggleDrawer(DRAWER_NAME);
    }, [toggleDrawer]);

    return (
        <div className={classes.root} data-cy="StoreSwitcherTrigger-root">
            <div className={classes.storeSwitcherTrigger}>
                <FormattedMessage
                    id={'global.priceAt'}
                    defaultMessage={'Price at'}
                />
                <button
                    data-cy="StoreSwitcher-triggerButton"
                    className={classes.trigger}
                    aria-label={storeInformation ? storeInformation.name : 'MM Mega Market'}
                    onClick={handleTriggerClick}
                >
                    <span>
                        {storeInformation ? storeInformation.name : 'MM Mega Market'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default StoreSwitcherTrigger;

StoreSwitcherTrigger.propTypes = {
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
