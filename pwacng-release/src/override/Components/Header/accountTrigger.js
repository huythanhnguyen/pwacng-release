import React, { Fragment, Suspense } from 'react';
import { useIntl } from 'react-intl';
import { shape, string } from 'prop-types';
import { ChevronDown } from 'react-feather';

import { useAccountTrigger } from '../../Talons/Header/useAccountTrigger';
import { useStyle } from '@magento/venia-ui/lib/classify';

import AccountChip from '../AccountChip/accountChip';

import defaultClasses from '@magento/venia-ui/lib/components/Header/accountTrigger.module.css';
import accountTriggerCustomClasses from "@magenest/theme/BaseComponents/Header/extendStyle/accountTrigger.module.scss";
import Icon from "@magento/venia-ui/lib/components/Icon";
import {Link} from "react-router-dom";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import {useAppContext} from "@magento/peregrine/lib/context/app";

const AccountMenu = React.lazy(() => import('../AccountMenu/accountMenu'));

/**
 * The AccountTrigger component is the call to action in the site header
 * that toggles the AccountMenu dropdown.
 *
 * @param {Object} props
 * @param {Object} props.classes - CSS classes to override element styles.
 */
const AccountTrigger = props => {
    const talonProps = useAccountTrigger();
    const {
        handleTriggerClick,
        isUserSignedIn,
        isOpen,
        handleClose
    } = talonProps;

    const { isMobile } = useMediaCheck();
    const [appState, { closeDrawer }] = useAppContext();

    const classes = useStyle(defaultClasses, accountTriggerCustomClasses, props.classes);
    const rootClassName = isOpen ? classes.root_open : classes.root;
    const { formatMessage } = useIntl();

    return (
        <Fragment>
            <div
                className={rootClassName}
                // onMouseLeave={handleClose}
            >
                <Link
                    className={classes.trigger}
                    data-cy="AccountTrigger-trigger"
                    to={`${isUserSignedIn ? (isMobile ? '/account' : '/dashboard') : '/sign-in'}`}
                    onClick={() => closeDrawer('menu')}
                    // onMouseEnter={isDesktop && !isUserSignedIn ? handleTriggerClick : () => closeDrawer('nav')}
                >
                    <AccountChip
                        fallbackText={formatMessage({
                            id: 'accountTrigger.buttonFallback',
                            defaultMessage: 'My Account'
                        })}
                        shouldIndicateLoading={true}
                    />
                </Link>
                {
                    !isUserSignedIn && (
                        <Suspense fallback={null}>
                            <AccountMenu
                                handleTriggerClick={handleTriggerClick}
                                isOpen={isOpen}
                                handleClose={handleClose}
                            />
                        </Suspense>
                    )
                }
            </div>
        </Fragment>
    );
};

export default AccountTrigger;

AccountTrigger.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        trigger: string
    })
};
