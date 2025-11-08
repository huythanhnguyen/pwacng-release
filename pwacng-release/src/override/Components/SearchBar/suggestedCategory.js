import React from 'react';
import { func, shape, string } from 'prop-types';

import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/SearchBar/suggestedCategory.module.css';
import customClasses from '@magenest/theme/BaseComponents/SearchBar/extendStyle/suggestedCategory.module.scss';
import {Link} from "react-router-dom";

const SuggestedCategory = props => {
    const { label, setVisible } = props;
    const classes = useStyle(defaultClasses, props.classes, customClasses);

    return (
        <Link className={classes.root} to={label.url} onClick={() => setVisible(false)}>
            {label.title}
        </Link>
    );
};

export default SuggestedCategory;

SuggestedCategory.propTypes = {
    classes: shape({
        root: string,
        value: string
    })
};
