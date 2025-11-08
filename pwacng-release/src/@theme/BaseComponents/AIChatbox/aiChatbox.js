import React, {useMemo, useState, useEffect, useCallback, useRef, Suspense} from "react";
import defaultClasses from './aiChatbox.module.scss';
import {mergeClasses} from "@magento/venia-ui/lib/classify";
import {Portal} from "@magento/venia-ui/lib/components/Portal";
import {Link, useLocation} from "react-router-dom";
import useAIChatbox from "./useAIChatbox";
import AIChatForm from "./aiChatForm";
import {FormattedMessage, useIntl} from "react-intl";
import AIChatContent from "./aiChatContent";
import useMediaCheck from "../../Hooks/MediaCheck/useMediaCheck";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import ProductFrame from "../Product/productFrame";
import ProductGroupKeywords from "./productGroupKeywords";
import AIChatbotHistory from "./aiChatbotHistory";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import { useImageUploadUtils } from "./imageUploadUtils";
import {useFileUploadUtils} from "./fileUploadUtils";

const ConfirmRedirectDialog = React.lazy(() => import('@magenest/theme/BaseComponents/SignIn/confirmRedirectDialog'));
const AlcoholDialog = React.lazy(() => import('@magenest/theme/BaseComponents/Product/alcoholDialog'));

