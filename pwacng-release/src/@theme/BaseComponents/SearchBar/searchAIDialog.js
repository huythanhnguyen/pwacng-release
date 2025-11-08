import React, {useState, useEffect, useCallback} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchAIDialog.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "@magento/venia-ui/lib/components/TextInput";
import {useHistory} from "react-router-dom";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import UploadImageField from "../UploadImageField/uploadImageField";
import VoiceMicField from "../VoiceMicField/voiceMicField";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";

const SearchAIDialog = props => {
    const {isOpen, handleCloseSearchAI} = props;
    const classes = useStyle(defaultClasses, props.classes);
    const history = useHistory();
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const storeViewCode = storage.getItem('store_view_code');
    const [loading, setLoading] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [imageResetKey, setImageResetKey] = useState(0);
    const [imageName, setImageName] = useState(null);
    const [voiceName, setVoiceName] = useState(null);
    const [payload, setPayload] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);

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
                body: JSON.stringify({ text, image, voice }),
                signal: controller.signal
            });

            clearTimeout(t);
            if (!res.ok) return [];
            const json = await res.json();
            return Array.isArray(json) ? json : [];
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
        setImageName(typeof name === 'string' ? name : '')
    };
    const handleVoice = (data, name) => {
        setPayload(prev => ({ ...prev, ...data }));
        setVoiceName(typeof name === 'string' ? name : '')
    };

    const handleConfirmDialog = useCallback(
    async formValues => {
        const { search_keys } = formValues;
        const searchKey = search_keys?.trim() || null;

        setErrorMessage(null);
        if (!searchKey && !payload?.image?.data && !payload?.voice?.data) {
            setShowErrorMessage(true);
            return;
        }
        setShowErrorMessage(false);
        setLoading(true);

        try {
            const result = await callThirdPartyWithTimeout({
                text: searchKey || '',
                image: payload?.image,
                voice: payload?.voice
            }, 5000);

            if (Array.isArray(result) && result.length > 0) {
                const keywords = [
                    ...new Set(
                        (result || [])
                            .map(x => (x || '').trim())
                            .filter(Boolean)
                    )
                ]
                const encodedKeywords = encodeURIComponent(keywords.join(','));

                history.push(`/search.html?query=${keywords[0]}&keywords=${encodedKeywords}`);
                setPayload({});
                setLoading(false);
                handleCloseSearchAI();
            } else if (searchKey) {
                history.push(`/search.html?query=${searchKey}`);
                setPayload({});
                setLoading(false);
                handleCloseSearchAI();
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
    }, [callThirdParty, payload]);

    const getImageSrc = image => {
        if (!image || !image.data) return "";
        const src = typeof image.data === "string" ? image.data : String(image.data);
        if (src.startsWith("data:")) return src;
        const mime = image.mime_type && typeof image.mime_type === "string" ? image.mime_type : "image/*";
        return `data:${mime};base64,${src}`;
    };

    return (
        <Dialog
            widthDialog={'480px'}
            heightDialog={'280px'}
            confirmTranslationId={'global.search'}
            confirmText={'Search'}
            isOpen={isOpen}
            shouldShowMask={false}
            onCancel={() => handleCloseSearchAI()}
            onConfirm={formValues => handleConfirmDialog(formValues)}
            shouldShowSecondaryButton={true}
            setScrollLock={false}
            title={formatMessage({
                id: 'global.aiSearch',
                defaultMessage: 'Search by AI'
            })}
        >
            <div className={classes.root} data-cy="SearchAIDialog-root">
                {!!errorMessage && (<p className={classes.error}>{errorMessage}</p>)}
                <div className={classes.field}>
                    <Field
                        id="search_keys"
                        label={formatMessage({
                            id: 'searchMultiple.fieldLabel',
                            defaultMessage: 'Enter keywords to search'
                        })}
                    >
                        <TextInput
                            field="search_keys"
                            validateOnBlur
                            placeholder={formatMessage({
                                id: 'searchMultiple.placeholder',
                                defaultMessage: 'Examples: Vegetables, Bread, Household Goods'
                            })}
                        />
                    </Field>
                    <div className={classes.attachmentWrapper}>
                        <UploadImageField onChange={handleImage} imageResetKey={imageResetKey}/>
                        <VoiceMicField onChange={handleVoice} />
                    </div>
                    {payload?.image?.data && (
                        <p className={classes.attachmentName}>
                            <span>{imageName || 'image.png'}</span>
                            <img src={getImageSrc(payload.image)} alt=''/>
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
                            <span>{voiceName ? `voice - ${voiceName}MB` : 'voice'}</span>
                            <button type="button" className={classes.remove} onClick={() => {
                                setPayload(prev => {
                                    const { voice, ...rest } = prev;
                                    return rest;
                                })
                                setVoiceName(null);
                            }}><span>Remove</span></button>
                        </p>
                    )}
                    {showErrorMessage && (!payload?.image?.data && !payload?.voice?.data) && (
                        <p className={classes.errorMessage}>
                            <FormattedMessage
                                id={'validation.isRequired'}
                                defaultMessage={'Is required.'}
                            />
                        </p>
                    )}
                    {!!loading && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
                </div>
            </div>
        </Dialog>
    );
};

export default SearchAIDialog;
