import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import { bool, shape, string } from 'prop-types';
import { Loader } from 'react-feather';
import { useAccountChip } from '@magento/peregrine/lib/talons/AccountChip/useAccountChip';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/AccountChip/accountChip.module.css';
import accountChipCustomClasses from '@magenest/theme/BaseComponents/AccountChip/extendStyle/accountChip.module.scss';
import { GET_CUSTOMER_DETAILS } from '@magento/venia-ui/lib/components/AccountChip/accountChip.gql';
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";

/**
 * The AccountChip component shows an icon next to some text.
 * Sometimes the text is static, sometimes it is dynamic based on the user's name,
 * and it can also be a loading icon to indicate that we're fetching the user's name.
 *
 * @param {Object} props
 * @param {Object} props.classes - CSS classes to override element styles.
 * @param {String} props.fallbackText - The text to display when the user is not signed in
 *  or when we're loading details but don't want to show a loading icon.
 * @param {Boolean} props.shouldIndicateLoading - Whether we should show a loading icon or
 *  not when the user is signed in but we don't have their details (name) yet.
 */
const AccountChip = props => {
    const { fallbackText, shouldIndicateLoading } = props;
    const { isDesktop } = useMediaCheck();

    const talonProps = useAccountChip({
        queries: {
            getCustomerDetailsQuery: GET_CUSTOMER_DETAILS
        }
    });
    const { currentUser, isLoadingUserName, isUserSignedIn } = talonProps;

    const classes = useStyle(defaultClasses, props.classes, accountChipCustomClasses);
    const { formatMessage } = useIntl();

    const ariaLabelMyMenu =
        currentUser != null
            ? formatMessage({
                id: 'Hi' + currentUser.firstname,
                defaultMessage: 'Hi' + currentUser.firstname
            })
            : '';

    const ariaLabel = isUserSignedIn ? ariaLabelMyMenu : '';

    return (
        <span className={classes.root}>
            <span
                aria-label={ariaLabel}
                aria-atomic="true"
                aria-live="polite"
                data-cy="AccountChip-text"
                className={classes.text}
            >
                {
                    isUserSignedIn ? (
                        <FormattedMessage
                            id={'accountChip.label'}
                            defaultMessage={'Hi, {value}'}
                            values={{
                                value: currentUser?.firstname || ''
                            }}
                        />
                    ) : (
                        <FormattedMessage
                            id={'accountChip.myAccount'}
                            defaultMessage={'My Account'}
                        />
                    )
                }
            </span>
        </span>
    );
};

export default AccountChip;

AccountChip.propTypes = {
    classes: shape({
        root: string,
        loader: string,
        text: string
    }),
    fallbackText: string,
    shouldIndicateLoading: bool
};

AccountChip.defaultProps = {
    fallbackText: 'My Account',
    shouldIndicateLoading: false
};
