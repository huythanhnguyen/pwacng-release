import React from 'react';
import defaultClasses from './alcoholDialog.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import alcoholImage from '@magenest/theme/static/images/18+.png';
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";

const AlcoholDialog = props => {
    const {
        isOpen,
        setIsOpen,
        onConfirm,
        onCancel,
        isBusy
    } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const title = formatMessage({
        id: 'global.notification',
        defaultMessage: 'Notification'
    });

    const text18YearsOld = formatMessage({
        id: 'alcoholDialog.text18YearsOld',
        defaultMessage: '18 years old'
    });

    return (
        <div className={classes.root}>
            <Dialog
                cancelTranslationId={'alcoholDialog.cancel'}
                cancelText="Under 18 years old"
                confirmTranslationId={'global.confirm'}
                confirmText="Confirm"
                isOpen={isOpen}
                onCancel={onCancel ? onCancel : () => setIsOpen(false)}
                onConfirm={onConfirm}
                shouldDisableAllButtons={false}
                title={title}
                setScrollLock={false}
                customClass={classes.alcoholDialog}
                classes={classes}
            >
                <div className={classes.alcoholDialogContent}>
                    <img className={classes.alcoholImage} src={alcoholImage} alt={'18+'} width='120' height='120'/>
                    <FormattedMessage
                        id={'alcoholDialog.confirmMessage'}
                        defaultMessage={'Please confirm that you are at least <highlight>18 years old</highlight> to continue viewing content or<br></br> purchasing this product.'}
                        values={{
                            highlight: chunks => (
                                <strong className={classes.redColor}>{text18YearsOld}</strong>
                            ),
                            br: chunks => (
                                <br className={classes.mobileShow}/>
                            )
                        }}
                    />
                </div>
                {isBusy && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
            </Dialog>
        </div>
    )
}

export default AlcoholDialog
