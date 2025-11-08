import React from 'react';
import defaultClasses from './storeItem.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';

import LinkButton from "@magento/venia-ui/lib/components/LinkButton";

const StoreItem = props => {
    const {
        store,
        onSelect
    } = props
    const classes = useStyle(defaultClasses, props.classes);

    const handleClick = () => {
        onSelect(store);
    };

    return (
        <li className={classes.storeItem}>
            <div className={classes.storeItemInner}>
                <span className={classes.storeImage}>
                    <img src={store.source_image_featured || transparentPlaceholder} alt={store.name}/>
                </span>
                <div className={classes.storeInformation}>
                    <p className={classes.storeName}>{store.name}</p>
                    <p className={classes.storeAddress}>{store.street}</p>
                    {
                        store.latitude && store.longitude && (
                            <p className={classes.actions}>
                                <LinkButton
                                    className={classes.viewMap}
                                    onClick={handleClick}
                                >
                                    <FormattedMessage
                                        id={'global.viewMap'}
                                        defaultMessage={'View map'}
                                    />
                                </LinkButton>
                            </p>
                        )
                    }
                </div>
            </div>
        </li>
    )
}

export default StoreItem;
