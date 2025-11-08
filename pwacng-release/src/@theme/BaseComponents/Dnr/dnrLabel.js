import React from 'react';
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./dnrLabel.module.scss";

const DnrLabel = props => {
    const {
        dnrData
    } = props
    const classes = useStyle(defaultClasses, props.classes);

    const dnrLabel = dnrData?.event_name || dnrData?.[0]?.event_name || '';

    return (
        <>
            {!!dnrLabel ? (
                <div className={`${classes.dnrRoot} ${classes.dnr}`}>
                    <div className={classes.dnrInner}>
                        {dnrLabel}
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default DnrLabel
