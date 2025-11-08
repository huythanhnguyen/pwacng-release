import React from 'react';
import { arrayOf, func, number, shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import SuggestedCategory from './suggestedCategory';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/suggestedCategories.module.css';
import customClasses from '@magenest/theme/BaseComponents/SearchBar/extendStyle/suggestedCategories.module.scss';

const SuggestedCategories = props => {
    const { categories, setVisible } = props;
    const classes = useStyle(defaultClasses, props.classes, customClasses);

    const items = categories && categories.length ? categories.map((label, index) => (
        <li key={index} className={classes.item}>
            <SuggestedCategory
                label={label}
                setVisible={setVisible}
            />
        </li>
    )) : '';

    return <ul className={classes.root}>{items}</ul>;
};

export default SuggestedCategories;

SuggestedCategories.defaultProps = {
    limit: 4
};

SuggestedCategories.propTypes = {
    classes: shape({
        item: string,
        root: string
    }),
    limit: number.isRequired,
    onNavigate: func,
    value: string
};
