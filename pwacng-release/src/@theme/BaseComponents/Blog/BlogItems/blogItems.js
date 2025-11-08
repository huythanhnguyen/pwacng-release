import React, {Fragment} from "react";
import defaultClasses from './blockItems.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import BlogItem from "./blogItem";

const BlogItems = props => {
    const {
        data
    } = props;

    const classes = useStyle(defaultClasses, props.classes);

    return (
        <div className={classes.root}>
            {
                data.map(item => (
                    <Fragment key={item.id}>
                        <BlogItem
                            item={item}
                        />
                    </Fragment>
                ))
            }
        </div>
    )
}

export default BlogItems
