import React, {useState, useEffect, useCallback} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchAIByImage.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import Field from "@magento/venia-ui/lib/components/Field";
import TextInput from "@magento/venia-ui/lib/components/TextInput";
import {useHistory} from "react-router-dom";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import UploadImageDragField from "../UploadImageField/uploadImageDragField";
import {Form} from "informed";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {saveToStorage} from "./searchAISession";

const keyword_only = false;

const SearchAIByImage = props => {
    const {handleCloseSearchAI} = props;
    const classes = useStyle(defaultClasses, props.classes);
    const history = useHistory();
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const storeViewCode = storage.getItem('store_view_code');
    const [loading, setLoading] = useState(false);
    const [imageResetKey, setImageResetKey] = useState(0);
    const [imageName, setImageName] = useState(null);
    const [payload, setPayload] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!errorMessage) return;
        const id = setTimeout(() => setErrorMessage(null), 10000);
        return () => clearTimeout(id);
    }, [errorMessage]);

    const callThirdParty = useCallback(async ({ text, image, ms }) => {
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
        setImageName(typeof name === 'string' ? name : '')
    };

    const handleConfirmDialog = useCallback(
    async formValues => {
        const { search_keys } = formValues;
        const searchKey = search_keys?.trim() || null;

        setErrorMessage(null);
        if (!searchKey && !payload?.image?.data) {
            setErrorMessage(
                formatMessage({
                    id: 'searchAIDialog.notFoundMessage',
                    defaultMessage: "I don't understand your request. Please enter your product related request"
                })
            )
            return;
        }
        setLoading(true);

        try {
            const result = await callThirdPartyWithTimeout({
                text: searchKey || '',
                image: payload?.image
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
                    saveToStorage(search_keys?.trim() || result.filter(Boolean).join(', ') || formatMessage({ id: 'global.aiSearch', defaultMessage: 'Search by AI' }), resultUrl);
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
                    saveToStorage(search_keys?.trim() || result?.map(x => x.keyword)?.filter(Boolean).join(', ') || formatMessage({ id: 'global.aiSearch', defaultMessage: 'Search by AI' }), resultUrl)
                    history.push(resultUrl);
                    setPayload({});
                    setLoading(false);
                    handleCloseSearchAI();
                }
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
    }, [callThirdParty, payload, handleCloseSearchAI]);

    const handleClose = () => {
        setPayload({});
        setImageName(null);
        setImageResetKey(k => k + 1);
        handleCloseSearchAI();
    };

    const getImageSrc = image => {
        if (!image || !image.data) return "";
        const src = typeof image.data === "string" ? image.data : String(image.data);
        if (src.startsWith("data:")) return src;
        const mime = image.mime_type && typeof image.mime_type === "string" ? image.mime_type : "image/*";
        return `data:${mime};base64,${src}`;
    };

    return (
        <div className={classes.root} data-cy="SearchAIByImage-root">
            <button className={classes.closeOverlay} type='button' onClick={handleClose}><span>{'Close'}</span></button>
            <div className={classes.inner}>
                {payload?.image?.data ? (
                    <div className={classes.searchImageForm}>
                        <Form onSubmit={handleConfirmDialog}>
                            <div className={classes.field}>
                                <img src={getImageSrc(payload.image)} alt=''/>
                                <Field
                                    id="search_keys"
                                >
                                    <TextInput
                                        field="search_keys"
                                        validateOnBlur
                                        placeholder={formatMessage({
                                            id: 'searchAIImage.yourSearch',
                                            defaultMessage: 'Your search'
                                        })}
                                    />
                                </Field>
                            </div>
                            <div className={classes.actions}>
                                <button className={classes.formClose} type='button' onClick={handleClose}><span>{'Close'}</span></button>
                                <button type='submit' className={classes.submit}><span>{'Submit'}</span></button>
                            </div>
                        </Form>
                        {!!errorMessage && (<p className={classes.error}>{errorMessage}</p>)}
                    </div>
                ) : (
                    <div className={classes.searchAIHead}>
                        <strong className={classes.searchTitle}>
                            <FormattedMessage
                                id={'searchBar.searchWithImage'}
                                defaultMessage={'Search by image'}
                            />
                        </strong>
                        <button className={classes.close} type='button' onClick={handleClose}><span>{'Close'}</span></button>
                    </div>
                )}
                {!payload?.image?.data && (
                    <div className={classes.attachmentWrapper}>
                        <div>
                            {!!errorMessage && (<p className={classes.error}>{errorMessage}</p>)}
                        </div>
                        <UploadImageDragField onChange={handleImage} imageResetKey={imageResetKey}/>
                    </div>
                )}
                {!!loading && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
            </div>
        </div>
    );
};

export default SearchAIByImage;