const AIChatbox = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const {
        chatbotOpened,
        setChatbotOpened,
        handleChat,
        handleCloseChat
    } = props;
    const { isMobile } = useMediaCheck();
    const { formatMessage } = useIntl();
    const location = useLocation();
    const storage = new BrowserPersistence();
    const containerRef = useRef(null);

    const { pathname, search } = location;
    const query = new URLSearchParams(search);
    const defaultOpen = (pathname !== '/sign-in' && query.get('chatbot') === 'true') || false;

    const aiChatbotStorageData = sessionStorage.getItem('aiChatbot');
    const aiChatbotData = aiChatbotStorageData ? JSON.parse(aiChatbotStorageData) : null;

    const [chatbotActive, setChatbotActive] = useState(false);
    const [historyOpened, setHistoryOpened] = useState(false);
    const [fullscreen, setFullscreen] = useState(aiChatbotData?.fullScreen || false);
    const [productKeywords, setProductKeywords] = useState(aiChatbotData?.productKeywords || false);
    const [showProducts, setShowProducts] = useState(aiChatbotData?.showProducts || null);
    const [productFrameUrl, setProductFrameUrl] = useState(aiChatbotData?.productFrameUrl || null);
    const [signInRedirect, setSignInRedirect] = useState(false);
    const setShowProductsRef = useRef(null);

    const handleRealTimeKeywordsUpdate = useCallback((keywords) => {
        // If we have keywords but no products yet, initialize showProducts
        // We'll use a ref to access setShowProducts since it's not available yet
        if (keywords?.queries?.length && setShowProductsRef.current) {
            setProductKeywords(keywords);

            setShowProductsRef.current(prevProducts => {
                if (prevProducts === null) {
                    return [];
                }
                return prevProducts;
            });
        }
    }, []);

    const handleRealTimeProductsUpdate = useCallback((products) => {
        // Use ref-based approach to update products
        if (setShowProductsRef.current) {
            setShowProductsRef.current(prevProducts => {
                if (!prevProducts || prevProducts.length === 0) {
                    return products;
                } else {
                    // Merge unique products by SKU
                    const existingSkus = new Set(prevProducts.map(p => p.sku));
                    const newProducts = products?.filter(p => !existingSkus.has(p.sku)) || [];
                    return newProducts.length > 0 ? [...prevProducts, ...newProducts] : prevProducts;
                }
            });
        }
    }, []);

    const handleSaveToStorage = useCallback(({fullScreen = true, switchStore = false, adkId = null}) => {
        sessionStorage.setItem('aiChatbot', JSON.stringify({
            fullScreen,
            switchStore,
            adkId,
            oldStore: (switchStore && adkId) ? (storage?.getItem('store')?.storeInformation?.name || null) : null,
            type: productFrameUrl ? 'productFrame' : 'productKeywords',
            productFrameUrl: productFrameUrl || null,
            productKeywords: productKeywords || false,
            showProducts: showProducts || null,
            redirectUrl: pathname || null
        }));
    }, [productFrameUrl, productKeywords, showProducts, pathname])

    const talonProps = useAIChatbox({
        defaultOpen,
        chatbotActive,
        setChatbotActive,
        setChatbotOpened,
        setFullscreen,
        setHistoryOpened,
        setShowProducts,
        setProductKeywords,
        handleCloseChat,
        handleSaveToStorage,
        onKeywordsUpdate: handleRealTimeKeywordsUpdate,
        onProductsUpdate: handleRealTimeProductsUpdate
    });
    const {
        loading,
        setLoading,
        processing,
        searchKeyProcessing,
        errorMessage,
        showErrorMessage,
        timeoutMessage,
        tryAgainMessage,
        tooltipDisplay,
        setTooltipDisplay,
        sessionTooLarge,
        sessionId,
        setSessionId,
        chatbotHistory,
        setChatbotHistory,
        historyKeyword,
        setHistoryKeyword,
        chatEvents,
        payload,
        setPayload,
        searchKey,
        setSearchKey,
        searchKeyInput,
        setSearchKeyInput,
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
        handleOpenChat,
        handleGetHistory,
        handleNewSession,
        handleSwitchSession,
        handleDeteleSession,
        handleDeteleAllSession,
        handleFile,
        handleImage,
        handleVoice,
        handleSelectSuggestion,
        removeAll,
        handleConfirm,
        getImageSrc,
        ageConfirm,
        setAgeConfirm,
        handleAgeConfirm
    } = talonProps;

    // Set the ref so it can be used in callbacks
    useEffect(() => {
        setShowProductsRef.current = setShowProducts;
    }, [setShowProducts]);

    // Listen for real-time keyword and product updates (using window events as fallback)
    useEffect(() => {
        const handleKeywordsUpdate = (event) => {
            const keywords = event.detail;
            if (keywords && (keywords.queries?.length > 0 || keywords.pairs?.length > 0)) {
                setProductKeywords(keywords);
            }
        };

        const handleProductsUpdate = (event) => {
            const products = event.detail;
            if (products && Array.isArray(products) && products.length > 0) {
                handleRealTimeProductsUpdate(products, setShowProducts);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('aiChatKeywordsUpdate', handleKeywordsUpdate);
            window.addEventListener('aiChatProductsUpdate', handleProductsUpdate);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('aiChatKeywordsUpdate', handleKeywordsUpdate);
                window.removeEventListener('aiChatProductsUpdate', handleProductsUpdate);
            }
        };
    }, [setShowProducts, handleRealTimeProductsUpdate]);

    useEffect(() => {
        if (chatbotOpened) {
            document.body.classList.add('chatbotOpened');
        } else {
            document.body.classList.remove('chatbotOpened');
        }

        if (chatbotOpened && (isMobile || fullscreen)) {
            document.body.classList.add('chatbotFullscreen');
        } else {
            document.body.classList.remove('chatbotFullscreen');
        }
    }, [chatbotOpened, fullscreen, isMobile]);

    const handleChatbotOpened = (status) => {
        if (status === false) {
            document.body.classList.remove('chatbotFullscreen');
        }
        setChatbotOpened(status);
    }
    const handleShowFrame = (pathname) => {
        setFullscreen(true);
        setProductFrameUrl(pathname);
    }

    // Image upload utilities
    const { processImageFile, getImageFromDataTransfer } = useImageUploadUtils();

    // File upload utilities
    const { processFile, getFileFromDataTransfer } = useFileUploadUtils();

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
        if (!containerRef.current?.contains(e.relatedTarget)) {
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

        if (processing) return; // Don't allow drops while processing

        // Check for image files first
        const imageFile = getImageFromDataTransfer(e.dataTransfer);
        if (imageFile && handleImage) {
            await processImageFile(imageFile, handleImage);
            return;
        }

        // If no image, check for other files
        const file = getFileFromDataTransfer(e.dataTransfer);
        if (file && handleFile) {
            await processFile(file, handleFile);
        }
    }, [processing, getImageFromDataTransfer, processImageFile, handleImage, getFileFromDataTransfer, processFile, handleFile]);

    const sidebar = useMemo(() => {
        if (showProducts !== null || productFrameUrl) {
            return (
                <div className={classes.sidebar}>
                    {productFrameUrl ? (
                        <>
                            <button onClick={() => handleShowFrame(null)} className={classes.productFrameBack}>
                                <FormattedMessage
                                    id={'global.back'}
                                    defaultMessage={'Back'}
                                />
                            </button>
                            <div className={classes.productFrame}>
                                <ProductFrame
                                    classes={classes}
                                    pathname={productFrameUrl}
                                    handleChatbotOpened={handleChatbotOpened}
                                    handleSaveToStorage={handleSaveToStorage}
                                    setSignInRedirect={setSignInRedirect}
                                />
                            </div>
                        </>
                    ) : null}
                    <div className={productFrameUrl ? 'hidden' : ''}>
                        <ProductGroupKeywords
                            classes={classes}
                            productKeywords={productKeywords}
                            showProducts={showProducts}
                            setShowProducts={setShowProducts}
                            handleShowFrame={handleShowFrame}
                            handleChatbotOpened={handleChatbotOpened}
                            key={`${JSON.stringify(productKeywords)}`}
                            processing={processing}
                            setSignInRedirect={setSignInRedirect}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div className={classes.sidebarEmpty}>
                    <FormattedMessage
                        id={'chatbot.sidebarEmpty'}
                        defaultMessage={'Do you need any help?'}
                    />
                </div>
            );
        }
    }, [classes, productKeywords, showProducts, setShowProducts, productFrameUrl, handleShowFrame, handleChatbotOpened]);

    return (
        <>
            <div className={chatbotOpened ? classes.rootOpened : classes.root}>
                <button type="button" className={classes.aiChatboxTrigger} onClick={handleOpenChat} disabled={!chatbotOpened && loading || false}>
                    <span>
                        <FormattedMessage
                            id={'global.assistant'}
                            defaultMessage={'Assistant'}
                        />
                    </span>
                </button>

                <Portal>
                    <div className={`aiChatbot ${chatbotOpened ? classes.aiChatboxOpened : classes.aiChatbox} ${(isMobile || fullscreen) && chatbotOpened ? classes.fullscreen : ''} ${historyOpened ? 'chatbotHistoryShow' : ''}`}>
                        <div className={classes.chatboxHead}>
                            <strong className={classes.chatboxTitle}>
                                <span className={classes.aiChatboxIcon}></span>
                                <span className={classes.chatboxName}>
                                    <FormattedMessage
                                        id={'aiChatbox.brandName'}
                                        defaultMessage={'MM AI'}
                                    />
                                </span>
                            </strong>
                            <div className={classes.actions}>
                                <button type="button"
                                        className={tooltipDisplay ? `${classes.reset} ${classes.tooltip}` : classes.reset}
                                        onMouseEnter={() => setTooltipDisplay(false)}
                                        onClick={handleNewSession}
                                        data-title={formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
                                ><span className={classes.textVisible}>×</span></button>
                                <button type="button"
                                        className={classes.history}
                                        onMouseEnter={() => setTooltipDisplay(false)}
                                        onClick={() => {
                                            setHistoryOpened(prevState => !prevState);
                                            handleGetHistory();
                                        }}
                                        data-title={formatMessage({ id: 'aiChatbox.history', defaultMessage: 'Chat history' })}
                                ><span className={classes.textVisible}>×</span></button>
                                <button type="button"
                                        className={classes.view}
                                        onMouseEnter={() => setTooltipDisplay(false)}
                                        onClick={() => setFullscreen(prevState => !prevState)}
                                        data-title={fullscreen ? formatMessage({ id: 'aiChatbox.exitFullscreen', defaultMessage: 'Exit Fullscreen' }) : formatMessage({ id: 'aiChatbox.enterFullscreen', defaultMessage: 'Enter Fullscreen' })}
                                ><span className={classes.textVisible}>×</span></button>
                                <button type="button"
                                        className={classes.close}
                                        onMouseEnter={() => setTooltipDisplay(false)}
                                        onClick={() => setChatbotOpened(false)}
                                        data-title={formatMessage({ id: 'global.close', defaultMessage: 'Close' })}
                                ><span className={classes.textVisible}>×</span></button>
                            </div>
                        </div>
                        <div className={classes.frame}>
                            <AIChatbotHistory
                                handleGetHistory={handleGetHistory}
                                chatbotHistory={chatbotHistory}
                                setChatbotHistory={setChatbotHistory}
                                historyKeyword={historyKeyword}
                                setHistoryKeyword={setHistoryKeyword}
                                opened={historyOpened}
                                setOpened={setHistoryOpened}
                                sessionId={sessionId}
                                setSessionId={setSessionId}
                                handleNewSession={handleNewSession}
                                handleSwitchSession={handleSwitchSession}
                                handleDeteleSession={handleDeteleSession}
                                handleDeteleAllSession={handleDeteleAllSession}
                            />
                            <div className={`${classes.main} ${isDragOver ? classes.dragOver : ''}`}
                                 ref={containerRef}
                                 onDragEnter={handleDragEnter}
                                 onDragLeave={handleDragLeave}
                                 onDragOver={handleDragOver}
                                 onDrop={handleDrop}
                            >
                                {isDragOver && (
                                    <div className={classes.dropOverlay || classes.root}>
                                        <div className={classes.dropMessage}>
                                            <FormattedMessage
                                                id={'aiChatbox.dropFile'}
                                                defaultMessage={'Drop image or file here to upload'}
                                            />
                                        </div>
                                    </div>
                                )}
                                {chatbotActive && (
                                    <>
                                        <AIChatContent
                                            chatEvents={chatEvents}
                                            processing={processing}
                                            setLoading={setLoading}
                                            searchKeyProcessing={searchKeyProcessing}
                                            timeoutMessage={timeoutMessage}
                                            tryAgainMessage={tryAgainMessage}
                                            setShowProducts={setShowProducts}
                                            setFullscreen={setFullscreen}
                                            handleSelectSuggestion={handleSelectSuggestion}
                                            setProductKeywords={setProductKeywords}
                                            handleShowFrame={handleShowFrame}
                                            handleChatbotOpened={handleChatbotOpened}
                                            handleNewSession={handleNewSession}
                                            handleChat={handleChat}
                                            onRealTimeKeywordsUpdate={handleRealTimeKeywordsUpdate}
                                            onRealTimeProductsUpdate={handleRealTimeProductsUpdate}
                                            signInRedirect={signInRedirect}
                                            setSignInRedirect={setSignInRedirect}
                                            handleImage={handleImage}
                                            handleFile={handleFile}
                                        />
                                        <AIChatForm
                                            processing={processing}
                                            payload={payload}
                                            setPayload={setPayload}
                                            searchKey={searchKey}
                                            setSearchKey={setSearchKey}
                                            searchKeyInput={searchKeyInput}
                                            setSearchKeyInput={setSearchKeyInput}
                                            imageResetKey={imageResetKey}
                                            setImageResetKey={setImageResetKey}
                                            imageName={imageName}
                                            setImageName={setImageName}
                                            fileResetKey={fileResetKey}
                                            setFileResetKey={setFileResetKey}
                                            fileName={fileName}
                                            setFileName={setFileName}
                                            voiceName={voiceName}
                                            setVoiceName={setVoiceName}
                                            handleFile={handleFile}
                                            handleImage={handleImage}
                                            handleVoice={handleVoice}
                                            removeAll={removeAll}
                                            handleConfirm={handleConfirm}
                                            getImageSrc={getImageSrc}
                                            handleNewSession={handleNewSession}
                                            sessionTooLarge={sessionTooLarge}
                                        />
                                    </>
                                )}
                            </div>
                            {!isMobile ? sidebar : ''}
                        </div>
                        {loading && <div className={classes.loadingWrapper}><LoadingIndicator /></div>}
                    </div>
                </Portal>
            </div>

            { signInRedirect && (
                <Suspense fallback={null}>
                    <ConfirmRedirectDialog
                        isOpen={signInRedirect}
                        setIsOpen={setSignInRedirect}
                        onConfirm={() => {
                            handleSaveToStorage();
                            handleChatbotOpened(false);
                        }}
                        isBusy={false}
                    />
                </Suspense>
            )}

            { ageConfirm && (
                <Suspense fallback={null}>
                    <AlcoholDialog
                        isOpen={ageConfirm}
                        setIsOpen={setAgeConfirm}
                        onConfirm={() => handleAgeConfirm(true)}
                        onCancel={() => handleAgeConfirm(false)}
                        isBusy={false}
                    />
                </Suspense>
            )}
        </>
    )
}

export default AIChatbox
