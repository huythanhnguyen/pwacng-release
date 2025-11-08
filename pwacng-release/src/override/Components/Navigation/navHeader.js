import React, { Fragment } from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { bool, func, shape, string } from 'prop-types';
import { ChevronLeft } from 'react-feather';

import { useStyle } from '@magento/venia-ui/lib/classify';
import AccountChip from '@magento/venia-ui/lib/components/AccountChip';
import Icon from '@magento/venia-ui/lib/components/Icon';
import Trigger from '@magento/venia-ui/lib/components/Trigger';
import defaultClasses from '@magento/venia-ui/lib/components/Navigation/navHeader.module.css';
import navHeaderCustomClasses from '@magenest/theme/BaseComponents/Navigation/extentStyle/navHeader.module.scss'
import { useNavigationHeader } from '@magento/peregrine/lib/talons/Navigation/useNavigationHeader';

const NavHeader = props => {
    const { isTopLevel, onBack, view } = props;
    const { formatMessage } = useIntl();

    const talonProps = useNavigationHeader({
        isTopLevel,
        onBack,
        view
    });

    const { handleBack, isTopLevelMenu } = talonProps;

    const classes = useStyle(defaultClasses, navHeaderCustomClasses, props.classes);

    return (
        <Fragment>
            <span key="title" className={classes.title}>
                <FormattedMessage
                    id={'header.menuButton'}
                    defaultMessage={'Category'}
                />
            </span>
        </Fragment>
    );
};

export default NavHeader;

NavHeader.propTypes = {
    classes: shape({
        title: string
    }),
    isTopLevel: bool,
    onBack: func.isRequired,
    view: string.isRequired
};
