import React, {useEffect, useMemo, useRef, useState} from 'react';
import { array, shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';

import AttributeType from '@magento/venia-ui/lib/components/ProductFullDetail/CustomAttributes/AttributeType';
import defaultClasses from '@magento/venia-ui/lib/components/ProductFullDetail/CustomAttributes/customAttributes.module.css';
import customClasses from '@magenest/theme/BaseComponents/ProductFullDetail/extendStyle/customAttributes.module.scss';
import {FormattedMessage} from "react-intl";
import RichContent from "@magento/venia-ui/lib/components/RichContent";

export const IS_VISIBLE_ON_FRONT = 'PRODUCT_DETAILS_PAGE';

const AdditionalAttributes = props => {
    const { additionalAttributes, showLabels } = props;
    const classes = useStyle(defaultClasses, customClasses, props.classes);

    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState('202px');
    const contentRef = useRef(null);

    const toggleDescription = () => {
        setDescriptionExpanded(!descriptionExpanded);
    };

    useEffect(() => {
        if (descriptionExpanded) {
            setMaxHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setMaxHeight('202px');
        }
    }, [descriptionExpanded]);

    const list = useMemo(
        () =>
            additionalAttributes.reduce((previousAttribute, currentAttribute) => {
                const attributeContent = (
                    <li
                        key={currentAttribute.attribute_code}
                        className={classes.listItem}
                    >
                        <div className={classes.label}>
                            {currentAttribute.label}
                        </div>
                        <div className={classes.content}>
                            {(currentAttribute.attribute_code === 'price') ? (
                                <RichContent html={currentAttribute.value} />
                            ) : (
                                <>{currentAttribute.value}</>
                            )}
                        </div>
                    </li>
                );

                previousAttribute.push(attributeContent);

                return previousAttribute;
            }, []),
        [classes, additionalAttributes, showLabels]
    );

    if (list.length === 0) {
        return null;
    }

    return (
        <div className={classes.root}>
            {
                list.length > 4 ? (
                    <section className={descriptionExpanded ? `${classes.description} ${classes.descriptionExpanded}` : `${classes.description} ${classes.descriptionCollapsed}`}>
                        <div className={classes.descriptionInner}
                             style={{ maxHeight }}
                             ref={contentRef}
                        >
                            <ul className={classes.list}>{list}</ul>
                        </div>
                        {descriptionExpanded ? (
                            <button onClick={toggleDescription} className={classes.showLessButton}>
                                <FormattedMessage
                                    id={'productFullDetail.showLessButton'}
                                    defaultMessage={'Show Less'}
                                />
                            </button>
                        ) : (
                            <button onClick={toggleDescription} className={classes.showMoreButton}>
                                <FormattedMessage
                                    id={'productFullDetail.showMoreButton'}
                                    defaultMessage={'Show More'}
                                />
                            </button>
                        )}
                    </section>
                ) : (
                    <ul className={classes.list}>{list}</ul>
                )
            }
        </div>
    );
};

AdditionalAttributes.propTypes = {
    classes: shape({
        root: string,
        title: string,
        list: string,
        listItem: string
    }),
    additionalAttributes: array.isRequired
};

export default AdditionalAttributes;
