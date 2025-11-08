import React, {useCallback, useEffect, useState} from 'react';
import {
    AlertCircle as AlertCircleIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {useToasts} from "@magento/peregrine";
import {useIntl} from "react-intl";
import {useHistory} from "react-router-dom";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {saveToStorage} from "./searchAISession";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const keyword_only = false;

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

export const useSearchAIByVoice = props => {
    const {
        handleCloseSearchAI
    } = props;

    const history = useHistory();
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const storeViewCode = storage.getItem('store_view_code');
    const [loading, setLoading] = useState(false);
    const [voiceName, setVoiceName] = useState(null);
    const [payload, setPayload] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);

    const mediaRef = React.useRef({ stream: null, recorder: null, chunks: [] });
    const discardRef = React.useRef(false);
    const [recording, setRecording] = React.useState(false);
    const [elapsed, setElapsed] = React.useState(0);
    const timerRef = React.useRef(null);

    const callThirdParty = useCallback(async ({ text, voice, ms }) => {
        if (!REACT_APP_AI_SEARCH_URL) return [];
        const url = `${REACT_APP_AI_SEARCH_URL}semantic_search`;
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': REACT_APP_AI_SEARCH_KEY ? `Bearer ${REACT_APP_AI_SEARCH_KEY}` : undefined,
                    'store': storeViewCode || ''
                },
                body: JSON.stringify({
                    text,
                    voice,
                    keyword_only
                }),
                signal: controller.signal
            });

            clearTimeout(t);
            if (!res.ok) return [];
            const json = await res.json();
            if (keyword_only) {
                return Array.isArray(json) ? json : [];
            }
            return json?.queries && Array.isArray(json.queries) ? json.queries : [];
        } catch {
            clearTimeout(t);
            return [];
        }
    }, []);

    const callThirdPartyWithTimeout = useCallback((args, ms = 45000) => {
        const controller = new AbortController();
        const p = callThirdParty({ ...args, ms, signal: controller.signal });
        return new Promise((resolve, reject) => {
            const id = setTimeout(() => { controller.abort(); reject(new Error('TIMEOUT')); }, ms);
            p.then(v => { clearTimeout(id); resolve(v); })
                .catch(e => { clearTimeout(id); reject(e); });
        });
    }, [callThirdParty]);

    const startTimer = () => {
        const start = Date.now();
        timerRef.current = setInterval(() => setElapsed(Date.now() - start), 250);
    };
    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsed(0);
    };

    const cleanup = () => {
        const { stream, recorder } = mediaRef.current;
        if (recorder) {
            recorder.ondataavailable = null;
            recorder.onstop = null;
        }
        if (stream) stream.getTracks().forEach(t => t.stop());
        mediaRef.current = { stream: null, recorder: null, chunks: [] };
        setRecording(false);
        stopTimer();
    };

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mime =
                MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : '';

            const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            mediaRef.current = { stream, recorder: rec, chunks: [] };
            discardRef.current = false;

            rec.ondataavailable = e => {
                if (e.data && e.data.size > 0) mediaRef.current.chunks.push(e.data);
            };
            rec.onstop = async () => {
                const s = mediaRef.current.stream;
                if (discardRef.current) {
                    mediaRef.current.chunks = [];
                    if (s) s.getTracks().forEach(t => t.stop());
                    return;
                }
                try {
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
                    if (s) s.getTracks().forEach(t => t.stop());
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

    const handleClose = () => {
        discardRef.current = true;
        const { recorder } = mediaRef.current;
        if (recorder && recorder.state === 'recording') {
            recorder.ondataavailable = null;
            recorder.onstop = null;
            recorder.stop();
        }
        cleanup();
        setPayload({});
        setLoading(false);
        setVoiceName(null);
        handleCloseSearchAI();
    };

    const onChange = useCallback(async (data, name) => {
        setPayload(prev => ({ ...prev, ...data }));
        setVoiceName(typeof name === 'string' ? name : '')

        // Submit
        setErrorMessage(null);
        if (!data) {
            setErrorMessage(
                formatMessage({
                    id: 'searchAIDialog.notFoundMessage',
                    defaultMessage: "I don't understand your request. Please enter your product related request"
                })
            )
            return
        }

        setLoading(true);

        try {
            const result = await callThirdPartyWithTimeout({
                text: '',
                voice: data?.voice
            }, 45000);

            if (Array.isArray(result) && result.length > 0) {
                if (keyword_only) {
                    const keywords = [
                        ...new Set(
                            (result || [])
                                .map(x => (x || '').trim())
                                .filter(Boolean)
                        )
                    ]
                    const encodedKeywords = encodeURIComponent(keywords.join(','));

                    const resultUrl = `/search.html?query=${keywords[0]}&keywords=${encodedKeywords}`;
                    saveToStorage(result.filter(Boolean).join(', ') || formatMessage({ id: 'global.aiSearch', defaultMessage: 'Search by AI' }), resultUrl);
                    history.push(resultUrl);
                    setPayload({});
                    setLoading(false);
                    handleCloseSearchAI();
                } else {
                    const b64urlEncode = s => btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_,p1)=>String.fromCharCode('0x'+p1))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')

                    const buildSearchHref = result => {
                        const keywords = result.map(x => x.keyword).filter(Boolean)
                        const keywordsParam = encodeURIComponent(keywords.join(','))
                        const kwmetaParam = b64urlEncode(JSON.stringify(result))
                        const first = encodeURIComponent(keywords[0] || '')
                        return `/search.html?query=${first}&keywords=${keywordsParam}&kwmeta=${kwmetaParam}`
                    }

                    const resultUrl = buildSearchHref(result);
                    saveToStorage(result?.map(x => x.keyword)?.filter(Boolean).join(', ') || formatMessage({ id: 'global.aiSearch', defaultMessage: 'Search by AI' }), resultUrl)
                    history.push(resultUrl);
                    setPayload({});
                    setLoading(false);
                    handleCloseSearchAI();
                }
            } else {
                setErrorMessage(
                    formatMessage({
                        id: 'searchAIDialog.notFoundMessage',
                        defaultMessage: "I don't understand your request. Please enter your product related request"
                    })
                )
                setLoading(false);
            }
        } catch (e) {
            setErrorMessage(formatMessage({ id: 'searchAIDialog.error', defaultMessage: 'Sorry, our AI Search is currently experiencing issues. Please try again later or use the regular search.' }));
            setLoading(false);
        }
    }, [callThirdParty, handleCloseSearchAI]);

    useEffect(() => {
        if (!errorMessage) return;
        const id = setTimeout(() => setErrorMessage(null), 10000);
        return () => clearTimeout(id);
    }, [errorMessage]);

    return {
        start,
        stop,
        recording,
        handleClose,
        payload,
        setPayload,
        voiceName, setVoiceName,
        loading, setLoading,
        errorMessage,
        setErrorMessage
    }

    //<div className={absolute ? `${classes.root} ${classes.rootAbsolute}` : classes.root}>
    //    {!recording && (
    //        <button type='button' className={classes.voiceTrigger} onClick={start}><span>{label}</span></button>
    //    )}
    //    {recording && <span className={classes.recording}>Đang ghi: {formatTime(elapsed)}</span>}
    //</div>
    //{!!recording && (
    //    <button type='button' className={classes.voicePause} onClick={stop}><span>{'Stop'}</span></button>
    //)}
}
