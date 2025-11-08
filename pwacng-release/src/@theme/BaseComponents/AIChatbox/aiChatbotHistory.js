import React, {useState, useEffect, useRef} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './aiChatbotHistory.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";

const AIChatbotHistory = props => {
    const {
        opened,
        setOpened,
        sessionId,
        setSessionId,
        chatbotHistory,
        setChatbotHistory,
        historyKeyword,
        setHistoryKeyword,
        handleGetHistory,
        handleNewSession,
        handleSwitchSession,
        handleDeteleSession,
        handleDeteleAllSession
    } = props;
    const classes = useStyle(defaultClasses);
    const { formatMessage } = useIntl();
    const { isMobile } = useMediaCheck();

    const settingsRef = useRef(null);

    const [searchValue, setSearchValue] = useState('');
    const [deleteSessionId, setDeleteSessionId] = useState(null);
    const [deleteSessionAll, setDeleteSessionAll] = useState(false);

    const [settingShow, setSettingShow] = useState(false);

    useEffect(() => {
        const handleOutside = e => {
            if (!settingShow) return;
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setSettingShow(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, [settingShow]);

    const removeVietnameseTones = str => {
        return str
            .normalize('NFD') // chuẩn hóa unicode tổ hợp
            .replace(/[\u0300-\u036f]/g, '') // xóa các dấu
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const handleSearchSubmit = (value) => {
        const keyword = value.trim();
        // const keyword = removeVietnameseTones(value.trim().toLowerCase());
        setSearchValue(value);
        setHistoryKeyword(keyword);
        handleGetHistory(keyword);
    };

    return (
        <>
            <Dialog
                confirmTranslationId={'global.confirm'}
                confirmText="Confirm"
                isOpen={!!deleteSessionId}
                onCancel={() => setDeleteSessionId(null)}
                onConfirm={() => {
                    handleDeteleSession({id: deleteSessionId});
                    setDeleteSessionId(null);
                }}
                shouldDisableAllButtons={false}
                title={formatMessage({ id: 'global.notification', defaultMessage: 'Notification' })}
                setScrollLock={false}
                zIndex={true}
            >
                <div className={classes.deleteConfirmInner}>
                    <h3>
                        <FormattedMessage
                            id={'aiHistory.delete'}
                            defaultMessage={'Delete chat'}
                        />
                    </h3>
                    <FormattedMessage
                        id={'aiHistory.deleteConfirm'}
                        defaultMessage={'Are you sure you want to delete this chat?'}
                    />
                </div>
            </Dialog>
            <Dialog
                confirmTranslationId={'global.confirm'}
                confirmText="Confirm"
                isOpen={!!deleteSessionAll}
                onCancel={() => {
                    setSettingShow(false);
                    setDeleteSessionAll(false);
                }}
                onConfirm={() => {
                    handleDeteleAllSession();
                    setSettingShow(false);
                    setDeleteSessionAll(false);
                }}
                shouldDisableAllButtons={false}
                title={formatMessage({ id: 'global.notification', defaultMessage: 'Notification' })}
                setScrollLock={false}
                zIndex={true}
            >
                <div className={classes.deleteConfirmInner}>
                    <h3>
                        <FormattedMessage
                            id={'aiHistory.deleteAll'}
                            defaultMessage={'Delete all chat'}
                        />
                    </h3>
                    <FormattedMessage
                        id={'aiHistory.deleteAllConfirm'}
                        defaultMessage={'Are you sure you want to delete all chat history?'}
                    />
                </div>
            </Dialog>
            <div className={opened ? classes.root_open : classes.root}>
                <div className={classes.inner}>
                    <div className={classes.head}>
                        <p className={classes.headInner}>
                            <strong>
                                <FormattedMessage
                                    id={'aiHistory.head'}
                                    defaultMessage={'Chat history'}
                                />
                            </strong>
                            <button type='button' className={classes.close} onClick={() => setOpened(false)} title={formatMessage({ id: 'global.close', defaultMessage: 'Close' })}>
                                <span>
                                    <FormattedMessage
                                        id={'global.close'}
                                        defaultMessage={'Close'}
                                    />
                                </span>
                            </button>
                        </p>
                        <div className={classes.searchInput}>
                            <div className={classes.inputWrap}>
                                <input
                                    name="search"
                                    id={classes.search}
                                    placeholder={formatMessage({ id: 'aiHistory.search', defaultMessage: 'Search' })}
                                    value={searchValue}
                                    onChange={e => handleSearchSubmit(e.target.value)}
                                />
                                <span className={historyKeyword ? classes.clear : classes.searchIcon} onClick={() => handleSearchSubmit('')}><span>Clear</span></span>
                            </div>
                            <div className={classes.settings} ref={settingsRef}>
                                <button type='button' onClick={() => setSettingShow(prev => !prev)} className={classes.settingTrigger}><span>Settings</span></button>
                                {settingShow ? (
                                    <div className={classes.settingDropdown}>
                                        <button className={classes.removeAll} onClick={() => setDeleteSessionAll(true)}>
                                            <span>
                                                <FormattedMessage
                                                    id={'global.removeAll'}
                                                    defaultMessage={'Remove all'}
                                                />
                                            </span>
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <button type="button" className={classes.newSession} onClick={() => {
                            handleNewSession({magentoSessionId: null});
                            if (isMobile) {
                                setOpened(false);
                            }
                        }}
                            data-title={formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
                        >
                            <span>
                                <FormattedMessage
                                    id={'aiChatboxHistory.newSession'}
                                    defaultMessage={'New conversation'}
                                />
                            </span>
                        </button>
                    </div>
                    <div className={classes.content}>
                        {(chatbotHistory || []).filter(it => (it.title || '').trim() !== '').length > 0 ? (
                            <ul className={classes.items}>
                                {(chatbotHistory || []).filter(it => (it.title || '').trim() !== '').map(item => (
                                    <li key={item.session_id} className={sessionId === item.session_id ? `${classes.item} ${classes.itemActive}` : classes.item}>
                                        <span className={(item.token_count && item.token_count > 100000) ? `${classes.itemName} ${classes.tokenTooLarge}` : classes.itemName}
                                              onClick={() => {
                                                  handleSwitchSession({sessionTarget: item.session_id, tooLarger: !!(item.token_count && item.token_count > 100000)});
                                                  if (isMobile) {
                                                      setOpened(false);
                                                  }
                                              }}>
                                            <span>{item.title}</span>
                                        </span>
                                        <button onClick={() => setDeleteSessionId(item.session_id)} className={classes.remove}>
                                            <span>
                                                <FormattedMessage
                                                    id={'global.remove'}
                                                    defaultMessage={'Remove'}
                                                />
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={classes.empty}>
                                { historyKeyword ? (
                                    <>
                                        <FormattedMessage
                                            id={'aiHistory.searchEmpty'}
                                            defaultMessage={'No history found with the keyword '}
                                        /><br/>
                                        {`"${historyKeyword}"`}
                                    </>
                                ) : (
                                    <FormattedMessage
                                        id={'aiHistory.empty'}
                                        defaultMessage={'History is currently empty'}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChatbotHistory;
