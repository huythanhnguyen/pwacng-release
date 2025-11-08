import React from 'react';
import defaultClasses from './alcoholDialog.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import alcoholImage from '@magenest/theme/static/images/18+.png';
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import {Link} from "react-router-dom";

const AlcoholCheckoutDialog = props => {
    const {
        isOpen,
        setIsOpen,
        onConfirm,
        isBusy
    } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const title = formatMessage({
        id: 'global.notification',
        defaultMessage: 'Notification'
    });

    return (
        <div className={classes.root}>
            <Dialog
                cancelTranslationId={'global.cancel'}
                cancelText="Cancel"
                confirmTranslationId={'global.confirm'}
                confirmText="Confirm"
                isOpen={isOpen}
                onCancel={() => setIsOpen(false)}
                onConfirm={onConfirm}
                shouldDisableAllButtons={false}
                shouldShowCancelButton={false}
                title={title}
                setScrollLock={false}
                customClass={classes.alcoholCheckoutDialog}
                classes={classes}
            >
                <div className={classes.alcoholDialogContent}>
                    <FormattedMessage
                        id={'alcoholDialog.redirectToCart'}
                        defaultMessage={'Please remove all alcohol and 18+ products from your cart to continue. Click confirm to return to the cart page.'}
                    />
                </div>
                {isBusy && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
            </Dialog>
        </div>
    )
}

export default AlcoholCheckoutDialog
