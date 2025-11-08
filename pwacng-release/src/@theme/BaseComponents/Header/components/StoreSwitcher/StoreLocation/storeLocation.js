import React from 'react';
import {FormattedMessage} from "react-intl";

import Button from '@magento/venia-ui/lib/components/Button';
import StoreLocationPopup from "./storeLocationPopup";
import useStoreLocation from "@magenest/theme/Talons/StoreLocation/useStoreLocation";
import StoreInformationPopup from "./storeInformationPopup";
import {LocationBlue} from "@magenest/theme/static/icons";

const StoreLocation = props => {
    const {
        classes,
        customerAddress
    } = props

    const talonProps = useStoreLocation();

    const {
        handleOpen,
        fetchStoreView,
        handleSubmitLocation,
        handleClose,
        storeInformation,
        storeViewData,
        storeLocationLabel,
        setStoreLocationLabel,
        isLoading
    } = talonProps;

    return (
        <>
            <p className={classes.storeCurrentLabel}>
                <FormattedMessage
                    id={'global.deliveryAddress'}
                    defaultMessage={'Delivery address'}
                />
            </p>
            <p className={classes.storeLocationDescription}>
                {
                    customerAddress ? customerAddress : (
                        <FormattedMessage
                            id={'storeLocation.description'}
                            defaultMessage={'Enter your shipping address here'}
                        />
                    )
                }
            </p>
            <Button
                priority='low'
                onClick={handleOpen}
                type="button"
            >
                <FormattedMessage
                    id={'storeLocation.button'}
                    defaultMessage={'Add address'}
                />
            </Button>
            <StoreLocationPopup
                handleClose={handleClose}
                fetchStoreView={fetchStoreView}
                handleSubmitLocation={handleSubmitLocation}
                storeLocationLabel={storeLocationLabel}
                setStoreLocationLabel={setStoreLocationLabel}
                isLoading={isLoading}
            />
            <StoreInformationPopup
                storeInformation={storeInformation}
                storeViewData={storeViewData}
            />
        </>
    )
}

export default StoreLocation
