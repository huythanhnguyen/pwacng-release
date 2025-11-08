import React, {
    Fragment,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
    useCallback,
    memo,
    useState,
    Suspense
} from "react";
import defaultClasses from './aiChatContent.module.scss';
import {mergeClasses} from "@magento/venia-ui/lib/classify";
import {FormattedMessage, useIntl} from "react-intl";
import MarkdownIt from 'markdown-it';
import RichContent from '@magento/venia-ui/lib/components/RichContent/richContent';
import {Link} from "react-router-dom";
import BotMessage from "./botMessage";

const md = new MarkdownIt();
const toHTML = html => <RichContent html={md.render(String(html || ""))} />;

const parseJsonMessage = (data) => {
    if (typeof data !== "string") return data;

    const normalize = (obj, fallback) => {
        if (obj && typeof obj.message === 'string') {
            return {
                message: obj.message,
                closingMessage: obj.closing_statement || '',
                prods: obj.product_data || null,
                cart: obj.display_mode === 'cart' ? (obj.cart_data || null) : null,
                order: obj.display_mode === 'order' ? (obj.order_data?.data || null) : null,
                ctaButtons: [
                    obj.show_cart_detail_cta_button ? 'cartCTA' : null,
                    obj.show_proceed_to_checkout_cta_button ? 'checkoutCTA' : null,
                    obj.show_support_cta_button ? 'supportCTA' : null,
                    obj.show_signin_for_account_cta_button ? 'signinAccountCTA' : null,
                    obj.show_signin_for_address_cta_button ? 'signinAddressCTA' : null,
                    obj.show_signin_for_order_cta_button ? 'signinOrderCTA' : null
                ].filter(Boolean)
            };
        }
        return { message: fallback, closingMessage: '', prods: null, cart: null, order: null, ctaButtons: [] };
    };

    try {
        const obj = JSON.parse(data);
        return normalize(obj || {}, data);
    } catch {
        if (data.trim().startsWith('```json')) {
            try {
                const obj = JSON.parse(data.trim().slice(7, -3));
                return normalize(obj || {}, data);
            } catch {
                return normalize({}, data);
            }
        }
        return normalize({}, data);
    }
};

// Memoized utility functions
const normalizeBase64 = (src) => {
    if (src.startsWith('data:')) return src;
    if (/^https?:\/\//i.test(src)) return src;
    let b64 = src.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    return b64;
};

const getBinarySrc = (obj) => {
    if (!obj || !obj.data) return "";
    if (obj.blob instanceof Blob) return URL.createObjectURL(obj.blob);
    const raw = obj.data;
    if (!raw || typeof raw !== 'string') return '';
    const mime =
        (typeof obj.mimeType === 'string' && obj.mimeType) ||
        (typeof obj.mime_type === 'string' && obj.mime_type) ||
        'application/octet-stream';
    if (raw.startsWith('data:') || /^https?:\/\//i.test(raw)) return raw;
    const b64 = normalizeBase64(raw);
    return `data:${mime};base64,${b64}`;
};

const getAudioSrc = audioInline => getBinarySrc(audioInline);
const getImageSrc = imageInline => getBinarySrc(imageInline);

// Enhanced audio component with better duration loading
const AudioPlayer = memo(({ audioData, classes, index }) => {
    const src = getAudioSrc(audioData);
    if (!src) return null;

    const audioRef = useRef(null);
    const [durationLoaded, setDurationLoaded] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                setDurationLoaded(true);
                setShowControls(true);
            }
        };

        const handleCanPlay = () => {
            if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                setDurationLoaded(true);
                setShowControls(true);
            }
        };

        const handlePlay = () => {
            setHasStartedPlaying(true);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('durationchange', handleLoadedMetadata);
        audio.addEventListener('play', handlePlay);

        // Force load metadata
        audio.load();

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('durationchange', handleLoadedMetadata);
            audio.removeEventListener('play', handlePlay);
        };
    }, [src]);

    return (
        <div className={classes.audioContainer}>
            {!durationLoaded && (
                <div className={classes.audioLoading}>
                    <span>Loading audio...</span>
                </div>
            )}
            <audio
                ref={audioRef}
                key={index}
                className={`${classes.voice} ${!hasStartedPlaying ? classes.hideTimeDisplays : ''}`}
                controls={showControls}
                preload="auto"
                src={src}
                style={{
                    display: durationLoaded ? 'block' : 'none'
                }}
                onError={(e) => {
                    console.warn('Audio loading error:', e);
                    // Show controls even if there's an error so user can try to play
                    setShowControls(true);
                    setDurationLoaded(true);
                }}
            >
                Your browser does not support the audio element.
            </audio>
        </div>
    );
});

