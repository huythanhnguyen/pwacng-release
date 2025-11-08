import React from "react";
import defaultClasses from './blogItem.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {Link} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import RichContent from "@magento/venia-ui/lib/components/RichContent/richContent";

const BlogItem = props => {
    const {
        item
    } = props;
    const classes = useStyle(defaultClasses, props.classes);

    const [year, month, day] = item.publish_date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    return (
        <>
            <div className={classes.root}>
                <div className={classes.imageWrapper}>
                    <img src={item.image} alt={item.title} />
                </div>
                <div className={classes.details}>
                    <strong className={classes.name}>
                        <Link to={`/blog/${item.url_key}`}>
                            {item.title}
                        </Link>
                    </strong>
                    <div className={classes.info}>
                        <p className={classes.date}>{formattedDate}</p>
                        <p className={classes.view}>
                            <FormattedMessage
                                id={'blog.viewsCount'}
                                defaultMessage={'{value} Views'}
                                values={{
                                    value: item.views
                                }}
                            />
                        </p>
                    </div>
                    <div className={classes.description}>
                        <RichContent html={item.short_content}/>
                    </div>
                    <Link to={`/blog/${item.url_key}`} className={classes.viewMore}>
                        <FormattedMessage
                            id={'filterList.showMore'}
                            defaultMessage={'Show More'}
                        />
                    </Link>
                </div>
            </div>
        </>
    )
}

export default BlogItem
