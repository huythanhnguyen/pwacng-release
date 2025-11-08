import React, {useState, useEffect} from "react";
import defaultClasses from './actionsSticky.module.scss';
import {mergeClasses} from "@magento/venia-ui/lib/classify";
import {FormattedMessage} from "react-intl";
import {Link, useLocation} from "react-router-dom";
import FreshChat from 'react-freshchat'
import {useUserContext} from "@magento/peregrine/lib/context/user";
import AIChatbox from "../AIChatbox/aiChatbox";

const collapse = true;
const ActionsSticky = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const location = useLocation();
    const [{ isSignedIn }] = useUserContext();
    const [chatbotOpened, setChatbotOpened] = useState(false)

    const isOrderTrackingPage = location.pathname.includes('/order-tracking');

    useEffect(() => {
        const hide = () => {
            document.querySelectorAll("freshchat-widget").forEach(el => {
                el.style.display = "none";
                el.style.visibility = "hidden";
                el.style.pointerEvents = "none";
            });
        };
        hide();
        const mo = new MutationObserver(hide);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => mo.disconnect();
    }, []);

    const handleCloseChat = () => {
        if (window.fcWidget) {
            window.fcWidget.close(); // Mở cửa sổ chat
        }
    }

    const handleChat = () => {
        if (window.fcWidget) {
            setChatbotOpened(false);
            window.fcWidget.open(); // Mở cửa sổ chat
        } else {
            console.error("Freshchat widget is not loaded.");
        }
    }

    return (
        <div className={classes.root}>
            {!collapse && (
                <>
                    <div className={`${classes.item} ${classes.backToTop}`} onClick={() => window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    })}>
                        <span>
                            <FormattedMessage
                                id={'global.scrollToTop'}
                                defaultMessage={'Scroll to top'}
                            />
                        </span>
                    </div>
                    { isSignedIn && (
                        <div className={classes.item}>
                            <img src={CartSticky} alt={''} />
                            <FormattedMessage
                                id={'global.quickOrder'}
                                defaultMessage={'Quick order'}
                            />
                        </div>
                    )}
                    {isOrderTrackingPage ? (
                        <a className={`${classes.item} ${classes.trackingOrder}`} onClick={() => window.location.reload()}>
                            <span>
                                <FormattedMessage
                                    id={'global.orderTracking'}
                                    defaultMessage={'Tracking order'}
                                />
                            </span>
                        </a>
                    ) : (
                        <Link className={`${classes.item} ${classes.trackingOrder}`} to={'/order-tracking'}>
                            <span>
                                <FormattedMessage
                                    id={'global.orderTracking'}
                                    defaultMessage={'Tracking order'}
                                />
                            </span>
                        </Link>
                    )}
                </>
            )}
            <AIChatbox
                chatbotOpened={chatbotOpened}
                setChatbotOpened={setChatbotOpened}
                handleChat={handleChat}
                handleCloseChat={handleCloseChat}
            />
            <div className={`${classes.item} ${classes.chatSupport}`} onClick={handleChat}>
                <span>
                    <FormattedMessage
                        id={'global.support'}
                        defaultMessage={'Support'}
                    />
                </span>
            </div>
            <FreshChat
                token={'c13cbcd7-4e53-42eb-8ec8-637d9e335c42'}
            />
        </div>
    )
}

export default ActionsSticky
