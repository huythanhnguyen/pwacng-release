import React, {useState, useEffect, useCallback} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './sideBar.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import { getAllSession, clearAllSession, removeSession } from "./searchAISession";
import {Link} from "react-router-dom";
import Dialog from "@magento/venia-ui/lib/components/Dialog";

const SideBar = (props) => {
    const {resetForm = () => {}} = props;
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const { isMobile } = useMediaCheck();
    const [historyItems, setHistoryItems] = useState([]);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        setHistoryItems(getAllSession() || []);
    }, [isOpen]);

    const toggleSidebar = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleResetForm = useCallback(() => {
        resetForm();
        setIsOpen(false);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleOverlayClick = useCallback(e => {
        if (e.target === e.currentTarget) {
            closeSidebar();
        }
    }, [closeSidebar]);

    const handleRemoveOne = useCallback((title, url) => {
        const list = removeSession(title, url);
        setHistoryItems(list);
    }, []);

    const handleClearAll = useCallback(() => {
        setDeleteConfirm(true);
    }, []);

    return (
        <>
            {isOpen && isMobile && (
                <div className={classes.overlay} onClick={handleOverlayClick} />
            )}
            <Dialog
                confirmTranslationId={'global.confirm'}
                confirmText="Confirm"
                isOpen={!!(deleteItem?.title && deleteItem?.url)}
                onCancel={() => setDeleteItem(null)}
                onConfirm={() => {
                    handleRemoveOne(deleteItem.title, deleteItem.url);
                    setDeleteItem(null);
                }}
                shouldDisableAllButtons={false}
                title={formatMessage({ id: 'global.notification', defaultMessage: 'Notification' })}
                setScrollLock={false}
                zIndex={true}
            >
                <div className={classes.deleteConfirmInner}>
                    <h3>
                        <FormattedMessage
                            id={'searchAiHistory.deleteItem'}
                            defaultMessage={'Delete search'}
                        />
                    </h3>
                    <FormattedMessage
                        id={'searchAiHistory.deleteConfirm'}
                        defaultMessage={'Are you sure you want to delete the search results?'}
                    />
                </div>
            </Dialog>
            <Dialog
                confirmTranslationId={'global.confirm'}
                confirmText="Confirm"
                isOpen={deleteConfirm}
                onCancel={() => setDeleteConfirm(false)}
                onConfirm={() => {
                    clearAllSession();
                    setHistoryItems([]);
                    setDeleteConfirm(false);
                }}
                shouldDisableAllButtons={false}
                title={formatMessage({ id: 'global.notification', defaultMessage: 'Notification' })}
                setScrollLock={false}
                zIndex={true}
            >
                <div className={classes.deleteConfirmInner}>
                    <h3>
                        <FormattedMessage
                            id={'searchAiHistory.deleteAll'}
                            defaultMessage={'Delete all searches'}
                        />
                    </h3>
                    <FormattedMessage
                        id={'searchAiHistory.deleteConfirm'}
                        defaultMessage={'Are you sure you want to delete the search results?'}
                    />
                </div>
            </Dialog>

            {isMobile && (
                <div className={classes.actionsMobile}>
                    <div className={classes.actions}>
                        <button
                            className={classes.resetButton}
                            onClick={handleResetForm}
                            aria-label={formatMessage({ id: 'searchAI.sidebar.reset', defaultMessage: 'Reset form' })}
                        >
                            <span>Reset form</span>
                        </button>
                        <button
                            className={classes.toggleButton}
                            onClick={toggleSidebar}
                            aria-label={formatMessage({ id: 'searchAI.sidebar.toggle', defaultMessage: 'Toggle sidebar' })}
                        >
                            <span>Toggle sidebar</span>
                        </button>
                    </div>
                </div>
            )}

            <div className={isOpen ? classes.sidebarOpen : classes.sidebar}>
                <div className={classes.actions}>
                    <button
                        className={classes.resetButton}
                        onClick={handleResetForm}
                        aria-label={formatMessage({ id: 'searchAI.sidebar.reset', defaultMessage: 'Reset form' })}
                    >
                        <span>Reset form</span>
                    </button>
                    <button
                        className={classes.toggleButton}
                        onClick={toggleSidebar}
                        aria-label={formatMessage({ id: 'searchAI.sidebar.toggle', defaultMessage: 'Toggle sidebar' })}
                    >
                        <span>Toggle sidebar</span>
                    </button>
                    {(isOpen || isMobile) && (
                        <button
                            className={classes.removeButton}
                            onClick={handleClearAll}
                            aria-label={formatMessage({ id: 'searchAI.sidebar.remove', defaultMessage: 'Remove history' })}
                        >
                            <span>Remove history</span>
                        </button>
                    )}
                </div>

                {(isOpen || isMobile) && (
                    <div className={classes.sidebarInner}>
                        <div className={classes.sidebarHeader}>
                            <h3 className={classes.sidebarTitle}>
                                <FormattedMessage id="searchAI.historyTitle" defaultMessage="AI Search History" />
                            </h3>
                        </div>

                        <div className={classes.sidebarContent}>
                            {historyItems?.length ? (
                                <div className={classes.historySection}>
                                    <ul className={classes.historyList}>
                                        {historyItems.map((item, index) => (
                                            <li className={classes.historyItem} key={index}>
                                                <Link to={item.url} title={item.title} className={classes.text}>{item.title}</Link>
                                                <button
                                                    type="button"
                                                    className={classes.remove}
                                                    title={formatMessage({ id: 'global.remove', defaultMessage: 'Remove' })}
                                                    onClick={() => setDeleteItem({title: item.title, url: item.url})}
                                                >
                                                  <span>
                                                    <FormattedMessage id="global.remove" defaultMessage="Remove" />
                                                  </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className={classes.historyEmpty}>
                                    <FormattedMessage id="searchAI.historyEmpty" defaultMessage="History is currently empty" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SideBar;