// Memoized media components
const Voices = memo(({ list = [], classes }) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    return (
        <div className={classes.voices}>
            {list.map((v, idx) => (
                <AudioPlayer
                    key={idx}
                    audioData={v}
                    classes={classes}
                    index={idx}
                />
            ))}
        </div>
    );
});

const Images = memo(({ list = [], classes }) => {
    if (!list?.length) return null;
    return (
        <div className={classes.images}>
            {list.map((img, idx) => (
                <img className={classes.image} key={idx} src={getImageSrc(img)} alt="" />
            ))}
        </div>
    );
});

const Files = memo(({ list = [], classes }) => {
    if (!list?.length) return null;
    return (
        <div className={classes.files}>
            {list.map((item, idx) => (
                <p className={classes.file} key={idx}>{item.displayName || item.mimeType || ''}</p>
            ))}
        </div>
    );
});

const BotMessageProcessing = memo(({ text, classes }) => {
    const { formatMessage } = useIntl();
    return (
        <div className={`${classes.botMessage} ${classes.botMessageProcessing}`}>
            <span className={classes.botAvt}></span>
            <div className={classes.inner}>
                <div className={classes.dots}>
                    <span className={classes.dot}></span>
                    <span className={classes.dot}></span>
                    <span className={classes.dot}></span>
                </div>
            </div>
            <span className={`${classes.processing} ${text ? "" : classes.processingDefault}`} data-text={text || formatMessage({ id: 'botMessage.processingStep2', defaultMessage: 'Please wait a moment ..' })}>
                {text || (
                    <span><FormattedMessage id={'botMessage.processing'} defaultMessage={'Processing ..'} /></span>
                )}
            </span>
        </div>
    );
});

const CustomerMessage = memo(({ text, images = [], voices = [], files = [], classes, renderContent }) => {
    if (!text && !images?.length && !voices?.length && !files?.length) return null;

    return (
        <div className={classes.customerMessage}>
            <div className={classes.inner}>
                {images?.length > 0 && <Images list={images} classes={classes} />}
                {files?.length > 0 && <Files list={files} classes={classes} />}
                {voices?.length > 0 && <Voices list={voices} classes={classes} />}
                {text && renderContent(text, true)}
            </div>
        </div>
    );
});

const Suggestions = memo(({ keywords = [], handleSelectSuggestion, classes }) => {
    if (!keywords?.length) return null;
    return (
        <div className={classes.suggestions}>
            {keywords.map((item, index) => {
                return (
                    <button key={index} className={classes.suggestion} onClick={() => handleSelectSuggestion(item)}>
                        {item}
                    </button>
                )
            })}
        </div>
    );
});

const FirstSuggestions = memo(({ classes, handleChatbotOpened, handleSelectSuggestion }) => {
    const { formatMessage } = useIntl();
    return (
        <div className={`${classes.suggestions} ${classes.firstSuggestions}`}>
            <Link
                to={'/khuyen-mai.html'}
                className={classes.suggestion}
                onClick={() => handleChatbotOpened(false)}
            >
                <FormattedMessage
                    id={'botSuggestion.hotDeals'}
                    defaultMessage={'Hot Deals'}
                />
            </Link>
            <Link
                to={'/category/thuong-hieu-rieng.html'}
                className={classes.suggestion}
                onClick={() => handleChatbotOpened(false)}
            >
                <FormattedMessage
                    id={'botSuggestion.mmSignature'}
                    defaultMessage={'Only at MM'}
                />
            </Link>
            <button
                className={classes.suggestion}
                onClick={() => handleSelectSuggestion(formatMessage({ id: 'botSuggestion.searchAI', defaultMessage: 'Chicken, Pork, Beef' }))}
            >
                <FormattedMessage
                    id={'botSuggestion.searchAI'}
                    defaultMessage={'Chicken, Pork, Beef'}
                />
            </button>
        </div>
    );
});

