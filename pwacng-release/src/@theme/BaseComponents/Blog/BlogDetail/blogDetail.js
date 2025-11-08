import React from 'react';
import defaultClasses from './blogDetail.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import useBlogDetail from "../../../Talons/Blog/BlogDetail/useBlogDetail";
import RichContent from "@magento/venia-ui/lib/components/RichContent/richContent";
import LoadingIndicator, {fullPageLoadingIndicator} from "@magento/venia-ui/lib/components/LoadingIndicator";

const BlogDetail = props => {
    const {
        data,
        loading
    } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    if (loading) return <LoadingIndicator />;

    if (!data) return null

    const [year, month, day] = data.publish_date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    return (
        <div className={classes.root}>
            <img className={classes.banner} src={data.image} alt={data.title} />
            <div className={classes.wrapper}>
                <h1 className={classes.title}>{data.title}</h1>
                <div className={classes.info}>
                    <p className={classes.date}>{formattedDate}</p>
                    <p className={classes.view}>
                        <FormattedMessage
                            id={'blog.viewsCount'}
                            defaultMessage={'{value} Views'}
                            values={{
                                value: data.views
                            }}
                        />
                    </p>
                </div>
                <div className={classes.content + ' blog-detail-content'}>
                    <RichContent html={data.content} />
                </div>
            </div>
        </div>
    )
}

export default BlogDetail
