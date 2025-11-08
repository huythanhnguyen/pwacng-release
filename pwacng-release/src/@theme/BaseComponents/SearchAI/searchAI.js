import React, {useState, useEffect, useCallback, useRef} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchAI.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import {useHistory} from "react-router-dom";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import UploadImageField from "../UploadImageField/uploadImageField";
import VoiceMicField from "../VoiceMicField/voiceMicField";
import {Form} from "informed";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import SideBar from "./sideBar";
import {
    saveToStorage
} from "./searchAISession";
import { useImageUploadUtils } from "../AIChatbox/imageUploadUtils";


const keyword_only = false;

const SearchAI = () => {
    const classes = useStyle(defaultClasses);
    const history = useHistory();
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const storeViewCode = storage.getItem('store_view_code');
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState('');
    const [searchKeyInput, setSearchKeyInput] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [imageResetKey, setImageResetKey] = useState(0);
    const [imageName, setImageName] = useState(null);
    const [voiceName, setVoiceName] = useState(null);
    const [payload, setPayload] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const textareaRef = useRef(null);
    const chatWrapperRef = useRef(null);

    // Image upload utilities
    const { processImageFile, getImageFromClipboard, getImageFromDataTransfer } = useImageUploadUtils();

    // Drag and drop state
    const [isDragOver, setIsDragOver] = useState(false);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if we're leaving the container entirely
        if (!chatWrapperRef.current?.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (loading) return; // Don't allow drops while loading

        const imageFile = getImageFromDataTransfer(e.dataTransfer);
        if (imageFile && handleImage) {
            await processImageFile(imageFile, handleImage);
        }
    }, [loading, getImageFromDataTransfer, processImageFile]);

    // Handle paste event for textarea
    const handlePaste = useCallback(async (e) => {
        if (loading) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const imageFile = await getImageFromClipboard(clipboardData);
        if (imageFile) {
            e.preventDefault(); // Prevent default paste behavior for images
            await processImageFile(imageFile, handleImage);
        }
    }, [loading, getImageFromClipboard, processImageFile]);

    useEffect(() => {
        if (!errorMessage) return;
        const id = setTimeout(() => setErrorMessage(null), 10000);
        return () => clearTimeout(id);
    }, [errorMessage]);

    const callThirdParty = useCallback(async ({ text, image, voice, ms }) => {
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
                    image,
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

    const handleImage = (data, name) => {
        setPayload(prev => ({ ...prev, ...data }));
        setImageName(typeof name === 'string' ? name : '');
    };
    const handleVoice = useCallback((data, name) => {
        const payloadData = { ...payload, ...data };
        setPayload(prev => ({ ...prev, ...data }));
        setVoiceName(typeof name === 'string' ? name : '');
        handleConfirmDialog({searchKey, payloadData});
    }, [payload, searchKey]);

    const removeAll = () => {
        setPayload({});
        setSearchKeyInput('');
        setSearchKey('');
    };

    const resetFormAndFocus = useCallback(() => {
        removeAll();
        requestAnimationFrame(() => textareaRef.current?.focus());
    }, [removeAll]);

    const handleConfirmDialog = useCallback(
    async ({searchText = searchKey, payloadData = payload}) => {

        setErrorMessage(null);
        if (!searchText && !payloadData?.image?.data && !payloadData?.voice?.data) {
            setShowErrorMessage(true);
            return;
        }
        setShowErrorMessage(false);
        setLoading(true);

        try {
            const result = await callThirdPartyWithTimeout({
                text: searchText || '',
                image: payloadData?.image,
                voice: payloadData?.voice
            }, 45000);

            if (Array.isArray(result) && result.length > 0) {
                if (keyword_only) {
                    const keywords = [
                        ...new Set(
                            (result || [])
                                .map(x => (x || '').trim())
                                .filter(Boolean)
                        )
                    ];
                    const encodedKeywords = encodeURIComponent(keywords.join(','));
                    const resultUrl = `/search.html?query=${keywords[0]}&keywords=${encodedKeywords}`;
                    saveToStorage(searchText || result.filter(Boolean).join(', ') || formatMessage({ id: 'global.aiSearch', defaultMessage: 'Search by AI' }), resultUrl);
                    history.push(resultUrl);
                    setPayload({});
                    setLoading(false);
                } else {
                    const b64urlEncode = s => btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_,p1)=>String.fromCharCode('0x'+p1))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')

                    const buildSearchHref = result => {
                        const keywords = result.map(x => x.keyword).filter(Boolean)
                        const keywordsParam = encodeURIComponent(keywords.join(','))
                        const kwmetaParam = b64urlEncode(JSON.stringify(result));
                        const first = encodeURIComponent(keywords[0] || '')
                        const firstFilterName = result?.[0]?.filter?.[0]?.filter_by || '';
                        const firstFilterValue = encodeURIComponent(result?.[0]?.filter?.[0]?.value || '');
                        return `/search.html?query=${first}${firstFilterName && firstFilterValue ? `&filter_${firstFilterName}=${firstFilterValue}` : ''}&keywords=${keywordsParam}&kwmeta=${kwmetaParam}`;
                    }

                    const resultUrl = buildSearchHref(result);
                    saveToStorage(searchText || result?.map(x => x.keyword)?.filter(Boolean).join(', ') || formatMessage({ id: 'global.aiSearch', defaultMessage: 'Search by AI' }), resultUrl)
                    history.push(resultUrl);
                    setPayload({});
                    setLoading(false);
                }
            } else if (searchText) {
                const resultUrl = `/search.html?query=${searchText}`;
                saveToStorage(searchText, resultUrl);
                history.push(resultUrl);
                setPayload({});
                setLoading(false);
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
    }, [callThirdParty, payload, searchKey]);

    const handleSelectSuggestion = useCallback(
        async (searchText) => {
            setSearchKeyInput(searchText);
            setSearchKey(searchText);
            handleConfirmDialog({searchText, payload});
    }, [payload])

    const getImageSrc = image => {
        if (!image || !image.data) return "";
        const src = typeof image.data === "string" ? image.data : String(image.data);
        if (src.startsWith("data:")) return src;
        const mime = image.mime_type && typeof image.mime_type === "string" ? image.mime_type : "image/*";
        return `data:${mime};base64,${src}`;
    };

    return (
        <div className={classes.root} data-cy="SearchAI-root">
            <SideBar resetForm={resetFormAndFocus} />
            <div className={classes.searchAIWrapper}>
                <div className={classes.searchAIInner}>
                    <h1 className={classes.pageTitle}>
                        <FormattedMessage
                            id={'searchAI.title'}
                            defaultMessage={'Start chatting'}
                        />
                    </h1>
                    <p className={classes.pageDesc}>
                        <FormattedMessage
                            id={'searchAI.desc'}
                            defaultMessage={'Enter your question or product description to find'}
                        />
                    </p>
                    <div
                        className={`${classes.chatWrapper} ${isDragOver ? classes.dragOver || '' : ''}`}
                        ref={chatWrapperRef}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {isDragOver && (
                            <div className={classes.dropOverlay || classes.chatWrapper}>
                                <div className={classes.dropMessage}>
                                    <FormattedMessage
                                        id={'searchAI.dropImage'}
                                        defaultMessage={'Drop image here to upload'}
                                    />
                                </div>
                            </div>
                        )}
                        <Form onSubmit={handleConfirmDialog}>
                            <div className={classes.chatInner}>
                                {payload?.image?.data && (
                                    <p className={classes.attachmentName}>
                                        <span className={classes.imageName}>{imageName || 'image.png'}</span>
                                        <img className={classes.previewImage} src={getImageSrc(payload.image)} alt=''/>
                                        <button type="button" className={classes.remove} onClick={() => {
                                            setPayload(prev => {
                                                const { image, ...rest } = prev;
                                                return rest;
                                            });
                                            setImageName(null);
                                            setImageResetKey(k => k + 1);
                                        }}><span>Remove</span></button>
                                    </p>
                                )}
                                {payload?.voice?.data && (
                                    <p className={classes.attachmentName}>
                                        <span className={classes.voiceName}>{voiceName ? `voice - ${voiceName}MB` : 'voice'}</span>
                                        <button type="button" className={classes.remove} onClick={() => {
                                            setPayload(prev => {
                                                const { voice, ...rest } = prev;
                                                return rest;
                                            })
                                            setVoiceName(null);
                                        }}><span>Remove</span></button>
                                    </p>
                                )}
                                <label className={classes.field}>
                                    <textarea
                                        ref={textareaRef}
                                        className={classes.inputText}
                                        placeholder={formatMessage({
                                            id: 'searchAI.placeholder',
                                            defaultMessage: 'Ask about the product...'
                                        })}
                                        value={searchKeyInput}
                                        onPaste={handlePaste}
                                        onChange={(e) => {
                                            setSearchKeyInput(e.target.value || '');
                                            setSearchKey((e.target.value)?.trim() || '');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (searchKey || payload?.image?.data || payload?.voice?.data) {
                                                    handleConfirmDialog({ searchText: searchKey, payloadData: payload });
                                                }
                                            }
                                        }}
                                    />
                                    {showErrorMessage && (!payload?.image?.data && !payload?.voice?.data) && (
                                        <p className={classes.errorMessage}>
                                            <FormattedMessage
                                                id={'validation.isRequired'}
                                                defaultMessage={'Is required.'}
                                            />
                                        </p>
                                    )}
                                </label>
                                {!!errorMessage && (<p className={classes.error}>{errorMessage}</p>)}
                                {(!!searchKey || !!payload?.image?.data || !!payload?.voice?.data) && <button type='button' onClick={removeAll} className={classes.removeAll} ><span>Remove all</span></button>}
                            </div>
                            <div className={classes.attachmentWrapper}>
                                <UploadImageField onChange={handleImage} imageResetKey={imageResetKey}/>
                                <VoiceMicField onChange={handleVoice} />
                                <button
                                    type='submit'
                                    className={`${classes.submit} searchAISubmit`}
                                    disabled={!searchKey && !payload?.image?.data && !payload?.voice?.data}
                                >
                                    <span>
                                        <FormattedMessage
                                            id={'global.search'}
                                            defaultMessage={'Search'}
                                        />
                                    </span>
                                </button>
                            </div>
                        </Form>
                    </div>
                    <div className={classes.suggestions}>
                        <button
                            className={classes.suggestItem}
                            onClick={() => handleSelectSuggestion('Tìm thịt gà, thịt heo, thịt bò')}
                        >{'Tìm thịt gà, thịt heo, thịt bò'}</button>
                        <button
                            className={classes.suggestItem}
                            onClick={() => handleSelectSuggestion('Chicken pork and beef')}
                        >{'Chicken pork and beef'}</button>
                        <button
                            className={classes.suggestItem}
                            onClick={() => handleSelectSuggestion('닭고기 돼지고기 쇠고기')}
                        >{'닭고기 돼지고기 쇠고기'}</button>
                    </div>
                    {!!loading && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
                </div>
            </div>
        </div>
    );
};

export default SearchAI;