const ErrorMessage = memo(({ classes, handleNewSession }) => {
    const { formatMessage } = useIntl();

    return (
        <div className={classes.errorMessage}>
            <div className={classes.botMessage}>
                <span className={classes.botAvt}></span>
                <div className={classes.inner}>
                    <i>
                        <FormattedMessage
                            id={'aiChatbox.newSessionMessage'}
                            defaultMessage={'Sorry, the system is having problems. Please click here to restart the conversation.'}
                        />
                    </i>
                </div>
            </div>
            <div className={classes.suggestions}>
                <button
                    type="button"
                    className={classes.suggestion}
                    onClick={handleNewSession}
                    title={formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
                >
                        <span>
                            <FormattedMessage
                                id={'aiChatbox.newSession'}
                                defaultMessage={'Start new session'}
                            />
                        </span>
                </button>
            </div>
        </div>
    );
});

// Memoized individual chat event component
const ChatEvent = memo(({
    item,
    keywordsGroup,
    classes,
    renderContent,
    setShowProducts,
    setFullscreen,
    setProductKeywords,
    handleShowFrame,
    handleChatbotOpened,
    handleSelectSuggestion,
    handleChat,
    signInRedirect,
    setSignInRedirect,
    setLoading
}) => {
    const role = item.content?.role || null;
    const parts = item?.content?.parts || [];

    if (!role || !parts?.length) return null;
    const isCustomer = (role === 'user') && !(parts.some(p => p?.functionCall) || parts.some(p => p?.functionResponse));

    const { text, closing, cta, skus, cartDetail, orderDetail, keywords, images, voices, files } = useMemo(() => {
        const texts = [];
        const closings = [];
        const ctaBtn = [];
        const products = [];
        const cartData = [];
        const orderData = [];
        const imgs = [];
        const vcs = [];
        const fls = [];
        const keywordsData = {};

        for (const part of parts) {
            if (!part?.thought) {
                if (typeof part.text === 'string') {
                    const {
                        message,
                        closingMessage,
                        prods,
                        cart,
                        order,
                        ctaButtons
                    } = parseJsonMessage(part.text);
                    if (message) texts.push(message);
                    if (closingMessage) closings.push(closingMessage);
                    if (Array.isArray(ctaButtons)) ctaBtn.push(...ctaButtons);
                    if (Array.isArray(prods)) products.push(...prods);
                    if (cart && typeof cart === 'object') cartData.push(cart);
                    if (order && typeof order === 'object') orderData.push(order);
                } else if (part?.functionCall?.name === 'search_products_async') {
                    const id = part.functionCall.id;
                    const keywordData = part?.functionCall.args?.keyword;
                    if (keywordData) keywordsData[id] = { keywordData, data: null };
                } else if (part?.functionResponse?.name === 'search_products_async') {
                    const id = part.functionResponse.id;
                    const keywordData = part?.functionResponse.response?.data || [];
                    if (keywordData) keywordsData[id] = {
                        ...keywordsData[id],
                        data: keywordData || []
                    };
                }

                const inline = part.inlineData;
                const mime = inline?.mimeType || inline?.mime_type || '';
                if (mime.startsWith('image/')) imgs.push(inline);
                if (mime.startsWith('audio/')) vcs.push(inline);
                if (mime.startsWith('application/')) fls.push(inline);
            }
        }

        const combinedText = texts.filter(Boolean).join('\n\n');
        const combinedClosing = closings.filter(Boolean).join('\n\n');
        const uniqueSkus = Array.from(new Set(products.map(p => String(p?.sku || '').trim()).filter(Boolean)));
        // const uniqueCart = Array.from(new Set(cartData.map(p => String(p?.sku || '').trim()).filter(Boolean)));
        // const uniqueOrder = Array.from(new Set(orderData.map(p => String(p?.sku || '').trim()).filter(Boolean)));

        return {
            text: combinedText,
            closing: combinedClosing,
            cta: ctaBtn,
            skus: uniqueSkus,
            cartDetail: cartData,
            orderDetail: orderData,
            keywords: keywordsData,
            images: imgs,
            voices: vcs,
            files: fls
        };
    }, [parts, role]);

    // Nếu mọi thứ đều rỗng thì bỏ qua
    if (!text && !closing && !cta?.length && !skus?.length && !cartDetail?.length && !orderDetail?.length && !keywords?.length && !images?.length && !voices?.length && !files?.length && !keywordsGroup.queries.length && !keywordsGroup.pairs.length) {
        return null;
    }

    if (role === 'model') {
        return <BotMessage
            key={item.id}
            html={text}
            closingHtml={closing}
            cta={cta}
            skus={skus}
            cart={cartDetail}
            order={orderDetail}
            classes={classes}
            renderContent={renderContent}
            handleSelectSuggestion={handleSelectSuggestion}
            setShowProducts={setShowProducts}
            setFullscreen={setFullscreen}
            keywords={keywordsGroup}
            keywordsData={keywords}
            setProductKeywords={setProductKeywords}
            handleShowFrame={handleShowFrame}
            handleChatbotOpened={handleChatbotOpened}
            handleChat={handleChat}
            signInRedirect={signInRedirect}
            setSignInRedirect={setSignInRedirect}
            setLoading={setLoading}
        />;
    }
    if (isCustomer) {
        return (
            <CustomerMessage
                text={text}
                images={images}
                voices={voices}
                files={files}
                classes={classes}
                renderContent={renderContent}
            />
        );
    }

    return null;
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.timestamp === nextProps.item.timestamp &&
        JSON.stringify(prevProps.keywordsGroup) === JSON.stringify(nextProps.keywordsGroup)
    );
});

