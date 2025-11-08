import React from 'react';
import { node, shape, string } from 'prop-types';
import { useIntl } from 'react-intl';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Header/navTrigger.module.css';
import navTriggerCustomClasses from '@magenest/theme/BaseComponents/Header/extendStyle/navTrigger.module.scss';
import { useNavigationTrigger } from '@magento/peregrine/lib/talons/Header/useNavigationTrigger';
import { MenuIcon } from '@magenest/theme/static/icons'

/**
 * A component that toggles the navigation menu.
 */
const NavigationTrigger = props => {
    const { formatMessage } = useIntl();
    const { handleOpenNavigation } = useNavigationTrigger();

    const classes = useStyle(defaultClasses, navTriggerCustomClasses, props.classes);
    return (
        <button
            className={classes.root}
            data-cy="Header-NavigationTrigger-root"
            aria-label={formatMessage({
                id: 'navigationTrigger.ariaLabel',
                defaultMessage: 'Toggle navigation panel'
            })}
            onClick={handleOpenNavigation}
        >
            <img src={MenuIcon} alt={'bar'} width={18} height={18} />
        </button>
    );
};

NavigationTrigger.propTypes = {
    children: node,
    classes: shape({
        root: string
    })
};

export default NavigationTrigger;
