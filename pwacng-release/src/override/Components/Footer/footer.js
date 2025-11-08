import React, {Suspense} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {Link, useLocation} from 'react-router-dom';
import { shape, string } from 'prop-types';
import { useFooter } from '@magento/peregrine/lib/talons/Footer/useFooter';

import Logo from '@magento/venia-ui/lib/components/Logo';
import Newsletter from '@magento/venia-ui/lib/components/Newsletter';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from '@magento/venia-ui/lib/components/Footer/footer.module.css';
import footerCustomClasses from '@magenest/theme/BaseComponents/Footer/extendStyle/footer.module.scss'
import { DEFAULT_LINKS, LOREM_IPSUM } from '@magento/venia-ui/lib/components/Footer/sampleData';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import CmsBlock from "@magento/venia-ui/lib/components/CmsBlock";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import Button from "@magento/venia-ui/lib/components/Button";
import bctImage from '@magenest/theme/static/images/bct.png';
import { useInView } from 'react-intersection-observer';
import Shimmer from "@magento/venia-ui/lib/components/Shimmer";
import useMediaCheck from "../../../@theme/Hooks/MediaCheck/useMediaCheck";

const Footer = props => {
    const classes = useStyle(defaultClasses, footerCustomClasses, props.classes);
    const talonProps = useFooter();
    const storage = new BrowserPersistence();
    const store = storage.getItem('store');
    const location = useLocation();

    const { copyrightText } = talonProps;
    const { formatMessage } = useIntl();
    const title = formatMessage({ id: 'logo.title', defaultMessage: 'Mega Market' });

    const address = storage.getItem('store')?.storeInformation?.name || '';
    const encodedAddress = encodeURIComponent(address ? address.replace(/\s*,\s*/g, ', ').trim() : '');
    const googleMapsWebUrl = `https://www.google.com/maps/search/?q=${encodedAddress}`;
    const googleMapsAppUrl = `comgooglemaps://?q=${encodedAddress}`;
    const footerCartClasses = location.pathname === '/cart' ? classes.footerCartPage : '';

    const {isMobile } = useMediaCheck();
    const [ servicesRef, servicesInView ] = useInView({ triggerOnce: true });
    const [ deliveryRef, deliveryInView ] = useInView({ triggerOnce: true });

    return (
        <footer data-cy="Footer-root" className={`${classes.footer} ${footerCartClasses}`}>
            <div ref={servicesRef} className={classes.services}>
                {servicesInView ? (
                    <CmsBlock
                        identifiers={'footer_services'}
                        classes={{root: classes.servicesWrapper}}
                    />
                ) : (
                    <Shimmer width="100%" height={isMobile ? "355px" : "180px"} />
                )}
            </div>
            <div className={classes.links}>
                <div className={classes.storeInformation}>
                    <div className={classes.storeWrapper}>
                        <Link
                            to={resourceUrl('/')}
                            aria-label={title}
                            className={classes.logoContainer}
                        >
                            <Logo
                                classes={{logo: classes.logo}}
                                isFooter={true}
                                width={120}
                                height={88}
                            />
                        </Link>
                        <div className={classes.storeDetails}>
                            <strong className={classes.storeName}>{store?.storeInformation?.name}</strong>
                            <p className={classes.storeAddress}>{store?.storeInformation?.address}</p>
                            {
                                navigator.userAgent.match(/iPhone|Android.+Mobile|Windows Phone|BlackBerry/i) ? (
                                    <a
                                        className={classes.findLocation}
                                        href={googleMapsAppUrl}
                                        target={'_blank'}
                                    >
                                        <FormattedMessage
                                            id={'footer.buttonFindLocation'}
                                            defaultMessage={'Find exact location'}
                                        />
                                    </a>
                                ) : (
                                    <a
                                        className={classes.findLocation}
                                        href={googleMapsWebUrl}
                                        target={'_blank'}
                                    >
                                        <FormattedMessage
                                            id={'footer.buttonFindLocation'}
                                            defaultMessage={'Find exact location'}
                                        />
                                    </a>
                                )
                            }
                        </div>
                    </div>
                    <div className={classes.bct}>
                        <a href='http://online.gov.vn/Home/WebDetails/67169' target="_blank">
                            <img src={bctImage} alt={'bo cong thuong'} width='160' height='61'/>
                        </a>
                    </div>
                </div>
                <CmsBlock
                    identifiers={'footer_links_v2'}
                    classes={classes}
                />
                {/*<Newsletter />*/}
            </div>
            <div ref={deliveryRef} className={classes.footerDelivery}>
                {deliveryInView ? (
                    <CmsBlock
                        identifiers={'footer_delivery'}
                        classes={{root: classes.deliveryWrapper}}
                    />
                ) : (
                    <Shimmer width="100%" height={isMobile ? "160px" : "40px"} />
                )}
            </div>
            <div className={classes.branding}>
                <p className={classes.copyright}>{copyrightText || null}</p>
            </div>
        </footer>
    );
};

export default Footer;

Footer.defaultProps = {
    links: DEFAULT_LINKS
};

Footer.propTypes = {
    classes: shape({
        root: string
    })
};
