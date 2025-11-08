import React from "react";
import defaultClasses from './blogCategory.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage} from "react-intl";
import useBlogCategory from "../../../../Talons/Blog/SideBar/BlogCategory/useBlogCategory";
import {Link} from "react-router-dom";

const BlogCategory = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useBlogCategory();

    const {
        data
    } = talonProps

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <p>
                    <FormattedMessage
                        id={'blog.categoryTitle'}
                        defaultMessage={'Category'}
                    />
                </p>
            </div>
            <div className={classes.content}>
                {
                    data.map(item => (
                        <Link to={`/blog-search?categoryId=${item.id}`} key={item.id} className={classes.item}>
                            <p className={classes.name}>
                                {item.name}
                            </p>
                            <p className={classes.count}>
                                ({item.blog_count})
                            </p>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default BlogCategory
