import React, {useCallback, useState} from 'react';
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/MyAccount/extendStyle/accountSidebar.module.scss';
import {FormattedMessage, useIntl} from 'react-intl';
import {Link, useHistory} from 'react-router-dom';
import {useMutation} from "@apollo/client";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/Header/accountMenu.gql";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import Dialog from "@magento/venia-ui/lib/components/Dialog";

const AccountSidebar = props => {
    const { currentLink, isOpen, setIsOpen } = props;
    const classes = useStyle(defaultClasses, props.classes);

    const { formatMessage } = useIntl();
    const { isMobile } = useMediaCheck();

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { signOutMutation } = operations;

    const history = useHistory();
    const [revokeToken] = useMutation(signOutMutation);
    const [
        { currentUser },
        { signOut }
    ] = useUserContext();
    const [, { dispatch }] = useEventingContext();

    const handleSignOut = useCallback(async () => {
        // Delete cart/user data from the redux store.
        await signOut({ revokeToken });

        dispatch({
            type: 'USER_SIGN_OUT',
            payload: {
                ...currentUser
            }
        });
        // Refresh the page as a way to say "re-initialize". An alternative
        // would be to call apolloClient.resetStore() but that would require
        // a large refactor.
        history.go(0);
    }, [
        history,
        revokeToken,
        signOut,
        currentUser,
        dispatch
    ]);

    const [confirmingSignOut, setConfirmingSignOut] = useState(false);
    const cancelSignOut = () => {
        setConfirmingSignOut(false);
    }

    const maybeConfirmingSignOutOverlay = (
        <Dialog
            isOpen={confirmingSignOut}
            onCancel={cancelSignOut}
            onConfirm={handleSignOut}
            title={formatMessage({ id: 'accountSidebar.confirmSignOut', defaultMessage: 'Notification' })}
        >
            <div className={classes.confirmSignOutContainer}>
                <FormattedMessage
                    id={'accountSidebar.confirmSignOutText'}
                    defaultMessage={'Do you want to log out of your account?'}
                />
            </div>
        </Dialog>
    );

    const handleClick = (link) => {
        if (isMobile || link !== currentLink) {
            setIsOpen(false);
        }
    };

    const links = [
        { key: 'dashboard', to: '/dashboard', labelId: 'global.dashboard', labelDefault: 'General information' },
        { key: 'accountInformation', to: '/account-information', labelId: 'global.accountInformation', labelDefault: 'My profile' },
        { key: 'addressBook', to: '/address-book', labelId: 'global.addressBook', labelDefault: 'My address' },
        { key: 'orderManagement', to: '/order-history', labelId: 'global.orderManagement', labelDefault: 'My purchase' },
        // { key: 'returns', to: '/dashboard', labelId: 'global.returns', labelDefault: 'Return/refund' },
        { key: 'wishList', to: '/wishlist', labelId: 'global.wishList', labelDefault: 'My Items' }
    ];

    const renderLink = ({ key, to, labelId, labelDefault }) => (
        <li className={currentLink === key ? `${classes[key + 'Link']} ${classes.currentLink}` : classes[key + 'Link']} key={key}>
            <Link to={to} onClick={() => handleClick(key)}>
                <FormattedMessage id={labelId} defaultMessage={labelDefault} />
            </Link>
        </li>
    );

    return (
        <div className={classes.root}>
            {
                (isOpen || !isMobile) && (
                    <div className={classes.accountSidebar}>
                        {
                            isMobile ? (
                                <h1 className={classes.accountHead}>
                                    <FormattedMessage
                                        id={'global.myAccount'}
                                        defaultMessage={'My account'}
                                    />
                                </h1>
                            ) : (<></>)
                        }
                        <ul className={classes.accountNavigation}>
                            {links.map(link => renderLink(link))}
                            <li className={classes.signOutWrap}>
                                <button
                                    className={classes.signOut}
                                    onClick={() => setConfirmingSignOut(true)}
                                    type="button"
                                >
                                    <FormattedMessage
                                        id={'global.signOut'}
                                        defaultMessage={'Logout'}
                                    />
                                </button>
                            </li>
                            {maybeConfirmingSignOutOverlay}
                        </ul>
                    </div>
                )
            }
        </div>
    );
};

export default AccountSidebar;
