import React from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchKeywords.module.scss';
import {Link} from "react-router-dom";

const SearchKeywords = props => {
    const {
        searchTerm,
        keywords,
        rawKwMeta
    } = props;
    const classes = useStyle(defaultClasses, props.classes);

    const encodedKeywords = encodeURIComponent(keywords.join(','));
    return (
        <div className={classes.root}>
            {
                keywords.map((item, index) => (
                    <Link to={`/search.html?query=${item}&keywords=${encodedKeywords}${rawKwMeta ? `&kwmeta=${rawKwMeta}` : ''}`} key={index} className={item === searchTerm ? `${classes.item} ${classes.active}` : classes.item}>
                        {item}
                    </Link>
                ))
            }
        </div>
    )
}

export default SearchKeywords
