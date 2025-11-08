import React, {useMemo} from 'react';
import defaultClasses from './listPdf.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import useListPdf from "../../Talons/ListPdf/useListPdf";
import {Link} from "react-router-dom";
import SlickSlider from "react-slick";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import {FormattedMessage} from "react-intl";

const ListPdf = props => {
    const {
        title,
        limit
    } = props;
    const {isDesktop } = useMediaCheck();

    const classes = useStyle(defaultClasses, props.classes);
    const talonProps = useListPdf({
        pageSize: limit
    });

    const {
        data
    } = talonProps;

    const listPdf = useMemo(() => {
        return data?.items && data.items.length > 0 ? data.items.map(item => (
            <div className={classes.item} key={item.id}>
                <a href={item.url_pdf} target='_blank'>
                    <span className={classes.imageContainer}><img src={item.url_banner} alt={item.title} /></span>
                    <p className={classes.name}>{item.title}</p>
                </a>
            </div>
        )) : null
    }, [data]);

    const sliderProps = {
        arrows: true,
        dots: false,
        slidesToShow: 4,
        slidesToScroll: 4,
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 768,
                settings: "unslick"
            }
        ]
    }

    return (
        <div className={classes.root}>
            <h2 className={classes.title}>
                {title}
            </h2>
            <div className={classes.content}>
                {
                    (isDesktop) ? (
                        <SlickSlider {...sliderProps}>
                            {listPdf}
                        </SlickSlider>
                    ) : (<>{listPdf}</>)
                }
            </div>
            {/*<Link className={classes.link} to={`/flyer`}>
                <FormattedMessage
                    id={'global.showMore'}
                    defaultMessage={'View more'}
                />
            </Link>*/}
        </div>
    )
}

export default ListPdf
