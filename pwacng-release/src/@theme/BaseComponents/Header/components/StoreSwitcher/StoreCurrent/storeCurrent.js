import React from "react";
import {FormattedMessage} from "react-intl";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
const StoreCurrent = props => {
    const {
        classes
    } = props

    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const storeInformation = store && store.storeInformation;

    return (
        <>
            <p className={classes.storeCurrentLabel}>
                <FormattedMessage
                    id={'storeCurrent.label'}
                    defaultMessage={'Current store'}
                />
            </p>
            <p className={classes.storeCurrentName}>
                {storeInformation && storeInformation.name}
            </p>
            <p className={classes.storeCurrentAddress}>
                {storeInformation && storeInformation.address}
            </p>
        </>
    )
}

export default StoreCurrent
