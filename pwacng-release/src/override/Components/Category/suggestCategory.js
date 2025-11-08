import React from "react";
import { useQuery } from '@apollo/client';
import GET_SUGGEST_CATEGORY from "./suggestCategory.gql";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from '@magenest/theme/BaseComponents/Category/extendStyle/suggestCategory.module.scss';
import sliderCustomClasses from '@magenest/theme/BaseComponents/ContentTypes/extendStyle/slider.module.scss';
import {Link} from "react-router-dom";
import SlickSlider from "react-slick";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import PlaceholderImage from "@magenest/theme/static/images/logommvn-placeholder.jpg";

const SuggestCategory = ({id}) => {
    const classes = useStyle(defaultClasses, sliderCustomClasses);
    const [{ isSignedIn }] = useUserContext();
    const { data, error, loading } = useQuery(GET_SUGGEST_CATEGORY, {
        variables: {
            id: id
        },
        fetchPolicy: 'cache-and-network'
    });
    if (loading) return <></>;
    if (error) return <></>;
    const suggestCategories = data.category?.suggestion_category
        ? (isSignedIn ? data.category.suggestion_category.for_customer : data.category.suggestion_category.for_guest)
        : [];

    const sliderProps = {
        arrows: true,
        lazyLoad: true,
        dots: false,
        slidesToShow: suggestCategories.length < 8 ? suggestCategories.length : 8,
        slidesToScroll: suggestCategories.length < 8 ? suggestCategories.length : 8,
        variableWidth: suggestCategories.length < 8,
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: suggestCategories.length < 6 ? suggestCategories.length : 6,
                    slidesToScroll: suggestCategories.length < 6 ? suggestCategories.length : 6,
                    variableWidth: suggestCategories.length < 6
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ]
    }

    return (
        <>
            {suggestCategories.length > 0 ? (
                <div className={classes.suggestCategories}>
                    <SlickSlider className={classes.suggestCategoriesSlider} {...sliderProps}>
                        {suggestCategories.length > 0 && (
                            suggestCategories.map((item, index) => (
                                <div key={index} className={classes.suggestCateItem}>
                                    <div className={classes.suggestCateItemInner}>
                                        <Link to={item.url_key}>
                                            <p className={classes.suggestCategoryImage}>
                                                {
                                                    item.url_image ? (
                                                        <img src={item.url_image} alt={item.name} />
                                                    ) : (
                                                        <img src={PlaceholderImage} alt={item.name}/>
                                                    )
                                                }
                                            </p>
                                            <p>{item.name || ''}</p>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </SlickSlider>
                </div>
            ) : <></>}
        </>
    );
};

export default SuggestCategory;
