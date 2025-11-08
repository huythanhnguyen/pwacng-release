import React from 'react';
import { func, shape, string } from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useCategoryLeaf } from '@magento/peregrine/lib/talons/CategoryTree';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import { ChevronLeft } from 'react-feather';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/CategoryTree/categoryLeaf.module.css';
import categoryLeafCustomClasses from '@magenest/theme/BaseComponents/CategoryTree/extendStyle/categoryLeaf.module.scss';
import Icon from "@magento/venia-ui/lib/components/Icon";
import Trigger from "@magento/venia-ui/lib/components/Trigger";

const Leaf = props => {
    const {
        category,
        onNavigate,
        categoryUrlSuffix,
        tabIndex,
        onBack
    } = props;
    const { name, url_path, children } = category;
    const classes = useStyle(defaultClasses, categoryLeafCustomClasses, props.classes);
    const { handleClick, handleBack } = useCategoryLeaf({ onNavigate, onBack });
    const destination = resourceUrl(`/${url_path}${categoryUrlSuffix || ''}`);

    return (
        <li className={classes.root}>
            <Trigger key="backButton" action={handleBack}>
                <Icon src={ChevronLeft} />
            </Trigger>
            <Link
                className={classes.target}
                data-cy="CategoryTree-Leaf-target"
                to={destination}
                tabIndex={tabIndex}
                onClick={handleClick}
            >
                <span
                    className={classes.text}
                >
                    {name}
                </span>
            </Link>
        </li>
    );
};

export default Leaf;

Leaf.propTypes = {
    category: shape({
        name: string.isRequired,
        url_path: string.isRequired
    }).isRequired,
    classes: shape({
        root: string,
        target: string,
        text: string
    }),
    onNavigate: func.isRequired,
    tabIndex: string,
    categoryUrlSuffix: string
};