const AIChatContent = props => {
    const {
        chatEvents,
        processing,
        setLoading,
        searchKeyProcessing,
        timeoutMessage,
        tryAgainMessage,
        setShowProducts,
        setFullscreen,
        handleSelectSuggestion,
        setProductKeywords,
        handleShowFrame,
        handleChatbotOpened,
        handleNewSession,
        handleChat,
        signInRedirect,
        setSignInRedirect
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const { formatMessage } = useIntl();
    const containerRef = useRef(null);
    const bottomRef = useRef(null);

    const isIOS = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);

    useEffect(() => {
        const behavior = isIOS ? 'auto' : 'smooth';
        if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
            bottomRef.current?.scrollIntoView({ behavior: behavior, block: 'end', inline: 'nearest' });
        } else if (containerRef.current) {
            const el = containerRef.current;
            el.scrollTop = el.scrollHeight;
        }
    }, [chatEvents, processing, isIOS, bottomRef, containerRef]);

    // Memoized render content function
    const renderContent = useCallback((content, onlyText = false) => {
        if (isValidElement(content) || onlyText) return content;
        if (typeof content === "string") return toHTML(content);
        return null;
    }, []);

    // Memoized bot start message
    const botStartMessage = useMemo(() => (
        <div>
            <p>
                <FormattedMessage
                    id={'botStartMessage.welcome'}
                    defaultMessage={"Hello, I am MM's shopping assistant. How can I help you?"}
                />
            </p>
        </div>
    ), [classes.blueText]);

    // Memoized default suggestions
    const defaultSuggestions = useMemo(() => ['Thực phẩm tốt cho sức khỏe', 'Tìm gạo ST25'], []);

    /**
     * Gom TẤT CẢ keywords theo invocationId trên toàn bộ chatEvents
     * - byInvocation: {
     *     [invocationId]: {
     *        queries: string[],                      // tất cả query theo thứ tự xuất hiện
     *        pairs: Array<{ id, query, data }>,      // chỉ khi functionCall.id === functionResponse.id
     *     }
     *   }
     */
    const keywordGroups = useMemo(() => {
        const byInvocation = new Map();

        // Lưu tạm mapping id -> {invocationId, query} và id -> data
        const idToMeta = new Map(); // id -> { invocationId, query }
        const idToData = new Map(); // id -> data

        const ensureGroup = (invId) => {
            if (!byInvocation.has(invId)) {
                byInvocation.set(invId, { queries: [], pairs: [] });
            }
            return byInvocation.get(invId);
        };

        // Quét theo thứ tự sự kiện
        for (const ev of Array.isArray(chatEvents) ? chatEvents : []) {
            const invId = ev?.invocationId;
            const parts = ev?.content?.parts || [];
            if (!invId || !parts?.length) continue;

            const group = ensureGroup(invId);

            for (const part of parts) {
                if (!part || part.thought) continue;

                // functionCall: nhớ query + invId + id
                const fc = part.functionCall;
                if (fc?.id) {
                    const q = (typeof fc?.args?.keyword === 'string') ? fc.args.keyword : null;
                    idToMeta.set(fc.id, { invocationId: invId, query: q });
                    if (typeof q === 'string' && q.trim()) {
                        group.queries.push(q);
                    }
                }

                // functionResponse: lưu data, nếu có meta tương ứng thì ghép đôi
                const fr = part.functionResponse;
                if (fr?.id) {
                    const data = fr?.response?.data || null;
                    idToData.set(fr.id, data);

                    const meta = idToMeta.get(fr.id);
                    if (meta && meta.invocationId === invId) {
                        group.pairs.push({
                            id: fr.id,
                            query: meta.query || null,
                            data
                        });
                    }
                }
            }
        }

        // Chuẩn hoá: unique queries theo thứ tự
        const out = {};
        for (const [invId, { queries, pairs }] of byInvocation.entries()) {
            const seen = new Set();
            const uniqQueries = [];
            for (const q of queries) {
                const k = String(q);
                if (!seen.has(k)) {
                    seen.add(k);
                    uniqQueries.push(k);
                }
            }
            out[invId] = { queries: uniqQueries, pairs };
        }
        return out;
    }, [chatEvents]);

    // Memoized chat events with stable keys
    const memoizedChatEvents = useMemo(() => {
        if (!chatEvents || chatEvents.length === 0) return [];
        return chatEvents.map((item) => {
            const invId = item?.invocationId || '';
            const keywordsGroup = keywordGroups[invId] || { queries: [], pairs: [] };

            return (
                <Fragment key={`${item.id}-${item.timestamp}`}>
                    <ChatEvent
                        item={item}
                        keywordsGroup={keywordsGroup}
                        classes={classes}
                        renderContent={renderContent}
                        setShowProducts={setShowProducts}
                        setFullscreen={setFullscreen}
                        setProductKeywords={setProductKeywords}
                        handleShowFrame={handleShowFrame}
                        handleChatbotOpened={handleChatbotOpened}
                        handleSelectSuggestion={handleSelectSuggestion}
                        handleChat={handleChat}
                        signInRedirect={signInRedirect}
                        setSignInRedirect={setSignInRedirect}
                        setLoading={setLoading}
                    />
                </Fragment>
            );
        });
    }, [chatEvents, keywordGroups, classes, renderContent, setShowProducts, setFullscreen, setProductKeywords]);

    return (
        <div
            className={classes.root}
            ref={containerRef}
        >
            <BotMessage html={botStartMessage} classes={classes} renderContent={renderContent} setLoading={setLoading} />
            {/*<Suggestions keywords={defaultSuggestions} handleSelectSuggestion={handleSelectSuggestion} classes={classes} />*/}
            {memoizedChatEvents}
            {(!processing && timeoutMessage) && <BotMessage classes={classes} html={formatMessage({ id: 'aiChatbox.timeoutMessage', defaultMessage: 'It seems the connection is unstable. Could you please try again with different content?' })} renderContent={renderContent} />}
            {(!processing && tryAgainMessage) && <ErrorMessage classes={classes} handleNewSession={handleNewSession} />}

            <FirstSuggestions classes={classes} handleChatbotOpened={handleChatbotOpened} handleSelectSuggestion={handleSelectSuggestion} />
            {processing && (
                <>
                    {(searchKeyProcessing?.type === 'searchProduct' && searchKeyProcessing?.keys) ? (
                        <BotMessageProcessing text={`${formatMessage({ id: 'botMessage.processingProduct', defaultMessage: 'Searching for products with keywords' })} "${searchKeyProcessing.keys}"`} classes={classes} />
                    ) : (
                        <BotMessageProcessing classes={classes} />
                    )}
                </>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default AIChatContent;
