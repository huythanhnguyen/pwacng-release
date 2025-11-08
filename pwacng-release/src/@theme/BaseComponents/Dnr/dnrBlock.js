import React from 'react';
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./dnrBlock.module.scss";
import {FormattedMessage} from "react-intl";
import Price from "@magento/venia-ui/lib/components/Price";

const DnrBlock = props => {
    const {
        dnrData,
        currencyCode
    } = props
    const classes = useStyle(defaultClasses, props.classes);

    const dnrHide = true;
    if (dnrHide) return <></>;

    return (
        <>
            {dnrData?.length > 0 && (
                <div className={classes.dnrBlock}>
                    <strong className={classes.dnrTitle}>
                        <FormattedMessage id={'dnrBlock.title'} defaultMessage={'Discount'} />
                    </strong>
                    <div className={`${classes.dnrList} ${classes.dnr}`}>
                        {
                            dnrData.map((item, index) => {
                                return (
                                    <div className={classes.dnrItem} key={index}>
                                        <strong className={classes.dnrPrice}><Price value={item.promo_value} currencyCode={currencyCode} /></strong>
                                        {item.promo_label}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )}
        </>
    )
}

export default DnrBlock
