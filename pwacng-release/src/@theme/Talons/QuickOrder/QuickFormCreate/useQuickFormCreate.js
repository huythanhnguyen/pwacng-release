import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import defaultOperations from '../quickOrder.gql';
import { GET_SEARCH_CONFIG_QUERY } from '../../../../override/Talons/SearchBar/autoComplete.gql';
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import {useLazyQuery, useMutation, useQuery} from "@apollo/client";
import {useToasts} from "@magento/peregrine";
import {
    AlertCircle as AlertCircleIcon,
    CheckCircle as AlertSuccessIcon
} from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import {FormattedMessage, useIntl} from "react-intl";
import {useDebounce} from "../../../Hooks/Debounce/useDebounce";
import {useDropdown} from "@magento/peregrine/lib/hooks/useDropdown";
const errorIcon = <Icon src={AlertCircleIcon} size={20} />;
const successIcon = <Icon src={AlertSuccessIcon} attrs={{ width: 18 }} />;
import debounce from 'lodash.debounce';

const UseQuickFormCreate = props => {
    const [ step, setStep ] = useState(1);
    const operations = mergeOperations(defaultOperations);
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const {
        addSingleProduct,
        addMultipleProduct,
        addCsvFileProduct,
        getAutocompleteResults
    } = operations;
    const formSingleApiRef = useRef(null);
    const setFormSingleApi = useCallback(api => (formSingleApiRef.current = api), []);
    const formMultipleApiRef = useRef(null);
    const setFormMultipleApi = useCallback(api => (formMultipleApiRef.current = api), []);
    const [fileName, setFileName] = useState(<FormattedMessage
        id={'global.noFileChosen'}
        defaultMessage={'No files selected'}
    />);
    const [ fileNameBase64, setFileNameBase64 ] = useState(null);
    const [ showMessageError, setShowMessageError ] = useState(false);
    const [ singleProductValue, setSingleProductValue ] = useState('');
    const [ quantityValue, setQuantityValue ] = useState(1);
    const [ multipleProductValue, setMultipleProductValue ] = useState('');
    const [valid, setValid] = useState(false);

    const {
        elementRef,
        expanded: isAutoCompleteOpen,
        setExpanded: setIsAutoCompleteOpen
    } = useDropdown();

    const [
        fetchAddSingleProduct,
        {
            loading: addSingleProductLoading
        }] = useMutation(addSingleProduct);
    const [
        fetchAddMultipleProduct,
        {
            loading: addMultipleProductLoading
        }] = useMutation(addMultipleProduct);
    const [
        fetchAddCsvFile,
        {
            loading: addCsvFileLoading
        }] = useMutation(addCsvFileProduct);

    const [runSearch, {data: productSearchData, loading: productSearchLoading, error: productSearchError}] = useLazyQuery(getAutocompleteResults, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const { data: searchConfigData, loading: searchConfigLoading, error: searchConfigError } = useQuery(GET_SEARCH_CONFIG_QUERY);

    const handleChange = useCallback(
        value => {
            const hasValue = !!value;
            const isValid = hasValue && value.length > 2;

            setSingleProductValue(value);

            setValid(isValid);
        },
        [setValid, singleProductValue]
    );

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const debouncedRunQuery = useMemo(
        () =>
            debounce(inputText => {
                const asmUid = getCookie('_asm_uid') || localStorage.getItem('_asm_uid') || '';
                runSearch({
                    variables: {
                        inputText,
                        asmUid,
                        pageSize: searchConfigData?.storeConfig?.productAutocomplete ? searchConfigData?.storeConfig?.productAutocomplete : 3
                    }}
                );
            }, 500),
        [runSearch, searchConfigData]
    );

    useEffect(() => {
        if (valid && isAutoCompleteOpen) {
            debouncedRunQuery(singleProductValue);
        }
    }, [debouncedRunQuery, valid, singleProductValue, isAutoCompleteOpen]);

    const handleFocus = useCallback(() => {
        setIsAutoCompleteOpen(true);
    }, [setIsAutoCompleteOpen]);

    const handleProductClick = useCallback((sku) => {
        formSingleApiRef.current.setValue('product_sku', sku);
        setIsAutoCompleteOpen(false);
        runSearch({
            variables: {
                inputText: '',
                pageSize: 3
            }}
        );
    }, [isAutoCompleteOpen, formSingleApiRef])

    const handleSubmitSingleProduct = useCallback(async (values) => {
        try {
            const result = await fetchAddSingleProduct({
                variables: {
                    sku: values.product_sku.trim(),
                    qty: values.product_qty
                }
            });

            if (result) {
                formSingleApiRef.current.reset();
                setSingleProductValue('');
                setQuantityValue(1);

                if (result.data.addSingleProductToListQuickOrder.messages.length) {
                    result.data.addSingleProductToListQuickOrder.messages.map(message => {
                        return addToast({
                            type: message.success ? 'success' : 'error',
                            icon: message.success ? successIcon : errorIcon,
                            message: message.message,
                            dismissable: true,
                            timeout: 5000
                        })
                    })
                }
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 5000
            });
        }
    }, []);

    const handleSubmitMultipleProduct = useCallback(async (values) => {
        try {
            const result = await fetchAddMultipleProduct({
                variables: {
                    skus: values.product_skus.replace(/\s+/g, '')
                }
            });

            if (result) {
                formMultipleApiRef.current.reset();

                if (result.data.addMultipleProductsToListQuickOrder.messages.length) {
                    result.data.addMultipleProductsToListQuickOrder.messages.map(message => {
                        return addToast({
                            type: message.success ? 'success' : 'error',
                            icon: message.success ? successIcon : errorIcon,
                            message: message.message,
                            dismissable: true,
                            timeout: 5000
                        })
                    })
                }
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 5000
            });
        }
    }, []);

    const handleFileChange = useCallback(e => {
        if (e.target.files.length > 0) {
            if (e.target.files[0].type === 'text/csv') {
                setFileName(e.target.files[0].name);

                const reader = new FileReader();

                reader.onloadend = () => {
                    setFileNameBase64(reader.result.split(',')[1]);
                };

                reader.readAsDataURL(e.target.files[0]);
            } else {
                addToast({
                    type: 'error',
                    icon: errorIcon,
                    message: formatMessage({
                        id: 'importFile.messageIncorrect',
                        defaultMessage: 'Template file import is incorrect.'
                    }),
                    dismissable: true,
                    timeout: 5000
                })
            }
        } else {
            setFileName(formatMessage({
                id: 'global.noFileChosen',
                defaultMessage: 'No files selected'
            }));
            setFileNameBase64(null);
        }
    }, [fileName]);

    const handleSubmitCsvFile = useCallback(async () => {
        try {
            if (fileNameBase64) {
                const result = await fetchAddCsvFile({
                    variables: {
                        base64_encoded_data: fileNameBase64
                    }
                });

                if (result) {
                    setShowMessageError(false);

                    if (result.data.addProductsByFileToListQuickOrder.messages.length) {
                        result.data.addProductsByFileToListQuickOrder.messages.map(message => {
                            return addToast({
                                type: message.success ? 'success' : 'error',
                                icon: message.success ? successIcon : errorIcon,
                                message: message.message,
                                dismissable: true,
                                timeout: 5000
                            })
                        })
                    }
                }
            } else {
                setShowMessageError(true);
            }
        } catch (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error.message,
                dismissable: true,
                timeout: 5000
            });
        }
    }, [fileNameBase64]);

    const handleBlur = useCallback(() => {
        const newValue = Number(quantityValue) === 0 ? 1 : quantityValue;

        formSingleApiRef.current.setValue('product_qty', newValue);
        setQuantityValue(newValue);
    }, [quantityValue, formSingleApiRef])

    return {
        handleChange,
        containerRef: elementRef,
        step,
        setStep,
        handleSubmitSingleProduct,
        addSingleProductLoading,
        addMultipleProductLoading,
        handleSubmitMultipleProduct,
        setFormSingleApi,
        setFormMultipleApi,
        handleFileChange,
        fileName,
        handleSubmitCsvFile,
        showMessageError,
        addCsvFileLoading,
        autoCompleteItems: productSearchData?.products?.items || [],
        singleProductValue,
        setQuantityValue,
        quantityValue,
        multipleProductValue,
        setMultipleProductValue,
        fileNameBase64,
        handleFocus,
        isAutoCompleteOpen,
        handleProductClick,
        handleBlur
    }
}

export default UseQuickFormCreate
