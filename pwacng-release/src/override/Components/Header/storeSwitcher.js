import React, { useRef, useEffect } from 'react';
import { shape, string } from 'prop-types';

import { useStoreSwitcher } from '../../Talons/Header/useStoreSwitcher';
import { availableRoutes } from '@magento/venia-ui/lib/components/Routes/routes';
import { ChevronDown } from 'react-feather';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Header/storeSwitcher.module.css';
import storeSwitcherCustomClasses from '@magenest/theme/BaseComponents/Header/extendStyle/storeSwitcher.module.scss';

import { Locator } from '@magenest/theme/static/icons'
import Icon from "@magento/venia-ui/lib/components/Icon";
import {FormattedMessage} from "react-intl";
import StoreLocation from "../../../@theme/BaseComponents/Header/components/StoreSwitcher/StoreLocation/storeLocation";
import StoreCurrent from "../../../@theme/BaseComponents/Header/components/StoreSwitcher/StoreCurrent/storeCurrent";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import Modal from "../../../@theme/BaseComponents/Modal";

const StoreSwitcher = props => {
    const {
        customerAddress,
        isOpen,
        handleTriggerClick,
        handleClose
    } = useStoreSwitcher({ availableRoutes });

    const { isDesktop } = useMediaCheck();
    const classes = useStyle(defaultClasses, storeSwitcherCustomClasses, props.classes);
    const menuClassName = isOpen ? classes.menu_open : classes.menu;
    const rootRef = useRef(null);

    // Handle click outside to close the store switcher
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target) && isOpen && isDesktop) {
                handleClose();
            }
        };

        if (isOpen && isDesktop) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, handleClose, isDesktop]);

    return (
        <div className={classes.root} data-cy="StoreSwitcher-root" ref={rootRef}>
            <button
                data-cy="StoreSwitcher-triggerButton"
                className={classes.trigger}
                aria-label={customerAddress && customerAddress}
                onClick={handleTriggerClick}
            >
                {/*<img src={Locator} alt="Locator" />*/}
                <span className={classes.customerAddress}>
                    {
                        isDesktop ? (
                            <span className={classes.label}>
                                <FormattedMessage
                                    id={'storeSwitcher.label'}
                                    defaultMessage={'Where is your address?'}
                                />
                            </span>
                        ) : (
                            <FormattedMessage
                                id={'storeSwitcher.deliveryTo'}
                                defaultMessage={'Delivery to: '}
                            />
                        )
                    }
                    <span className={classes.address}>{customerAddress && customerAddress}</span>
                </span>
                <Icon src={ChevronDown} size={18} />
            </button>
            {
                isDesktop ? (
                    <div
                        className={menuClassName}
                        data-cy="StoreSwitcher-menu"
                    >
                        <div className={classes.storeSwitcherHead}>
                            <strong className={classes.title}>
                                <FormattedMessage
                                    id={'storeSwitcherModal.title'}
                                    defaultMessage={'Welcome to MM VietNam'}
                                />
                            </strong>
                            <p className={classes.description}>
                                <FormattedMessage
                                    id={'storeSwitcherModal.description'}
                                    defaultMessage={'Please select your desired delivery area so we can serve you better'}
                                />
                            </p>
                        </div>
                        <div className={classes.wrapper}>
                            <StoreLocation
                                classes={classes}
                                customerAddress={customerAddress}
                            />
                        </div>
                        <div className={classes.wrapper}>
                            <StoreCurrent
                                classes={classes}
                            />
                        </div>
                    </div>
                ) : (
                    <Modal
                        isOpen={isOpen}
                        handleClose={handleClose}
                        classes={classes}
                    >
                        <strong className={classes.title}>
                            <FormattedMessage
                                id={'storeSwitcherModal.title'}
                                defaultMessage={'Welcome to MM VietNam'}
                            />
                        </strong>
                        <p className={classes.description}>
                            <FormattedMessage
                                id={'storeSwitcherModal.description'}
                                defaultMessage={'Please select your desired delivery area so we can serve you better'}
                            />
                        </p>
                        <div className={classes.wrapper}>
                            <StoreLocation
                                classes={classes}
                                customerAddress={customerAddress}
                            />
                        </div>
                        <div className={classes.wrapper}>
                            <StoreCurrent
                                classes={classes}
                            />
                        </div>
                    </Modal>
                )
            }
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
