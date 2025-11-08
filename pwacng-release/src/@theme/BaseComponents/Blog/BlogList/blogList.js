import React from 'react';
import defaultClasses from './blogList.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";

const BlogList = props => {
    const classes = useStyle(defaultClasses, props.classes);

    return (
        <div className={classes.root}>

        </div>
    )
}

export default BlogList
