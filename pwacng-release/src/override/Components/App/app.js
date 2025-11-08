import React, {Fragment, useCallback, useContext} from 'react';
import { useIntl } from 'react-intl';
import { array, func, shape, string } from 'prop-types';

import { useToasts } from '@magento/peregrine';
import { useDelayedTransition } from '@magento/peregrine/lib/hooks/useDelayedTransition';
import { useApp } from '@magento/peregrine/lib/talons/App/useApp';
import { UserAgentContext } from '@magenest/theme/Hooks/UserAgentCheck/UserAgentContext';

import globalCSS from '@magento/venia-ui/lib/index.module.css';
import { HeadProvider, StoreTitle } from '../Head';
import Main from '@magento/venia-ui/lib/components/Main';
import Mask from '@magento/venia-ui/lib/components/Mask';
import Navigation from '@magento/venia-ui/lib/components/Navigation';
import Routes from '@magento/venia-ui/lib/components/Routes';
import ToastContainer from '@magento/venia-ui/lib/components/ToastContainer';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { useLocation } from 'react-router-dom';

import {
    AlertCircle as AlertCircleIcon,
    CloudOff as CloudOffIcon,
    Wifi as WifiIcon
} from 'react-feather';
import { Helmet } from 'react-helmet-async';
import useMediaCheck from "@magenest/theme/Hooks/MediaCheck/useMediaCheck";
import {Meta, Style} from "@magento/venia-ui/lib/components/Head";
import ReactGA from "react-ga4";
import MCardLogin from "@magenest/theme/BaseComponents/MCardLogin/mCardLogin";
import Canonical from "@magenest/theme/Hooks/Canonical/canonical";
import CommonSchema from "@magenest/theme/BaseComponents/Schema/commonSchema";

const OnlineIcon = <Icon src={WifiIcon} attrs={{ width: 18 }} />;
const OfflineIcon = <Icon src={CloudOffIcon} attrs={{ width: 18 }} />;
const ErrorIcon = <Icon src={AlertCircleIcon} attrs={{ width: 18 }} />;

const App = props => {
    const { markErrorHandled, renderError, unhandledErrors } = props;
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    useDelayedTransition();
    const {isDesktop } = useMediaCheck();
    const { isLazyContent } = useContext(UserAgentContext);
    const location = useLocation();
    const currentPath = location.pathname;
    const shouldShowHeader = !currentPath.includes('/checkout') && currentPath !== '/mcard/update-customer-email';
    const isMcardRoute = currentPath === '/mcard/';

    if (!isLazyContent) {
        ReactGA.initialize("G-M860NB9VH2");
    }

    const ERROR_MESSAGE = formatMessage({
        id: 'app.errorUnexpected',
        defaultMessage: 'Sorry! An unexpected error occurred.'
    });

    const handleIsOffline = useCallback(() => {
        addToast({
            type: 'error',
            icon: OfflineIcon,
            message: formatMessage({
                id: 'app.errorOffline',
                defaultMessage:
                    'You are offline. Some features may be unavailable.'
            }),
            timeout: 3000
        });
    }, [addToast, formatMessage]);

    const handleIsOnline = useCallback(() => {
        addToast({
            type: 'info',
            icon: OnlineIcon,
            message: formatMessage({
                id: 'app.infoOnline',
                defaultMessage: 'You are online.'
            }),
            timeout: 3000
        });
    }, [addToast, formatMessage]);

    const handleError = useCallback(
        (error, id, loc, handleDismissError) => {
            const errorToastProps = {
                icon: ErrorIcon,
                message: `${ERROR_MESSAGE}\nDebug: ${id} ${loc}`,
                onDismiss: remove => {
                    handleDismissError();
                    remove();
                },
                timeout: 15000,
                type: 'error'
            };

            addToast(errorToastProps);
        },
        [ERROR_MESSAGE, addToast]
    );

    const talonProps = useApp({
        handleError,
        handleIsOffline,
        handleIsOnline,
        markErrorHandled,
        renderError,
        unhandledErrors
    });

    const { hasOverlay = false, handleCloseDrawer = () => {} } = talonProps;

    if (renderError) {
        return (
            <HeadProvider>
                <StoreTitle isLazyContent={isLazyContent} />
                <Main isMasked={true} />
                <Mask isActive={true} />
                <ToastContainer />
            </HeadProvider>
        );
    }

    return (
        <HeadProvider>
            {
                !isLazyContent && (
                    <>
                        <Helmet>
                            {/* Google Tag Manager */}
                            <script>
                                {`
                                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                    })(window,document,'script','dataLayer','GTM-KXH7R829');
                                `}
                            </script>
                            {/* End Google Tag Manager */}

                            {/* CDP Web Insight script */}
                            <script type = "text/javascript" >
                                {`
                                    var _portalId = "564892373"; // Mega Market
                                    var _propId = "565018647";
                                    var _ATM_TRACKING_ASSOCIATE_UTM = 1 ;
                                    var _cdp365Analytics = { first_party_domain: ".mmvietnam.com" };
                                    (function() {
                                        var w = window;
                                        if (w.web_event) return;
                                        var a = window.web_event = function() {
                                            a.queue.push(arguments);
                                        }
                                        a.propId = _propId;
                                        a.track = a;
                                        a.queue = [];
                                        var e = document.createElement("script");
                                        e.type = "text/javascript", e.async = !0, e.src = "//st-a.cdp.asia/insight.js";
                                        var t = document.getElementsByTagName("script")[0];
                                        t.parentNode.insertBefore(e, t)
                                    })();
                                `}
                            </script>
                            <script src="https://st-a.cdp.asia/webpush.js" async=""></script>
                            <script>
                                {`
                                    window.AntsomiPush = window.AntsomiPush || [];
                                    AntsomiPush.push(function() {
                                        AntsomiPush.init({
                                            portalId: 564892373,
                                            appId: "9a48a327-0a7b-4fa5-b903-1cec3d5907d8",
                                        });
                                    });
                                `}
                            </script>
                            {/* End of CDP Web Insight script */}
                        </Helmet>
                        <Meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    </>
                )
            }
            <StoreTitle isLazyContent={isLazyContent} />
            <Canonical />
            <CommonSchema />
            {
                !isLazyContent && isMcardRoute ? (
                    <>
                        <MCardLogin />
                        <ToastContainer />
                    </>
                ) : (
                    <>
                        {
                            isLazyContent && (
                                <Style>{'.isLazyContent { display: none !important; }'}</Style>
                            )
                        }
                        <Main isMasked={hasOverlay} isLazyContent={isLazyContent}>
                            <Routes />
                        </Main>
                        {
                            !isLazyContent && (
                                <>
                                    { !isDesktop && shouldShowHeader && <Navigation /> }
                                    <Mask
                                        isActive={hasOverlay}
                                        dismiss={handleCloseDrawer}
                                        data-cy="App-Mask-button"
                                    />
                                    <ToastContainer />
                                </>
                            )
                        }
                    </>
                )
            }
        </HeadProvider>
    );
};

App.propTypes = {
    markErrorHandled: func.isRequired,
    renderError: shape({
        stack: string
    }),
    unhandledErrors: array
};

App.globalCSS = globalCSS;

export default App;
