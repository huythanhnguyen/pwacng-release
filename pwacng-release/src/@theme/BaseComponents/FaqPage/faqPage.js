import React, {Fragment, useMemo} from 'react';
import defaultClasses from './faqPage.module.scss';
import {useStyle} from "@magento/venia-ui/lib/classify";
import useFaqPage from "../../Talons/FaqPage/useFaqPage";
import SlideToggle from "react-slide-toggle";
import RichContent from "@magento/venia-ui/lib/components/RichContent";
import Icon from "@magento/venia-ui/lib/components/Icon";
import { ChevronRight as ArrowRight } from 'react-feather';
import StaticBreadcrumbs from "../../../override/Components/Breadcrumbs/staticBreadcrumbs";
import {FormattedMessage, useIntl} from "react-intl";
import { Faq, ArrowLeftBlue} from '@magenest/theme/static/icons';
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import {Meta, StoreTitle} from "@magento/venia-ui/lib/components/Head";


const FaqPage = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const { isMobile } = useMediaCheck();
    const talonProps = useFaqPage({isMobile});

    const {
        data,
        currentFaq,
        setCurrentFaq,
        childPage,
        headerContent,
        footerContent
    } = talonProps;

    const sideBar = data && data.length > 0 && !childPage && (
        <div className={classes.sideBar}>
            <ul>
                {
                    data.map(category => (
                        <li
                            className={`${currentFaq === category.category_id ? classes.item_active : classes.item} `}
                            onClick={() => setCurrentFaq(category.category_id)}
                            key={category.category_id}
                        >
                            {category.name}
                            <Icon src={ArrowRight} size={20} />
                        </li>
                    ))
                }
            </ul>
        </div>
    );

    const mainContent = (
        <div className={classes.main}>
            {
                data.filter(item => item.category_id === currentFaq).map(item => {
                    const faq = item.faqs.filter(faq => faq.is_active === 1).map(faq => (
                        <Fragment key={faq.id}>
                            <SlideToggle
                                collapsed={item.faqs.length > 1}
                                render={({toggle, setCollapsibleElement, toggleState}) => (
                                    <div className={`${toggleState === 'EXPANDED' ? classes.content_active : classes.content}`}>
                                        {
                                            item.faqs.length > 1 && (
                                                <div onClick={toggle} className={classes.question}>
                                                    {faq.question}
                                                    <span className={classes.icon}></span>
                                                </div>
                                            )
                                        }
                                        <div ref={setCollapsibleElement}>
                                            <div className={classes.answer}>
                                                <RichContent html={faq.answer} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </Fragment>
                    ));

                    return (
                        <>
                            {
                                isMobile && (
                                    <div className={`${classes.blockTitle} ${classes.childPageBlockTitle}`}>
                                        {
                                            !childPage && (
                                                <span onClick={() => setCurrentFaq('')} className={classes.back}>
                                                    <img src={ArrowLeftBlue} alt={''} />
                                                </span>
                                            )
                                        }
                                        <strong>
                                            {item.name}
                                        </strong>
                                    </div>
                                )
                            }
                            {
                                item.content_html_page_header && item.content_html_page_header.trim !== '' && (
                                    <div className={classes.headerContent}>
                                        <RichContent html={item.content_html_page_header} />
                                    </div>
                                )
                            }
                            {faq}
                            {
                                item.content_html_page_footer && item.content_html_page_footer.trim !== '' && (
                                    <div className={classes.footerContent}>
                                        <RichContent html={item.content_html_page_footer} />
                                    </div>
                                )
                            }
                        </>
                    )
                })
            }
        </div>
    );

    const pageTitle = (
        <div className={classes.title}>
            {
                childPage ? (
                    <strong>
                        {data[0]?.name ? data[0].name : <FormattedMessage
                            id={'global.faq'}
                            defaultMessage={'Frequently asked questions'}
                        />}
                    </strong>
                ) : (
                    <>
                        <img src={Faq} alt={'faq'} />
                        <strong>
                            <FormattedMessage
                                id={'global.faq'}
                                defaultMessage={'Frequently asked questions'}
                            />
                        </strong>
                    </>
                )
            }
        </div>
    );

    const titleString = useMemo(() => {
        return `${
            childPage && data[0]?.name
                ? data[0].name
                : formatMessage({
                    id: "global.faq",
                    defaultMessage: 'Frequently asked questions'
                })
        }`
    }, [childPage, data])

    const rootClasses = childPage ? classes.root_child : classes.root;

    return (
        <>
            <StoreTitle>{titleString}</StoreTitle>
            <Meta name="title" content={titleString}/>
            <StaticBreadcrumbs pageTitle={titleString} />
            <div className={rootClasses}>
                {
                    isMobile ? (
                        !currentFaq && pageTitle
                    ) : pageTitle
                }
                <div className={classes.wrapper}>
                    {
                        isMobile ? (
                            currentFaq ? mainContent : sideBar
                        ) : (
                            <>
                                {sideBar}
                                {mainContent}
                            </>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default FaqPage
