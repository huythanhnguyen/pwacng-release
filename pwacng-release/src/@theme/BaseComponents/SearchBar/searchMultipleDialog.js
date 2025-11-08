import React, {useState, useEffect, useCallback, useRef} from "react";
import {useStyle} from "@magento/venia-ui/lib/classify";
import defaultClasses from './searchMultipleDialog.module.scss';
import {FormattedMessage, useIntl} from "react-intl";
import Dialog from "@magento/venia-ui/lib/components/Dialog";
import Field from "@magento/venia-ui/lib/components/Field";
import Button from "@magento/venia-ui/lib/components/Button";
import {useHistory} from "react-router-dom";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";

const SearchMultipleDialog = props => {
    const MAX_KEYWORDS = 8;
    const [keywords, setKeywords] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const [isComposing, setIsComposing] = useState(false);

    const inputRef = useRef(null);
    const composingRef = useRef(false);
    const queuedCommaRef = useRef(false);

    const {isOpen, setIsOpen} = props;
    const classes = useStyle(defaultClasses, props.classes);
    const history = useHistory();
    const { formatMessage } = useIntl();
    const storage = new BrowserPersistence();
    const requiredErrorText = formatMessage({ id: 'validation.isRequired', defaultMessage: 'Is required.' });

    const validateKeywordFormat = str => {
        const pattern = /^[\w\s,àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ,]*$/u;
        return pattern.test(str);
    };

    const addKeywords = useCallback((rawValue) => {
        const parts = rawValue.split(',').map(s => s.trim()).filter(Boolean);
        if (!parts.length) return;
        setKeywords(prev => {
            const set = new Set(prev);
            for (const k of parts) {
                if (set.size >= MAX_KEYWORDS) break;
                set.add(k);
            }
            return Array.from(set).slice(0, MAX_KEYWORDS);
        });
    }, []);

    const flushByComma = () => {
        const v = (inputRef.current?.value || '').trim();
        if (v && keywords.length < MAX_KEYWORDS) {
            addKeywords(v);
        }
        setInputValue('');
        if (inputRef.current) inputRef.current.value = '';
        setError('');
    };

    const handleConfirmDialog = useCallback(() => {
        if (inputValue?.trim()) {
            if (keywords.length < MAX_KEYWORDS) {
                addKeywords(inputValue);
                setInputValue('');
                setError('');
            }
        } else if (keywords.length === 0) {
            setError(requiredErrorText);
        }
        setShouldRedirect(true);
    }, [inputValue, keywords, requiredErrorText, addKeywords]);

    useEffect(() => {
        if (shouldRedirect && keywords.length > 0) {
            const encodedKeywords = encodeURIComponent(keywords.join(','));
            const storageSearchHistory = storage.getItem('search_history');
            const searchHistory = storageSearchHistory ? JSON.parse(storageSearchHistory) : [];
            const updatedHistory = [...keywords, ...searchHistory.filter(q => !keywords.includes(q))].slice(0, 10);
            storage.setItem('search_history', JSON.stringify(updatedHistory));
            history.push(`/search.html?query=${keywords[0]}&keywords=${encodedKeywords}`);
            setShouldRedirect(false);
            setKeywords([]);
            setInputValue('');
            setError('');
            setIsOpen(false);
        } else if (shouldRedirect && keywords.length === 0) {
            setShouldRedirect(false);
        }
    }, [shouldRedirect, keywords, history, storage, setIsOpen]);

    const handleClearAll = useCallback(() => {
        setInputValue('');
        setKeywords([]);
        setError('');
        if (inputRef.current) inputRef.current.value = '';
    }, []);

    const handleCompositionStart = () => {
        composingRef.current = true;
        setIsComposing(true);
    };

    const handleCompositionEnd = e => {
        composingRef.current = false;
        setIsComposing(false);
        const v = e.target.value;
        if (!validateKeywordFormat(v)) {
            setError(formatMessage({ id: 'searchMultiple.errorValidate', defaultMessage: 'Invalid format, use only comma(,) to separate keywords' }));
            return;
        }
        if (queuedCommaRef.current || v.endsWith(',')) {
            queuedCommaRef.current = false;
            const t = v.endsWith(',') ? v.slice(0, -1) : v;
            if (t.trim()) addKeywords(t);
            setInputValue('');
            if (inputRef.current) inputRef.current.value = '';
            setError('');
        } else {
            setError('');
            setInputValue(v);
        }
    };

    const handleBeforeInput = e => {
        const d = e.nativeEvent && e.nativeEvent.data;
        const it = e.nativeEvent && e.nativeEvent.inputType;
        if (d === ',' && it === 'insertText') {
            if (isComposing || composingRef.current) {
                queuedCommaRef.current = true;
                return;
            }
            e.preventDefault();
            flushByComma();
        }
    };

    const handleInput = e => {
        if (isComposing || composingRef.current) return;
        const v = e.target.value;
        if (!validateKeywordFormat(v)) {
            setError(formatMessage({ id: 'searchMultiple.errorValidate', defaultMessage: 'Invalid format, use only comma(,) to separate keywords' }));
            return;
        }
        setError('');
        setInputValue(v);
    };

    const handleKeyDown = e => {
        if (e.isComposing || e.nativeEvent.isComposing || isComposing || composingRef.current) return;
        if (e.key === ',') {
            e.preventDefault();
            flushByComma();
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if ((inputRef.current?.value || '').trim()) flushByComma();
        }
    };

    const handlePaste = e => {
        if (isComposing || composingRef.current) return;
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (text.includes(',')) {
            e.preventDefault();
            addKeywords(text);
            setInputValue('');
            if (inputRef.current) inputRef.current.value = '';
            setError('');
        }
    };

    const handleBlur = () => {
        if (isComposing || composingRef.current) return;
        const v = (inputRef.current?.value || '').trim();
        if (v) setInputValue(v);
    };

    const removeKeyword = index => {
        setKeywords(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog
            widthDialog={'480px'}
            heightDialog={'280px'}
            confirmTranslationId={'searchMultiple.submit'}
            confirmText={'Submit all'}
            isOpen={isOpen}
            onCancel={() => setIsOpen(false)}
            onConfirm={formValues => handleConfirmDialog(formValues)}
            shouldShowSecondaryButton={true}
            setScrollLock={false}
            title={formatMessage({ id: 'global.advancedSearch', defaultMessage: 'Advanced Search' })}
            secondaryButton={
                <Button
                    priority={'low'}
                    onClick={handleClearAll}
                    disabled={keywords.length === 0}
                    classes={{root_lowPriority: classes.removeAll}}
                >
                    <FormattedMessage id={'global.removeAll'} defaultMessage={'Clear all'} />
                </Button>
            }
        >
            <div className={classes.root} data-cy="SearchMultipleDialog-root">
                <div className={!!error ? `${classes.field} ${classes.errorField}` : classes.field}>
                    <Field
                        id="search_keys"
                        label={formatMessage({ id: 'searchMultiple.fieldLabel', defaultMessage: 'Enter keywords to search' })}
                    >
                        <ul className={classes.searchMultiple}>
                            <label htmlFor={'searchkey'}></label>
                            {keywords.map((keyword, index) => (
                                <li key={index}>
                                    {keyword}
                                    <button type='button' onClick={() => removeKeyword(index)}><span>×</span></button>
                                </li>
                            ))}
                            <input
                                ref={inputRef}
                                type="text"
                                id="searchkey"
                                value={isComposing ? undefined : inputValue}
                                onBeforeInput={handleBeforeInput}
                                onInput={handleInput}
                                onKeyDown={handleKeyDown}
                                onCompositionStart={handleCompositionStart}
                                onCompositionEnd={handleCompositionEnd}
                                onPaste={handlePaste}
                                onBlur={handleBlur}
                                disabled={keywords.length >= MAX_KEYWORDS}
                                autoComplete="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                inputMode="text"
                                placeholder={formatMessage({
                                    id: 'searchMultiple.placeholder',
                                    defaultMessage: 'Examples: Vegetables, Bread, Household Goods'
                                })}
                            />
                        </ul>
                    </Field>
                    {keywords.length > MAX_KEYWORDS && (
                        <p className={classes.error}>
                            <FormattedMessage
                                id="searchMultiple.errorLimit"
                                defaultMessage="You can only enter up to {count} keywords."
                                values={{ count: MAX_KEYWORDS }}
                            />
                        </p>
                    )}
                    {!!error && <p className={classes.error}>{error}</p>}
                    {keywords.length <= MAX_KEYWORDS && !error && (
                        <p className={classes.note}>
                            <FormattedMessage id={'searchMultiple.noteLine1'} defaultMessage={'Keywords must be separated by commas (,).'} /><br/>
                            <FormattedMessage id={'searchMultiple.noteLine2'} defaultMessage={'Maximum 8 keywords per search.'} />
                        </p>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default SearchMultipleDialog;
