import React, { useEffect, useRef, useState } from 'react';

import { useIsInViewport } from '@magento/peregrine/lib/hooks/useIsInViewport';
import { useMegaMenu } from '@magento/peregrine/lib/talons/MegaMenu/useMegaMenu';
import { useStyle } from '@magento/venia-ui/lib/classify';

import MegaMenuItem from './megaMenuItem';
import defaultClasses from '@magento/venia-ui/lib/components/MegaMenu/megaMenu.module.css';
import megaMenuCustomClasses from '@magenest/theme/BaseComponents/MegaMenu/extendStyle/megaMenu.module.scss';

/**
 * The MegaMenu component displays menu with categories on desktop devices
 */
const MegaMenu = props => {
    const mainNavRef = useRef(null);

    const {
        megaMenuData,
        activeCategoryId,
        subMenuState,
        disableFocus,
        handleSubMenuFocus,
        categoryUrlSuffix,
        handleNavigate,
        handleClickOutside
    } = useMegaMenu({ mainNavRef });

    const {
        isOpen
    } = props;

    const classes = useStyle(defaultClasses, megaMenuCustomClasses, props.classes);

    const megaMenuClasses = isOpen ? classes.megaMenuActive : classes.megaMenu;

    const [mainNavWidth, setMainNavWidth] = useState(0);
    const shouldRenderItems = useIsInViewport({
        elementRef: mainNavRef
    });

    useEffect(() => {
        const handleResize = () => {
            const navWidth = mainNavRef.current
                ? mainNavRef.current.offsetWidth
                : null;

            setMainNavWidth(navWidth);
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    const items = megaMenuData.children
        ? megaMenuData.children.map(category => {
            return (
                <MegaMenuItem
                    category={category}
                    activeCategoryId={activeCategoryId}
                    categoryUrlSuffix={categoryUrlSuffix}
                    mainNavWidth={mainNavWidth}
                    onNavigate={handleNavigate}
                    key={category.uid}
                    subMenuState={subMenuState}
                    disableFocus={disableFocus}
                    handleSubMenuFocus={handleSubMenuFocus}
                    handleClickOutside={handleClickOutside}
                />
            );
        })
        : null;

    return (
        <nav
            ref={mainNavRef}
            className={megaMenuClasses}
            data-cy="MegaMenu-megaMenu"
            role="navigation"
            onFocus={handleSubMenuFocus}
        >
            <div className={classes.wrapper}>
                {shouldRenderItems ? items : null}
            </div>
        </nav>
    );
};

export default MegaMenu;
