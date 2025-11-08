import React, {useState, useEffect} from "react";
import { createPortal } from "react-dom";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchAIByVoice.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import {useSearchAIByVoice} from "./useSearchAIByVoice";

const SearchAIByVoice = props => {
    const {
        isSearchVoiceOpen,
        handleOpenSearchVoice,
        handleCloseSearchAI,
        triggerRef
    } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const talonProps = useSearchAIByVoice({
        handleCloseSearchAI
    });
    const {
        start,
        stop,
        recording,
        handleClose,
        payload,
        setPayload,
        voiceName,
        setVoiceName,
        loading,
        errorMessage
    } = talonProps;

    const [portalTarget, setPortalTarget] = useState(null);

    useEffect(() => {
        setPortalTarget(triggerRef && triggerRef.current ? triggerRef.current : null);
    }, [triggerRef]);

    const trigger = (
        <button
            type='button'
            className={classes.searchByVoice}
            title={formatMessage({
                id: 'searchBar.searchByVoice',
                defaultMessage: 'Search by voice'
            })}
            onClick={(e) => {
                e.preventDefault();
                handleOpenSearchVoice();
                start();
            }}
        >
            <span>{'Search by voice'}</span>
        </button>
    );
    return (
        <>
            {portalTarget ? createPortal(trigger, portalTarget) : trigger}

            {isSearchVoiceOpen && (
                <div className={classes.root} data-cy="SearchAIByVoice-root">
                    <button type='button' className={classes.closeOverlay} onClick={handleClose}><span>{'Close'}</span></button>
                    <div className={classes.inner}>
                        <div className={classes.searchAIHead}>
                            <strong className={classes.searchTitle}>
                                <FormattedMessage
                                    id={'searchBar.searchWithVoice'}
                                    defaultMessage={'Tell me your needs'}
                                />
                            </strong>
                            <button type='button' className={classes.close} onClick={handleClose}><span>{'Close'}</span></button>
                        </div>
                        <div className={classes.messageWrapper}>
                            {!!errorMessage && (<p className={classes.error}>{errorMessage}</p>)}
                        </div>
                        <div className={classes.attachmentWrapper}>
                            {recording ? (
                                <>
                                    <span className={classes.recording}>
                                        <FormattedMessage
                                            id={'searchAI.searchRecording'}
                                            defaultMessage={"I'm listening, please stop when done"}
                                        />
                                    </span>
                                    <button
                                        type='button'
                                        className={classes.submit}
                                        onClick={() => {
                                            stop();
                                        }}
                                    ><span>{'Submit'}</span></button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type='button'
                                        className={classes.start}
                                        onClick={start}
                                    ><span>{'Start'}</span></button>
                                </>
                            )}
                        </div>
                        {!!loading && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchAIByVoice;
