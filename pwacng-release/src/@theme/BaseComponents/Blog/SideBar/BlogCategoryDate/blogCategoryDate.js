import React from "react";
import defaultClasses from './blogCategoryDate.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage} from "react-intl";
import useBlogCategoryDate from "../../../../Talons/Blog/SideBar/BlogCategoryDate/useBlogCategoryDate";
import {Link} from "react-router-dom";

const BlogCategoryDate = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useBlogCategoryDate();

    const {
        data
    } = talonProps;

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <p>
                    <FormattedMessage
                        id={'blogCategoryDate.title'}
                        defaultMessage={'Storage'}
                    />
                </p>
            </div>
            <div className={classes.content}>
                {
                    data.map((item, index) => (
                        <Link to={`/blog-search?date=${item.date}`} key={index} className={classes.item}>
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

export default BlogCategoryDate
