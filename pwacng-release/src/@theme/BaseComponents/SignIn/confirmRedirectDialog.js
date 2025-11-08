import React, {useCallback} from 'react';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import {useHistory} from "react-router-dom";

const ConfirmRedirectDialog = props => {
    const {
        isOpen,
        setIsOpen,
        onConfirm,
        onCancel
    } = props;
    const classes = useStyle(props.classes);
    const history = useHistory();
    const { formatMessage } = useIntl();

    const title = formatMessage({
        id: 'global.notification',
        defaultMessage: 'Notification'
    });

    const handleConfirm = useCallback(() => {
        onConfirm();
        setIsOpen(false);
        history.push('/sign-in?chatbot=true');
    }, [onConfirm])

    return (
        <Dialog
            confirmTranslationId={'global.confirm'}
            confirmText="Confirm"
            isOpen={isOpen}
            onCancel={onCancel ? onCancel : () => setIsOpen(false)}
            onConfirm={handleConfirm}
            shouldDisableAllButtons={false}
            title={title}
            setScrollLock={false}
            classes={classes}
        >
            <FormattedMessage
                id={'wishlist.galleryButton.loginMessage'}
                defaultMessage={'Please sign-in to your Account to save items for later.'}
            />
        </Dialog>
    )
}

export default ConfirmRedirectDialog
