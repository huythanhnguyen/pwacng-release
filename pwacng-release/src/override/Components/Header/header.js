import React, { Fragment, Suspense, useEffect, useRef } from 'react';
import { shape, string } from 'prop-types';
import { Style } from '@magento/venia-ui/lib/components/Head';
import { Link, Route } from 'react-router-dom';
import { ChevronDown } from 'react-feather';
import Logo from '../Logo/logo';
import AccountTrigger from '@magento/venia-ui/lib/components/Header/accountTrigger';
import CartTrigger from './cartTrigger';
import NavTrigger from '@magento/venia-ui/lib/components/Header/navTrigger';
import SearchTrigger from '@magento/venia-ui/lib/components/Header/searchTrigger';
import OnlineIndicator from '@magento/venia-ui/lib/components/Header/onlineIndicator';
import { useHeader } from '../../Talons/Header/useHeader';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Header/header.module.css';
import headerCustomClasses from '@magenest/theme/BaseComponents/Header/extendStyle/header.module.scss';
import StoreSwitcher from './storeSwitcher';
import LanguageSwitcher from '@magenest/theme/BaseComponents/Header/components/LanguageSwitcher';
import MegaMenu from '../MegaMenu/megaMenu';
import {FormattedMessage, useIntl} from 'react-intl';
import useMediaCheck from "@magenest/theme/Hooks/MediaCheck/useMediaCheck";
import WishlistTrigger from "./wishlistTrigger";
import Icon from "@magento/venia-ui/lib/components/Icon";
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import Button from "@magento/venia-ui/lib/components/Button";
import {useUserContext} from "@magento/peregrine/lib/context/user";

const SearchBar = React.lazy(() => import('@magento/venia-ui/lib/components/SearchBar'));

const Header = props => {
    const {
        handleSearchTriggerClick,
        hasBeenOffline,
        isOnline,
        isSearchOpen,
        searchRef,
        searchTriggerRef,
        handleMegaMenu,
        isOpen,
        isHover,
        setIsHover
    } = useHeader();

    const {isDesktop } = useMediaCheck();

    const classes = useStyle(defaultClasses, props.classes, headerCustomClasses);
    const rootClass = isSearchOpen ? classes.open : classes.closed;
    const { formatMessage } = useIntl();

    const headerRef = useRef(null);
    const [{ isSignedIn }] = useUserContext();

    useEffect(() => {
        if (headerRef.current) {
            const headerHeight = headerRef.current.offsetHeight + 12;
            document.documentElement.style.setProperty('--headerHeight', `${headerHeight}px`);
        }
    }, []);

    const searchBarFallback = (
        <div className={classes.searchFallback} ref={searchRef}>
            <input
                placeholder={formatMessage({
                id: 'searchBar.placeholder',
                defaultMessage: 'What are you looking for?'
            })}
                className={classes.input}
            ></input>
            <button type={'button'}></button>
        </div>
    );
    const searchBar =
        <Suspense fallback={searchBarFallback}>
            <Route>
                <SearchBar isOpen={true} ref={searchRef} />
            </Route>
        </Suspense>;

    const title = formatMessage({ id: 'logo.title', defaultMessage: 'Venia' });
    const menuButtonClasses = isOpen ? classes.menuButtonOpen : classes.menuButton;

    return (
        <Fragment>
            <Style>{'header.header-cls { display: none !important; }'}</Style>
            <header className={classes.header} ref={headerRef}>
                <div className={classes.headerTop}>
                    <CmsBlock identifiers={'header_top_b2c'} />
                </div>
                <div className={classes.wrapper}>
                    {
                        !isDesktop && (
                            <div className={classes.primaryActions}>
                                <NavTrigger/>
                            </div>
                        )
                    }

                    <Link
                        aria-label={title}
                        to={resourceUrl('/')}
                        className={classes.logoContainer}
                        data-cy="Header-logoContainer"
                    >
                        <Logo classes={{logo: classes.logo}}/>
                    </Link>
                    {
                        isDesktop && (
                            <div className={classes.storeSwitcher}>
                                <StoreSwitcher />
                            </div>
                        )
                    }
                    {searchBar}
                    <div className={classes.secondaryActions}>
                        {
                            isDesktop && (
                                <>
                                    {
                                        isSignedIn && (
                                            <Link className={classes.quickOrder} to={'/quick-order'}>
                                                <FormattedMessage
                                                    id={'global.quickOrder'}
                                                    defaultMessage={'Quick order'}
                                                />
                                            </Link>
                                        )
                                    }
                                    <WishlistTrigger/>
                                    <AccountTrigger/>
                                </>
                            )
                        }
                        <CartTrigger/>
                    </div>
                </div>
                <div className={classes.megaMenu}>
                    {
                        isDesktop && (
                            <button
                                className={menuButtonClasses}
                                onClick={handleMegaMenu}
                                onMouseEnter={() => setIsHover(true)}
                                onMouseLeave={() => setIsHover(false)}
                            >
                                <FormattedMessage
                                    id={'header.menuButton'}
                                    defaultMessage={'Category'}
                                />
                                <Icon src={ChevronDown} size={22}/>
                            </button>
                        )
                    }
                    <div className={classes.menu}>
                        <CmsBlock
                            identifiers={'header_menu_links_v2'}
                        />
                    </div>
                    {
                        isDesktop && (
                            <>
                                <LanguageSwitcher/>
                                <div className={classes.businessCustomer}>
                                    <Button
                                        priority={'low'}
                                        onClick={() => window.location.href = 'https://mmpro.vn/'}
                                    >
                                        <FormattedMessage
                                            id={'header.customerB2B'}
                                            defaultMessage={'Business Customer'}
                                        />
                                    </Button>
                                </div>
                            </>
                        )
                    }
                </div>
                {
                    isDesktop && isOpen && (
                        <MegaMenu
                            isOpen={isOpen}
                        />
                    )
                }
                {/*<PageLoadingIndicator absolute />*/}
            </header>
            <OnlineIndicator
                hasBeenOffline={hasBeenOffline}
                isOnline={isOnline}
            />
        </Fragment>
    );
};

Header.propTypes = {
    classes: shape({
        closed: string,
        logo: string,
        open: string,
        primaryActions: string,
        secondaryActions: string,
        toolbar: string,
        switchers: string,
        switchersContainer: string
    })
};

export default Header;
