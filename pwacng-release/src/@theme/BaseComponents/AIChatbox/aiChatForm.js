import React, {useLayoutEffect, useRef, useCallback} from "react";
import defaultClasses from './aiChatForm.module.scss';
import {mergeClasses} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import UploadImageField from "../UploadImageField/uploadImageField";
import UploadFileField from "../UploadFileField/uploadFileField";
import VoiceTextField from "../VoiceTextField/voiceTextField";
import {Form} from "informed";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import { useImageUploadUtils } from "./imageUploadUtils";

const AIChatForm = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const {
        processing,
        searchKey,
        setSearchKey,
        searchKeyInput,
        setSearchKeyInput,
        payload,
        setPayload,
        imageResetKey,
        setImageResetKey,
        imageName,
        setImageName,
        fileResetKey,
        setFileResetKey,
        fileName,
        setFileName,
        voiceName,
        setVoiceName,
        handleFile,
        handleImage,
        handleVoice,
        removeAll,
        handleConfirm,
        getImageSrc,
        handleNewSession,
        sessionTooLarge
    } = props

    const { isMobile } = useMediaCheck();
    const { formatMessage } = useIntl();
    const formDisabled = processing || sessionTooLarge;

    // Image upload utilities
    const { processImageFile, getImageFromClipboard } = useImageUploadUtils();

    const useAutoResize = (value) => {
        const ref = useRef(null);
        const fit = useCallback(() => {
            const el = ref.current;
            if (!el) return;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        }, []);
        useLayoutEffect(() => { fit(); }, [value, fit]);
        return { ref, fit };
    }

    const { ref: taRef, fit } = useAutoResize(searchKeyInput);

    // Handle paste event for textarea
    const handlePaste = useCallback(async (e) => {
        if (processing || !handleImage) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const imageFile = await getImageFromClipboard(clipboardData);
        if (imageFile) {
            e.preventDefault(); // Prevent default paste behavior for images
            await processImageFile(imageFile, handleImage);
        }
    }, [processing, getImageFromClipboard, processImageFile, handleImage]);

    return (
        <Form className={sessionTooLarge ? `${classes.root} ${classes.rootDisabled}` : classes.root} onSubmit={(values) => {
            if (formDisabled) {
                // Chặn submit
                return;
            }
            handleConfirm(values);
        }}>
            {!!sessionTooLarge && (
                <div className={classes.sessionTooLargeMessage}>
                    <FormattedMessage
                        id={'chatbot.sessionTooLargeText'}
                        defaultMessage={'The conversation is too long. '}
                    />
                    <FormattedMessage
                        id={'chatbot.sessionTooLargeSelect'}
                        defaultMessage={'Please select '}
                    />
                    {'"'}<button type="button" className={classes.newSession} onClick={handleNewSession}
                            data-title={formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
                    ><span><FormattedMessage id={'chatbot.sessionTooLargeBtn'} defaultMessage={'Start new conversation'}/></span></button>{'"'}
                    <FormattedMessage
                        id={'chatbot.sessionTooLargeContinue'}
                        defaultMessage={' to continue'}
                    />
                </div>
            )}
            {payload?.voice?.data && (
                <div className={classes.attachment}>
                    <p className={classes.attachmentName}>
                        <span className={classes.voiceName}>{voiceName ? `voice - ${voiceName}MB` : 'voice'}</span>
                        <button type="button" className={classes.remove}
                                title={formatMessage({ id: 'global.remove', defaultMessage: 'Remove' })}
                                onClick={() => {
                                    setPayload(prev => {
                                        const { voice, ...rest } = prev;
                                        return rest;
                                    })
                                    setVoiceName(null);
                                }}
                        ><span>Remove</span></button>
                    </p>
                </div>
            )}
            {payload?.file?.data && (
                <div className={classes.previewFile}>
                    <p className={classes.file}>
                        <span>{fileName || 'file.png'}</span>
                        <button type="button" className={classes.remove}
                                title={formatMessage({ id: 'global.remove', defaultMessage: 'Remove' })}
                                onClick={() => {
                                    setPayload(prev => {
                                        const { file, ...rest } = prev;
                                        return rest;
                                    });
                                    setFileName(null);
                                    setFileResetKey(k => k + 1);
                                }}
                        ><span>Remove</span></button>
                    </p>
                </div>
            )}
            <div className={`${classes.chatForm} ${processing ? classes.chatFormProcessing : ''}`}>
                {/*<button type="button" className={classes.newSession} onClick={handleNewSession}
                        data-title={formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
                ><span className={classes.textVisible}>×</span></button>*/}
                <div className={classes.chatFormInner}>
                    <div className={classes.imageField}>
                        {payload?.image?.data && (
                            <>
                                <img className={classes.previewImage} src={getImageSrc(payload.image)} alt={imageName || 'image.png'}/>
                                <button type="button" className={classes.remove}
                                        title={formatMessage({ id: 'global.remove', defaultMessage: 'Remove' })}
                                        onClick={() => {
                                            setPayload(prev => {
                                                const { image, ...rest } = prev;
                                                return rest;
                                            });
                                            setImageName(null);
                                            setImageResetKey(k => k + 1);
                                        }}
                                ><span>Remove</span></button>
                            </>
                        )}
                        <UploadImageField onChange={handleImage} imageResetKey={imageResetKey}/>
                    </div>
                    <div className={classes.imageField}>
                        <UploadFileField onChange={handleFile} fileResetKey={fileResetKey}/>
                    </div>
                    <label className={classes.field}>
                        <textarea
                            rows="1"
                            ref={taRef}
                            className={classes.inputText}
                            placeholder={
                                isMobile ? formatMessage({
                                        id: 'aiChat.placeholderMobile',
                                        defaultMessage: 'Enter the information you want to search...'
                                    }) : formatMessage({
                                        id: 'aiChat.placeholder',
                                        defaultMessage: 'Enter the information you want to search for'
                                    })
                            }
                            value={searchKeyInput}
                            onInput={fit}
                            onPaste={handlePaste}
                            onChange={(e) => {
                                setSearchKeyInput(e.target.value || '');
                                setSearchKey((e.target.value)?.trim() || '');
                            }}
                            onKeyDown={(e) => {
                                // Submit form on Enter key (without Shift)
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault(); // Prevent new line

                                    // Check if form can be submitted
                                    if (!processing && (searchKey || payload?.image?.data || payload?.file?.data || payload?.voice?.data)) {
                                        // Create a synthetic form submission
                                        const form = e.target.closest('form');
                                        if (form) {
                                            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                            form.dispatchEvent(submitEvent);
                                        }
                                    }
                                }
                                // Allow Shift+Enter for new line (default behavior)
                            }}
                        />
                    </label>
                    <div className={classes.voiceField}>
                        <VoiceTextField onChange={handleVoice} processingClass={'is-voice-recording'} />
                    </div>
                    <button
                        type='submit'
                        className={classes.submit}
                        disabled={processing || (!searchKey && !payload?.image?.data && !payload?.file?.data && !payload?.voice?.data)}
                        title={formatMessage({ id: 'aiChatBox.submit', defaultMessage: 'Submit' })}
                    >
                            <span>
                                <FormattedMessage
                                    id={'global.search'}
                                    defaultMessage={'Search'}
                                />
                            </span>
                    </button>
                </div>
            </div>
        </Form>
    )
}

export default AIChatForm
