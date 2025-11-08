import React from 'react';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useToasts} from "@magento/peregrine";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from "./voiceMicField.module.scss";
import {useIntl} from "react-intl";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const fileTooLarge = (fileOrBlob, maxBytes = MAX_BYTES) => {
    return (fileOrBlob?.size || 0) > maxBytes;
}

const blobToDataType = blob => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const [prefix, b64] = String(reader.result).split(',');
            const mime = prefix.match(/^data:(.*?);base64$/)?.[1] || blob.type || '';
            resolve({ data: b64, mime_type: mime });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const formatTime = ms => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
};

const VoiceMicField = props => {
    const {
        onChange,
        label = 'Record voice',
        absolute = false,
        processingClass = null
    } = props

    const classes = useStyle(defaultClasses, props.classes);
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    const mediaRef = React.useRef({ stream: null, recorder: null, chunks: [] });
    const [recording, setRecording] = React.useState(false);
    const [elapsed, setElapsed] = React.useState(0);
    const timerRef = React.useRef(null);

    const startTimer = () => {
        const start = Date.now();
        timerRef.current = setInterval(() => setElapsed(Date.now() - start), 250);
    };
    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsed(0);
    };

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Use WebM for recording (better browser support)
            const mime =
                MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : '';

            const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            mediaRef.current = { stream, recorder: rec, chunks: [] };

            rec.ondataavailable = e => {
                if (e.data && e.data.size > 0) mediaRef.current.chunks.push(e.data);
            };

            rec.onstop = async () => {
                try {
                    // Create WebM blob first
                    const blob = new Blob(mediaRef.current.chunks, { type: rec.mimeType || 'audio/webm' });
                    mediaRef.current.chunks = [];

                    const mb = (blob.size / (1024 * 1024)).toFixed(2);
                    if (fileTooLarge(blob, MAX_BYTES)) {
                        throw new Error(formatMessage({
                            id: "uploadFile.fileTooLarge",
                            defaultMessage: "File is too large (5MB). Please select a file ≤ 5MB."
                        }));
                    }

                    const dataType = await blobToDataType(blob);
                    onChange?.({ voice: dataType, blob }, mb);
                } catch (error) {
                    addToast({
                        type: 'error',
                        icon: errorIcon,
                        message: formatMessage({
                            id: "global.errorMessage",
                            defaultMessage: "An error occurred. Please try again."
                        }),
                        dismissable: true,
                        timeout: 7000
                    });
                    // console.log(error.message)
                } finally {
                    stream.getTracks().forEach(t => t.stop());
                }
            };

            rec.start(100); // 100ms timeslice
            setRecording(true);
            startTimer();
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: formatMessage({
                    id: "global.micNotFound",
                    defaultMessage: "You cannot access the micro. Please grant permission."
                }),
                dismissable: true,
                timeout: 7000
            });
            // console.log(error.message)
        }
    };

    const stop = () => {
        const { recorder } = mediaRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        setRecording(false);
        stopTimer();
    };

    React.useEffect(() => {
        // tránh lỗi SSR
        if (typeof document === 'undefined' || !processingClass) return;

        const body = document.body;

        if (recording) {
            body.classList.add(processingClass);
        } else {
            body.classList.remove(processingClass);
        }

        // luôn cleanup khi unmount
        return () => body.classList.remove(processingClass);
    }, [recording]);

    return (
        <>
            <div className={absolute ? `${classes.root} ${classes.rootAbsolute}` : classes.root}>
                {!recording && (
                    <button type='button' className={classes.voiceTrigger} onClick={start} title={formatMessage({ id: 'voice.trigger', defaultMessage: 'Microphone' })}><span>{label}</span></button>
                )}
                {recording && (
                    // <span className={classes.recording}>Đang ghi: {formatTime(elapsed)}</span>
                    <div className={classes.recordingIcon}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
            {!!recording && (
                <button type='button' className={classes.voicePause} onClick={stop} title={formatMessage({ id: 'voice.stopTrigger', defaultMessage: 'Stop and Submit' })}><span>{'Stop'}</span></button>
            )}
        </>
    );
}
export default VoiceMicField
