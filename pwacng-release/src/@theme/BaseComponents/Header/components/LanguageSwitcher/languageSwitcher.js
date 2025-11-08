import React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './languageSwitcher.module.scss';
import Icon from "@magento/venia-ui/lib/components/Icon";
import useLanguageSwitcher from "../../../../Talons/Header/useLanguageSwitcher";
import SwitcherItem from "./SwitcherItem/switcherItem";
import { availableRoutes } from '@magento/venia-ui/lib/components/Routes/routes';
import useMediaCheck from "../../../../Hooks/MediaCheck/useMediaCheck";
import {FormattedMessage} from "react-intl";

const LanguageSwitcher = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const talonProps = useLanguageSwitcher({
        availableRoutes
    });
    const { isDesktop } = useMediaCheck();

    const {
        availableLanguages,
        handleSwitcherLanguage,
        handleTriggerClick,
        currentLanguage,
        isOpen
    } = talonProps;

    const menuClassName = isOpen ? classes.menu_open : classes.menu;

    const languages =  availableLanguages.map(code => (
        <li
            className={classes.menuItem}
            key={code.code}
        >
            <SwitcherItem
                onClick={handleSwitcherLanguage}
                option={code}
                classes={classes}
            />
        </li>
    ));

    return (
        <div className={classes.root}>
            <button
                className={classes.trigger}
                onClick={isDesktop ? handleTriggerClick : null}
                type={'button'}
            >
                {
                    isDesktop ? (
                        <>
                            <span className={`${classes.currentLanguage} ${currentLanguage?.code || ''}`}></span>
                            <Icon src={ChevronDown} size={16} />
                        </>
                    ) : (
                        <>
                            <FormattedMessage
                                id={'global.language'}
                                defaultMessage={'Language'}
                            />
                        </>
                    )
                }
            </button>
            {
                !isDesktop && (
                    <>
                        <span className={`${classes.label} ${currentLanguage?.code || ''}`} onClick={handleTriggerClick}>
                            {
                                availableLanguages.find(language => language.code === currentLanguage?.code)?.label
                            }
                            <Icon src={ChevronDown} size={16} />
                        </span>
                    </>
                )
            }
            <div className={menuClassName}>
                <ul>
                    {languages}
                </ul>
            </div>
        </div>
    )
}

export default LanguageSwitcher
