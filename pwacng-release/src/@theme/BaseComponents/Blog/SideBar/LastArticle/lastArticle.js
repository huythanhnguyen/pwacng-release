import React from "react";
import defaultClasses from './lastArticle.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import {FormattedMessage} from "react-intl";
import image from './image.png';
import {Link} from "react-router-dom";
import useLastArticle from "../../../../Talons/Blog/SideBar/LastArticle/useLastArticle";

const LastArticle = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const talonProps = useLastArticle();

    const {
        data
    } = talonProps;

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <p>
                    <FormattedMessage
                        id={'latestArticle.title'}
                        defaultMessage={'Latest article'}
                    />
                </p>
            </div>
            <div className={classes.content}>
                {
                    data.map(item => {
                        const [year, month, day] = item.publish_date.split('-');
                        const formattedDate = `${day}/${month}/${year}`;

                        return (
                            <div key={item.id} className={classes.item}>
                                <div className={classes.imageWrapper}>
                                    <div className={classes.image}>
                                        <img src={item.image} alt={item.title} />
                                    </div>
                                </div>
                                <div className={classes.details}>
                                    <Link to={`/blog/${item.url_key}`} className={classes.name}>{item.title}</Link>
                                    <p className={classes.date}>{formattedDate}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default LastArticle
