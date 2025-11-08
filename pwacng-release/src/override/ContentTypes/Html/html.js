import React from 'react';
import defaultClasses from '@magento/pagebuilder/lib/ContentTypes/Html/html.module.css';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { arrayOf, shape, string } from 'prop-types';
import { useHistory } from 'react-router-dom';
import handleHtmlContentClick from '@magento/pagebuilder/lib/handleHtmlContentClick';
import FlashsaleProducts from '../FlashsaleProducts/flashsaleProducts';
import ProductRecommendation from '../ProductRecommendation/productRecommendation';
import ListPdf from "../../../@theme/BaseComponents/ListPdf";

const toHTML = str => ({ __html: str });

/**
 * Page Builder HTML component.
 *
 * This component is part of the Page Builder / PWA integration. It can be consumed without Page Builder.
 *
 * @typedef Html
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that renders HTML with optional styling properties.
 */
const Html = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {
        html,
        textAlign,
        border,
        borderColor,
        borderWidth,
        borderRadius,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        cssClasses = []
    } = props;

    const dynamicStyles = {
        textAlign,
        border,
        borderColor,
        borderWidth,
        borderRadius,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft
    };

    const history = useHistory();

    const clickHandler = event => {
        handleHtmlContentClick(history, event);
    };

    if (html.trim().startsWith("___widget_flashsale")) {

        // Regex to extract pageSize
        const pageSizeMatch = html.match(/__pageSize\((\d+)\)/);
        const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 10;

        // Regex to extract url
        const urlMatch = html.match(/__url\("([^"]+)"\)/);
        const url = urlMatch ? urlMatch[1] : 'flash-sale';

        // Regex to extract title
        const titleMatch = html.match(/__title\("([^"]+)"\)/);
        const title = titleMatch ? titleMatch[1] : '';

        return (
            <FlashsaleProducts pageSize={pageSize} url={url} title={title}/>
        )
    }

    if (html.trim().startsWith("___widget_product_recommendation")) {

        // Regex to extract asm_journey_id
        const asmJourneyIdMatch = html.match(/__id\("([^"]+)"\)/);
        const asmJourneyId = asmJourneyIdMatch ? asmJourneyIdMatch[1] : '';

        // Regex to extract limit
        const limitMatch = html.match(/__limit\((\d+)\)/);
        const limit = limitMatch ? parseInt(limitMatch[1], 10) : 12;

        // Regex to extract color
        const colorMatch = html.match(/__color\("([^"]+)"\)/);
        const color = colorMatch ? colorMatch[1] : '';

        // Regex to extract image
        const imageMatch = html.match(/__image\("([^"]+)"\)/);
        const image = imageMatch ? imageMatch[1] : '';

        // Regex to extract image
        const imageMobileMatch = html.match(/__image-mobile\("([^"]+)"\)/);
        const imageMobile = imageMobileMatch ? imageMobileMatch[1] : '';

        return (
            <ProductRecommendation
                asmJourneyId={asmJourneyId}
                pageSize={limit}
                color={color}
                image={image}
                imageMobile={imageMobile}
                customStyle={[classes.root, ...cssClasses].join(' ')}
            />
        )
    }

    if (html.trim().startsWith("___widget_listPdf")) {
        // Regex to extract title
        const titleMatch = html.match(/__title\("([^"]+)"\)/);
        const title = titleMatch ? titleMatch[1] : '';

        const limitMatch = html.match(/__limit\((\d+)\)/);
        const limit = limitMatch ? parseInt(limitMatch[1], 10) : 4;

        return (
            <ListPdf title={title} limit={limit} />
        )
    }

    return (
        <div
            style={dynamicStyles}
            className={[classes.root, ...cssClasses].join(' ')}
            dangerouslySetInnerHTML={toHTML(html)}
            onClick={clickHandler}
            onKeyDown={clickHandler}
            role="presentation"
        />
    );
};

/**
 * Props for {@link Html}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the Html
 * @property {String} classes.root CSS classes for the root container element
 * @property {String} html HTML code to be rendered as part of component
 * @property {String} textAlign Alignment of the video within the parent container
 * @property {String} border CSS border property
 * @property {String} borderColor CSS border color property
 * @property {String} borderWidth CSS border width property
 * @property {String} borderRadius CSS border radius property
 * @property {String} marginTop CSS margin top property
 * @property {String} marginRight CSS margin right property
 * @property {String} marginBottom CSS margin bottom property
 * @property {String} marginLeft CSS margin left property
 * @property {String} paddingTop CSS padding top property
 * @property {String} paddingRight CSS padding right property
 * @property {String} paddingBottom CSS padding bottom property
 * @property {String} paddingLeft CSS padding left property
 * @property {Array} cssClasses List of CSS classes to be applied to the component
 */
Html.propTypes = {
    classes: shape({
        root: string
    }),
    html: string,
    textAlign: string,
    border: string,
    borderColor: string,
    borderWidth: string,
    borderRadius: string,
    marginTop: string,
    marginRight: string,
    marginBottom: string,
    marginLeft: string,
    paddingTop: string,
    paddingRight: string,
    paddingBottom: string,
    cssClasses: arrayOf(string)
};

export default Html;
