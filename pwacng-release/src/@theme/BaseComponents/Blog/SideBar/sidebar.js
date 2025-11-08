import React from "react";
import defaultClasses from './sideBar.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import SearchBar from "./SearchBar/searchBar";
import BlogCategory from "./BlogCategory/blogCategory";
import LastArticle from "./LastArticle/lastArticle";
import BlogCategoryDate from "./BlogCategoryDate/blogCategoryDate";
import useMediaCheck from "../../../Hooks/MediaCheck/useMediaCheck";

const Sidebar = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {isMobile } = useMediaCheck();

    return (
        <div className={classes.sidebar}>
            {
                !isMobile && (
                    <div className={classes.searchBar}>
                        <SearchBar />
                    </div>
                )
            }
            <div className={classes.block}>
                <BlogCategory
                    classes={classes}
                />
            </div>
            <div className={classes.block}>
                <LastArticle
                    classes={classes}
                />
            </div>
            <div className={classes.block}>
                <BlogCategoryDate
                    classes={classes}
                />
            </div>
        </div>
    )
}

export default Sidebar
