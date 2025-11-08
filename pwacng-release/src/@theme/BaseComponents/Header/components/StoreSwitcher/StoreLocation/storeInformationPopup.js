import React from "react";
import Modal from "@magenest/theme//BaseComponents/Modal";
import {FormattedMessage, useIntl} from "react-intl";
import useStoreInformationPopup from "@magenest/theme/Talons/StoreLocation/useStoreInformationPopup";
import defaultClasses from './storeInformationPopup.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import Button from "@magento/venia-ui/lib/components/Button";
import { availableRoutes } from '@magento/venia-ui/lib/components/Routes/routes';
const StoreInformationPopup = props => {
    const { formatMessage } = useIntl();
    const classes = useStyle(defaultClasses, props.classes);

    const {
        storeInformation,
        storeViewData
    } = props;

    const talonProps = useStoreInformationPopup({
        availableRoutes,
        storeViewData,
        storeInformation
    });

    const {
        isOpen,
        handleClose,
        handleSwitchStore
    } = talonProps;

    const sortedStores = storeViewData?.storeView?.store_view_code && [...storeViewData.storeView.store_view_code].sort((a, b) => {
        if (a.distance !== b.distance) {
            return Number(a.distance) - Number(b.distance);
        }
        return Number(a.priority) - Number(b.priority);
    }) || [];

    return (
        <Modal
            title={formatMessage({
                id: 'global.notification',
                defaultMessage: 'Notification'
            })}
            isOpen={isOpen}
            handleClose={handleClose}
            isMask={true}
            zLarge={true}
            classes={classes}
        >
            <div className={classes.wrapper}>
                <div className={classes.content}>
                    <p className={classes.changeStoreContent}>
                        {
                            storeViewData?.storeView?.allow_selection ? (
                                <>
                                            <p className={classes.titleAllowSelection}>
                                                <FormattedMessage
                                                    id={'changeStoreModal.titleAllowSelection'}
                                                    defaultMessage={'Your delivery address is within the service area of two MM Mega Market centers.'}
                                                />
                                            </p>
                                            <p>
                                                <FormattedMessage
                                                    id={'changeStoreModal.descriptionAllowSelection'}
                                                    defaultMessage={`We recommend transferring your order to <strong>{storeFirst}</strong> to optimize delivery fees and time. You can still choose <strong>{storeSecond}</strong> if you prefer, but please note that additional costs or delivery time may apply.`}
                                                    values={{
                                                        strong: chunks => (
                                                            <strong>{chunks}</strong>
                                                        ),
                                                        storeFirst: sortedStores?.[0].source_name || '',
                                                        storeSecond: sortedStores?.[1].source_name || ''
                                                    }}
                                                />
                                            </p>
                                </>
                            ) : (
                                <>
                                            <span>
                                                <FormattedMessage
                                                    id={'changeStoreModal.storeInformation'}
                                                    defaultMessage={'Your delivery address falls under <strong>{store}</strong>. To serve you better and optimize delivery costs, MM will transfer your order to this center for processing.'}
                                                    values={{
                                                        strong: chunks => (
                                                            <strong>{chunks}</strong>
                                                        ),
                                                        store: sortedStores?.[0]?.source_name || ''
                                                    }}
                                                />
                                            </span>
                                </>
                            )
                        }
                    </p>
                </div>
            </div>
            <div className={classes.modalFooter}>
                {
                    sortedStores.length > 1 ? (
                        <>
                            {
                                sortedStores.map((store, index) => (
                                    <Button
                                        priority={index === 0 ? 'high' : 'low'}
                                        onClick={() => handleSwitchStore(store.store_view_code)}
                                    >
                                        <p className={classes.buttonTitle}>
                                            {store.source_name}
                                        </p>
                                        <p className={classes.buttonDescription}>
                                            {index === 0 ? (
                                                <FormattedMessage
                                                    id={'storeInformationPopup.buttonPrimaryDescription'}
                                                    defaultMessage={'(Delivery fee is optimized)'}
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id={'storeInformationPopup.buttonSecondaryDescription'}
                                                    defaultMessage={'(Additional shipping fees may apply)'}
                                                />
                                            )}
                                        </p>
                                    </Button>
                                ))
                            }
                        </>
                    ) : (
                        <Button
                            priority={'high'}
                            onClick={() => handleSwitchStore(storeViewData.storeView.store_view_code[0].store_view_code)}
                        >
                            <p className={classes.buttonTitle}>
                                <FormattedMessage
                                    id={'global.agree'}
                                    defaultMessage={'Agree'}
                                />
                            </p>
                            <p className={classes.buttonDescription}>
                                <FormattedMessage
                                    id={'storeInformationPopup.buttonPrimaryDescription'}
                                    defaultMessage={'(Delivery fee is optimized)'}
                                />
                            </p>
                        </Button>
                    )
                }
            </div>
        </Modal>
    )
}

export default StoreInformationPopup
