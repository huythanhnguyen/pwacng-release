import React, {Fragment} from 'react';
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "@magenest/theme/BaseComponents/ProductLabel/productLabel.module.scss";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";
import Price from "@magento/venia-ui/lib/components/Price";

const ProductLabel = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { labelData, currentPage, percent, amount, currencyCode } = props;

    const reducedPrice = (<Price currencyCode={currencyCode} value={amount} />);

    const labelItems = labelData && Array.isArray(labelData) ?
        Object.values(
            labelData.reduce((acc, item) => {
                const position = item[currentPage].position;
                if (item[currentPage].display && (!acc[position] || item.label_priority < acc[position].label_priority)) {
                    acc[position] = item;
                }
                return acc;
            }, {})
        ).sort((a, b) => {
            const aPriority = Number.isFinite(a?.label_priority) ? a.label_priority : -Infinity;
            const bPriority = Number.isFinite(b?.label_priority) ? b.label_priority : -Infinity;
            return bPriority - aPriority;
        }) : []

    const {isMobile } = useMediaCheck();

    return (
        <>
            {
                labelItems.length > 0 ? (
                    labelItems.map((item, index) => {
                        const labelItem = item[currentPage];

                        const labelIdStyle = item.label_id ? `productLabelId${item.label_id}` : '';
                        const customCss = labelItem.custom_css ? (<style>{labelItem.custom_css}</style>) : (<></>);

                        const labelPositionClass = labelItem.position ? labelItem.position : '';
                        const labelSize = isMobile ? `${labelItem.label_size_mobile}px` : `${labelItem.label_size}px`;

                        let labelText = labelItem.text ? labelItem.text : ''
                        if (labelText.includes('{{percent}}')) {
                            labelText = labelText.replace('{{percent}}', `${percent}%`);
                        }
                        if (labelText.includes('{{amount}}')) {
                            const labelTextParts = labelText.split('{{amount}}');
                            labelText = (
                                <span>
                                    {labelTextParts[0]}
                                    <Price currencyCode={currencyCode} value={amount} />
                                    {labelTextParts[1]}
                                </span>
                            );
                        }

                        const textStyle = {};
                        textStyle.fontSize = labelItem.text_size ? `${labelItem.text_size}px` : '16px';
                        textStyle.color = labelItem.text_color ? labelItem.text_color : '#000000';

                        switch (labelItem.type) {
                            case 1:
                                return (
                                    <Fragment key={index}>
                                        <div className={`${classes.productLabel} ${classes.textOnly} ${labelPositionClass} ${labelIdStyle}`}>
                                            <div className='labelText' style={textStyle}>
                                              <span>{labelText}</span>
                                            </div>
                                        </div>
                                        {customCss}
                                    </Fragment>
                                )
                            case 2:
                                let shapeViewBox = '0 0 180 60';
                                switch (labelItem.shape_type) {
                                    case 'shape-new-7':
                                        shapeViewBox        = '0 0 60 60';
                                        break;
                                    case 'shape-new-8':
                                        shapeViewBox        = '0 0 60 60';
                                        break;
                                    case 'shape-new-12':
                                        shapeViewBox        = '0 0 45 60';
                                        break;
                                    case 'shape-new-13':
                                        shapeViewBox        = '0 0 45 60';
                                        break;
                                    case 'shape-new-14':
                                        shapeViewBox        = '0 0 45 60';
                                        break;
                                    case 'shape-new-16':
                                        shapeViewBox        = '0 0 120 60';
                                        break;
                                    case 'shape-new-17':
                                        shapeViewBox        = '0 0 60 60';
                                        break;
                                    case 'shape-new-18':
                                        shapeViewBox        = '0 0 41.398 60';
                                        break;
                                    case 'shape-new-19':
                                        shapeViewBox        = '0 0 38.421 60';
                                        break;
                                    case 'shape-new-20':
                                        shapeViewBox        = '0 0 60 60';
                                        break;
                                    case 'shape-new-21':
                                        shapeViewBox        = '0 0 63 18';
                                        break;
                                    case 'shape-new-22':
                                        shapeViewBox        = '0 0 60 60';
                                        break;
                                    default:
                                        break;
                                }

                                return (
                                    <Fragment key={index}>
                                        <div className={`${classes.productLabel} ${classes.shapeLayout} ${labelPositionClass} ${labelIdStyle}`} style={{width: labelSize}}>
                                            <div className={`${classes.labelShape} ${labelItem.shape_type}`}>
                                                <svg fill={labelItem.shape_color ? labelItem.shape_color : '#000000'} viewBox={shapeViewBox} xmlSpace="preserve"><use x="0" y="0" xlinkHref={'#' + labelItem.shape_type}></use></svg>
                                                <span className={classes.text} style={textStyle}>
                                                    <span>{labelText}</span>
                                                </span>
                                            </div>
                                        </div>
                                        {customCss}
                                    </Fragment>
                                )
                            case 3:
                                return (
                                    <Fragment key={index}>
                                        <div className={`${classes.productLabel} ${classes.imageLayout} ${labelPositionClass} ${labelIdStyle}`} style={{width: labelSize}}>
                                            <div className={classes.labelImage}>
                                                <img
                                                    src={labelItem.url ? labelItem.url : null}
                                                    className={labelItem.position ? labelItem.position : null}
                                                    alt={''}
                                                />
                                            </div>
                                        </div>
                                        {customCss}
                                    </Fragment>
                                )
                            case 4:
                                return (
                                    <Fragment key={index}>
                                        <div className={`${classes.productLabel} ${classes.frameLayout} ${labelIdStyle}`}>
                                            <img src={labelItem.url ? labelItem.url : null} alt={''}/>
                                        </div>
                                        {customCss}
                                    </Fragment>
                                )
                            default:
                                return null
                        }
                    })
                ) : (<></>)
            }
        </>
    );
};

export default ProductLabel;
