import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import Icon from "@magento/venia-ui/lib/components/Icon";
import { AlertCircle as AlertCircleIcon } from "react-feather";
import { useToasts } from "@magento/peregrine";
import { useCartContext } from "@magento/peregrine/lib/context/cart";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {
    getAllSessionIds,
    getLatestSessionId,
    createNewSessionId,
    removeSessionId,
    clearAllSessionIds
} from "./aiSession";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {useHistory, useLocation} from "react-router-dom";
import { useQuery } from '@apollo/client';
import {MINI_CART_QUERY} from '../../../override/Components/MiniCart/miniCart.gql';
import {useAppContext} from "@magento/peregrine/lib/context/app";
import Cookies from "js-cookie";

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const useAIChatbox = props => {
    const {
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
        onKeywordsUpdate,
        onProductsUpdate
    } = props;
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const [{ cartId }] = useCartContext();
    const [{ currentUser, token }] = useUserContext();
    const location = useLocation();
    const history = useHistory();
    const [{ drawer }, { toggleDrawer, closeDrawer }] = useAppContext();

    // Get mini cart refetch function for updating cart when AI performs cart operations
    const { refetch: refetchMiniCart } = useQuery(MINI_CART_QUERY,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            variables: { cartId },
            skip: !cartId,
            errorPolicy: 'all'
        }
    );

    const browserSession = sessionStorage.getItem('aiBrowserSession');

    const [userId, setUserId] = useState(currentUser?.customer_uid || 'user');
    const [sessionId, setSessionId] = useState(browserSession || null);
    const [mergeSessionReady, setMergeSessionReady] = useState(false);
    const [chatbotHistory, setChatbotHistory] = useState([]);
    const [historyKeyword, setHistoryKeyword] = useState(null);
    const [fetchHistory, setFetchHistory] = useState(true);
    const [chatEvents, setChatEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchKeyProcessing, setSearchKeyProcessing] = useState(null);
    const [searchKey, setSearchKey] = useState("");
    const [searchKeyInput, setSearchKeyInput] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [fileResetKey, setFileResetKey] = useState(0);
    const [fileName, setFileName] = useState(null);
    const [imageResetKey, setImageResetKey] = useState(0);
    const [imageName, setImageName] = useState(null);
    const [voiceName, setVoiceName] = useState(null);
    const [payload, setPayload] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [timeoutMessage, setTimeoutMessage] = useState(false);
    const [tryAgainMessage, setTryAgainMessage] = useState(false);
    const [tooltipDisplay, setTooltipDisplay] = useState(!browserSession);
    const [sessionTooLarge, setSessionTooLarge] = useState(false);
    const [ageConfirm, setAgeConfirm] = useState(false);
    const [ageConfirmId, setAgeConfirmId] = useState(null);

    useEffect(() => {
        setUserId(currentUser?.customer_uid || 'user');
    }, [currentUser?.customer_uid]);

    useEffect(() => {
        if (tooltipDisplay) {
            const id = setTimeout(() => setTooltipDisplay(false), 6000);
            return () => clearTimeout(id);
        }
    }, [tooltipDisplay]);

    const storage = new BrowserPersistence();
    const storeViewCode = storage.getItem("store_view_code");
    const language = storage.getItem("language")?.code || storeViewCode?.slice(-2) || null;
    const storeName = storage.getItem('store')?.storeInformation?.name || null;

    // Track all active requests to abort on unmount
    const controllersRef = useRef(new Set());
    const addPending = c => {
        controllersRef.current.add(c);
    };
    const removePending = c => {
        controllersRef.current.delete(c);
    };

    // Use useRef to keep track of the most recent sessionId
    const sessionIdRef = useRef(sessionId);
    useEffect(() => {
        sessionIdRef.current = sessionId;  // Always keep sessionId updated
    }, [sessionId]);

    useEffect(() => {
        return () => {
            // Abort any inflight requests
            controllersRef.current.forEach(c => {
                try {
                    c.abort();
                } catch {}
            });
            controllersRef.current.clear();

            // Clear any pending debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!errorMessage) return;
        const id = setTimeout(() => setErrorMessage(null), 10000);
        return () => clearTimeout(id);
    }, [errorMessage]);

    const mergeChatEvents = (previousEvents, newEvents) => {
        const previousList = Array.isArray(previousEvents) ? previousEvents : [];
        const incomingList = Array.isArray(newEvents) ? newEvents : [];
        const combinedList = [...previousList, ...incomingList];

        const itemsWithId = [];
        const itemsWithoutId = [];
        for (const eventItem of combinedList) {
            if (eventItem && eventItem.id) itemsWithId.push(eventItem);
            else itemsWithoutId.push(eventItem);
        }

        const latestByIdMap = itemsWithId.reduce((accumulator, eventItem) => {
            accumulator[eventItem.id] = eventItem;
            return accumulator;
        }, {});

        const deduplicatedWithId = Object.values(latestByIdMap);
        return [...itemsWithoutId, ...deduplicatedWithId].sort(
            (l, r) => (l?.timestamp || 0) - (r?.timestamp || 0)
        );
    };

    const getHistory = useCallback(
        async () => {
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/session_title`;
            if (!url) return [];
            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': REACT_APP_AI_SEARCH_KEY ? `Bearer ${REACT_APP_AI_SEARCH_KEY}` : undefined
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        ...(userId === 'user' ? {session_ids: getAllSessionIds() || []} : {})
                    }),
                    signal: controller.signal
                });

                if (res?.ok) {
                    const responseJson = await res.json();
                    setChatbotHistory(Array.isArray(responseJson) ? responseJson : []);
                }
                return !!res?.ok;
            } catch (error) {
                console.log(
                    `Chatbot error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [userId]
    );

    const searchHistory = useCallback(
        async (query) => {
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/session_search`;
            if (!url) return [];
            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': REACT_APP_AI_SEARCH_KEY ? `Bearer ${REACT_APP_AI_SEARCH_KEY}` : undefined
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        query,
                        limit: 20,
                        page: 1,
                        ...(userId === 'user' ? {session_ids: getAllSessionIds() || []} : {})
                    }),
                    signal: controller.signal
                });

                if (res?.ok) {
                    const responseJson = await res.json();
                    setChatbotHistory(Array.isArray(responseJson) ? responseJson : []);
                }
                return !!res?.ok;
            } catch (error) {
                console.log(
                    `Chatbot error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [userId]
    );

    const handleGetHistory = useCallback(
        async (query = historyKeyword || null) => {
            if (query) {
                searchHistory(query);
            } else {
                getHistory();
            }
        },
        [historyKeyword, getHistory, searchHistory]
    );

    const mergeSession = useCallback(
        async () => {
            if (userId === 'user') return;
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/session_merge`;
            if (!url) return [];
            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': REACT_APP_AI_SEARCH_KEY ? `Bearer ${REACT_APP_AI_SEARCH_KEY}` : undefined
                    },
                    body: JSON.stringify({
                        new_user_id: userId,
                        old_user_id: 'user',
                        session_ids: getAllSessionIds() || []
                    }),
                    signal: controller.signal
                });

                return !!res?.ok;
            } catch (error) {
                console.log(
                    `Chatbot error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [userId]
    );

    useEffect(() => {
        if (userId !== 'user' && !mergeSessionReady) {
            mergeSession();
            setMergeSessionReady(true);
        }
    }, [mergeSessionReady, userId])

    const createSession = useCallback(
        async ({ id, magentoSessionId }) => {
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${id}`;
            if (!url) return [];
            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        store: storeViewCode || ""
                    },
                    id,
                    appName: "mmvn_b2c_agent",
                    userId: userId,
                    body: JSON.stringify({
                        state: {
                            magento_session_data: {
                                base_url: window.location.origin,
                                magento_cart_id: cartId,
                                signin_token: token || null,
                                magento_session_id: magentoSessionId || null,
                                store_id: storeViewCode,
                                language: language
                            }
                        }
                    }),
                    signal: controller.signal
                });

                setChatEvents([]);
                setProductKeywords(false);
                setShowProducts(null);
                sessionStorage.setItem('aiBrowserSession', id);
                return !!res?.ok;
            } catch (error) {
                setChatEvents([]);
                console.log(
                    `Chatbot error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [cartId, token, userId, storeViewCode, language]
    );

    const updateSession = useCallback(
        async ({ id, magentoCartId, magentoToken, magentoSessionId }) => {
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${id}`;
            if (!url) return false;

            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        store: storeViewCode || ""
                    },
                    body: JSON.stringify({
                        magento_session_data: {
                            base_url: window.location.origin,
                            magento_cart_id: magentoCartId,
                            signin_token: magentoToken || null,
                            magento_session_id: magentoSessionId || null,
                            store_id: storeViewCode,
                            language: language
                        }
                    }),
                    signal: controller.signal
                });

                return !!res?.ok;
            } catch (error) {
                console.log(
                    `Chatbot updateSession error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [userId, storeViewCode, language]
    );

    const getSession = useCallback(async (id) => {
        const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${id || sessionIdRef.current}`; // use sessionIdRef
        if (!url) return [];
        const controller = new AbortController();
        addPending(controller);
        try {
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    store: storeViewCode || ""
                },
                signal: controller.signal
            });

            if (!res.ok) {
                setChatEvents([]);
                return false;
            }

            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const responseJson = await res.json();
                setChatEvents(Array.isArray(responseJson?.events) ? responseJson.events : []);

                const sessionCartId = responseJson?.state?.state?.magento_session_data?.magento_cart_id || null;
                const sessionToken = responseJson?.state?.state?.magento_session_data?.signin_token || null;
                const sessionStoreId = responseJson?.state?.state?.magento_session_data?.store_id || null;
                const sessionLanguage = responseJson?.state?.state?.magento_session_data?.language || null;
                if ((sessionCartId && sessionCartId !== cartId) || (sessionToken && sessionToken !== token) || (sessionStoreId && sessionStoreId !== storeViewCode) || (sessionLanguage && sessionLanguage !== language)) {
                    updateSession({
                        id: sessionId,
                        magentoCartId: cartId,
                        magentoToken: token || null,
                        magentoSessionId: null
                    }).then((success) => {
                        if (success) {
                            console.log(`Successfully updated AI session`);
                        } else {
                            console.log(`Failed to update AI session`);
                        }
                    }).catch((error) => {
                        console.error(`Error updating session ${sessionId}:`, error);
                    });
                }
            } else {
                setChatEvents([]);
            }
            sessionStorage.setItem('aiBrowserSession', id || sessionIdRef.current);
            return !!res?.ok;
        } catch (error) {
            console.log(
                `Chatbot error: msg - ${error?.message}. stack - ${error?.stack}`
            );
            return false;
        } finally {
            removePending(controller);
        }
    }, [cartId, token, userId, storeViewCode, language, updateSession, setChatEvents]);

    // Monitor cartId changes and update the current session
    useEffect(() => {
        if (cartId && sessionId && chatbotActive) {
            // Update the current session with the new cartId
            updateSession({
                id: sessionId,
                magentoCartId: cartId,
                magentoToken: token || null,
                magentoSessionId: null
            }).then((success) => {
                if (success) {
                    console.log(`Successfully updated AI session`);
                } else {
                    console.log(`Failed to update AI session`);
                }
            }).catch((error) => {
                console.error(`Error updating session ${sessionId}:`, error);
            });
        }
    }, [cartId, token, sessionId, updateSession, chatbotActive]);

    // Helper function to extract and process keywords/products from streaming events
    const processStreamingEvent = useCallback((evt) => {
        if (!evt || !evt.content || !evt.content.parts) return;

        const parts = evt.content.parts;
        const keywordData = {};
        const products = [];
        let hasCartModification = false;

        // List of function names that modify the cart and require mini cart refetch
        const cartModifyingFunctions = [
            'add_product_to_cart',
            'remove_product_sku_from_cart',
            'remove_cart_item',
            'update_cart_with_product_sku',
            'update_cart_with_row_id'
        ];

        for (const part of parts) {
            if (!part || part.thought) continue;

            // Extract function calls for search_products_async
            if (part?.functionCall?.name === 'search_products_async') {
                const id = part.functionCall.id;
                const keyword = part?.functionCall.args?.keyword;
                if (keyword && id) {
                    keywordData[id] = { keyword, data: null };
                }
            }

            // Extract function responses with product data
            if (part?.functionResponse?.name === 'search_products_async') {
                const id = part.functionResponse.id;
                const data = part?.functionResponse.response?.data || [];
                if (id && Array.isArray(data)) {
                    keywordData[id] = { ...keywordData[id], data };
                    // Use the full product objects, not just SKUs
                    products.push(...data);
                }
            }

            // Extract function responses with switch store
            if (part?.functionResponse?.name === 'trigger_change_store') {
                handleSaveToStorage({fullScreen: false, switchStore: true, adkId: part.functionResponse.id});
                toggleDrawer('storeLocation');
            }

            // Extract function responses with switch store
            if (part?.functionResponse?.name === 'age_verify') {
                setAgeConfirmId(part.functionResponse.id);
                setAgeConfirm(true);
            }

            // Check for cart-modifying function responses (but don't refetch immediately)
            if (part?.functionResponse && cartModifyingFunctions.includes(part.functionResponse.name)) {
                // If the function response indicates success, mark that we need refetch after completion
                const response = part.functionResponse.response;
                if (response?.success === true || (response && !response.hasOwnProperty('success'))) {
                    hasCartModification = true;
                }
            }

            // Extract product SKUs from text content
            if (typeof part.text === 'string') {
                try {
                    const parsed = JSON.parse(part.text);
                    if (parsed?.product_data && Array.isArray(parsed.product_data)) {
                        // Use the full product objects from text content too
                        products.push(...parsed.product_data);
                    }
                } catch {
                    // Not JSON, continue
                }
            }
        }

        return { keywordData, products, hasCartModification };
    }, []);

    // Debounce mechanism for real-time updates to avoid too frequent calls
    const debounceTimeoutRef = useRef({ keywords: null, products: null });
    const accumulatedDataRef = useRef({ keywords: new Map(), products: new Map() });

    // Track if cart modifications occurred during the current stream to refetch after completion
    const cartModificationRef = useRef(false);

    const debounceUpdate = useCallback((type, callback, dataRetriever) => {
        if (debounceTimeoutRef.current[type]) {
            clearTimeout(debounceTimeoutRef.current[type]);
        }

        debounceTimeoutRef.current[type] = setTimeout(() => {
            if (callback && dataRetriever) {
                const freshData = dataRetriever();
                callback(freshData);
            }
        }, 100); // Reduced from 300ms to 100ms for faster updates
    }, []);

    /**
     * Stream SSE and push events as they arrive using @microsoft/fetch-event-source
     */
    const callThirdPartyStream = useCallback(
        async ({ parts = [], streaming = true, onEvent, onError, onDone, sessionOverride, onKeywordUpdate, onProductUpdate } = {}) => {
            if (!REACT_APP_AI_SEARCH_URL) return;
            const url = `${REACT_APP_AI_SEARCH_URL}run_sse`;
            const controller = new AbortController();
            addPending(controller);

            // Always use the freshest sessionId
            const sid = sessionOverride || sessionIdRef.current;

            // Track accumulated keywords and products for progressive updates
            // Clear any previous data for new stream
            accumulatedDataRef.current.keywords = new Map();
            accumulatedDataRef.current.products = new Map();
            cartModificationRef.current = false; // Reset cart modification flag for new stream
            const accumulatedKeywords = accumulatedDataRef.current.keywords;
            const accumulatedProducts = accumulatedDataRef.current.products;

            try {
                const ageVerified = Cookies.get('ageConfirmed');
                await fetchEventSource(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "text/event-stream",
                        ...(REACT_APP_AI_SEARCH_KEY
                            ? { Authorization: `Bearer ${REACT_APP_AI_SEARCH_KEY}` }
                            : {}),
                        store: storeViewCode || ""
                    },
                    body: JSON.stringify({
                        appName: "mmvn_b2c_agent",
                        userId: userId,
                        sessionId: sid,
                        state_delta: {
                            age_verified: !!ageVerified
                        },
                        newMessage: {
                            role: "user",
                            parts
                        },
                        streaming
                    }),
                    signal: controller.signal,
                    // tùy chọn: không auto-retry
                    retry: 0,
                    openWhenHidden: true,

                    onopen: (res) => {
                        if (!res.ok) {
                            onError?.({ status: res.status });
                            // throw để dừng fetchEventSource
                            throw new Error(`SSE open failed: ${res.status}`);
                        }
                    },

                    onmessage: (msg) => {
                        // msg.data là payload đã được lib gộp theo chuẩn SSE
                        if (!msg?.data) return;
                        try {
                            const obj = JSON.parse(msg.data);

                            if (obj?.actions?.stateDelta?.input_token_count && obj.actions.stateDelta.input_token_count > 41000) {
                                setTooltipDisplay(true);

                                if (obj?.actions?.stateDelta?.input_token_count && obj.actions.stateDelta.input_token_count > 100000) {
                                    setSessionTooLarge(true);
                                }
                            }

                            // Process streaming event for keywords and products
                            const { keywordData, products, hasCartModification } = processStreamingEvent(obj);

                            if (keywordData && Object.keys(keywordData || {})?.length > 0) {
                                const keys = Object.values(keywordData)
                                    .map(v => v?.keyword)
                                    .filter(Boolean)
                                    .join(', ')

                                if (keys) {
                                    setFullscreen(true);
                                    setSearchKeyProcessing({ type: 'searchProduct', keys })
                                }
                            }

                            // Track if any cart modifications occurred during this stream
                            if (hasCartModification) {
                                cartModificationRef.current = true;
                            }

                            // Update accumulated keywords
                            let keywordsUpdated = false;
                            for (const [id, data] of Object.entries(keywordData)) {
                                if (data.keyword || data.data) {
                                    const existing = accumulatedKeywords.get(id) || {};
                                    const updated = { ...existing, ...data };
                                    accumulatedKeywords.set(id, updated);
                                    keywordsUpdated = true;
                                }
                            }

                            // Update accumulated products
                            let productsUpdated = false;
                            for (const product of products) {
                                const sku = product?.sku;
                                if (sku && !accumulatedProducts.has(sku)) {
                                    accumulatedProducts.set(sku, product); // Store full product object
                                    productsUpdated = true;
                                }
                            }

                                // Trigger real-time updates if we have new data
                                if (keywordsUpdated || productsUpdated) {
                                    // Helper function to build current keywords data
                                    const buildKeywordsData = () => {
                                        const keywordPairs = [];
                                        const queries = [];

                                        for (const [id, data] of accumulatedKeywords.entries()) {
                                            if (data.keyword) {
                                                if (data.data?.length > 0) {
                                                    queries.push(data.keyword);
                                                    keywordPairs.push({
                                                        id,
                                                        query: data.keyword,
                                                        data: data.data
                                                    });
                                                }
                                            }
                                        }

                                        // Remove duplicates from queries
                                        const uniqueQueries = [...new Set(queries)];

                                        return {
                                            queries: uniqueQueries,
                                            pairs: keywordPairs
                                        };
                                    };

                                    // Helper function to build current products data
                                    const buildProductsData = () => {
                                        const keywordsData = buildKeywordsData();
                                        const firstPairWithData = keywordsData.pairs.find(p => p.data && Array.isArray(p.data));
                                        return firstPairWithData ? firstPairWithData.data : Array.from(accumulatedProducts.values());
                                    };

                                    // Always trigger keyword updates when there are queries, even if no new keywords were added
                                    // This ensures pairs get updated when function responses arrive
                                    const currentKeywordsData = buildKeywordsData();
                                    if (currentKeywordsData?.queries?.length) {
                                        debounceUpdate('keywords', onKeywordsUpdate, buildKeywordsData);

                                        // If we have keywords but showProducts is still null, initialize it
                                        // This ensures the sidebar shows even before product data arrives
                                        setShowProducts(prevProducts => {
                                            if (prevProducts === null) {
                                                return [];
                                            }
                                            return prevProducts;
                                        });
                                    }

                                    if (productsUpdated && accumulatedProducts.size > 0) {
                                        const currentProductsData = buildProductsData();
                                        debounceUpdate('products', onProductsUpdate, buildProductsData);
                                    }
                                }                            // Always call the original onEvent
                            onEvent?.(obj);
                        } catch {
                            setTimeoutMessage(true);
                            // bỏ qua frame không phải JSON
                        }
                    },

                    onclose: () => {
                        // Trigger mini cart refetch if cart modifications occurred during the stream
                        if (cartModificationRef.current && refetchMiniCart) {
                            try {
                                refetchMiniCart();
                                console.log('Mini cart refetched after AI cart modifications');
                            } catch (error) {
                                console.warn('Failed to refetch mini cart after stream completion:', error);
                            }
                        }
                        onDone?.();
                    },

                    onerror: (err) => {
                        onError?.({ error: err });
                        addToast({
                            type: "error",
                            icon: errorIcon,
                            message: err.message,
                            dismissable: true,
                            timeout: 7000
                        });
                        setTryAgainMessage(true);
                        // throw để dừng stream
                        throw err;
                    }
                });
            } catch (e) {
                // lỗi đã báo qua onerror; đảm bảo gọi onDone
                onDone?.();
            } finally {
                removePending(controller);
            }
        },
        [userId, storeViewCode, processStreamingEvent, debounceUpdate, refetchMiniCart]
    );

    const handleImage = (data, name) => {
        setPayload(prev => ({ ...prev, ...data }));
        setImageName(typeof name === "string" ? name : "");
    };
    const handleFile = (data, name) => {
        setPayload(prev => ({ ...prev, ...data }));
        setFileName(typeof name === "string" ? name : "");
    };
    const handleVoice = useCallback(
        (data, name) => {
            if (data?.transcription) {
                const searchText = data.transcription;
                setSearchKey(searchText);
                handleConfirm({ searchText, payload });
            } else {
                const payloadData = { ...payload, ...data };
                setPayload(prev => ({ ...prev, ...data }));
                setVoiceName(typeof name === "string" ? name : "");
                handleConfirm({ searchKey, payloadData });
            }
        },
        [payload, searchKey]
    );

    const handleSelectSuggestion = useCallback(
        async searchText => {
            setSearchKeyInput(searchText);
            setSearchKey(searchText);
            handleConfirm({ searchText, payloadData: payload });
        },
        [payload]
    );

    const removeAll = () => {
        setPayload({});
        setSearchKeyInput("");
        setSearchKey("");
        setShowProducts(null);
    };

    useEffect(() => {
        if (!defaultOpen) return;
        let mounted = true;
        (async () => {
            if (sessionId) {
                const session = await getSession();
                if (!mounted) return;
                if (session) {
                    setChatbotOpened(true);
                    const aiChatbotStorageData = sessionStorage.getItem('aiChatbot');
                    const aiChatbotData = aiChatbotStorageData ? JSON.parse(aiChatbotStorageData) : null;
                    if (aiChatbotData?.adkId && aiChatbotData?.switchStore) {
                        const parts = [
                            {
                                "functionResponse": {
                                    "id": aiChatbotData.adkId,
                                    "willContinue": false,
                                    "name": "trigger_change_store",
                                    "response": {
                                        "status": "done",
                                        "old_store_name": aiChatbotData.oldStore,
                                        "new_store_name": storeName
                                    }
                                }
                            }
                        ];
                        setProcessing(true);
                        await sendMessage({parts});
                    }
                } else {
                    const result = await createSession({ id: sessionId, magentoSessionId: null });
                    if (!mounted) return;
                    if (result) {
                        setChatbotOpened(true);
                    } else {
                        addToast({
                            type: "error",
                            icon: errorIcon,
                            message: formatMessage({
                                id: "global.errorText",
                                defaultMessage: "Something went wrong. Please refresh and try again."
                            }),
                            dismissable: true,
                            timeout: 7000
                        });
                    }
                }
            } else {
                const newSessionId = await createNewSessionId();
                if (!mounted) return;
                const result = await createSession({ id: newSessionId, magentoSessionId: null });
                if (!mounted) return;
                if (result) {
                    setSessionId(newSessionId);
                    setChatbotOpened(true);
                } else {
                    addToast({
                        type: "error",
                        icon: errorIcon,
                        message: formatMessage({
                            id: "global.errorText",
                            defaultMessage: "Something went wrong. Please refresh and try again."
                        }),
                        dismissable: true,
                        timeout: 7000
                    });
                }
            }
            setChatbotActive(true);
            // remove chatbot=true in session and location.search
            sessionStorage.removeItem('aiChatbot');
            const params = new URLSearchParams(location.search);
            if (params.get("chatbot") === "true") {
                params.delete("chatbot");
                const s = params.toString();
                const next = { pathname: location.pathname, search: s ? `?${s}` : "", hash: location.hash };
                const current = `${location.pathname}${location.search}${location.hash}`;
                const target = `${next.pathname}${next.search}${next.hash}`;
                if (target !== current) history.replace(next);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [defaultOpen, sessionId, setChatbotActive, setChatbotOpened, addToast, formatMessage, getSession, createSession, setSessionId]);

    const handleOpenChat = useCallback(
        async ({ magentoSessionId = null }) => {
            handleCloseChat();
            try {
                setLoading(true);
                if (chatbotActive) {
                    setFullscreen(false);
                    setHistoryOpened(false);
                    setChatbotOpened(true);
                } else {
                    setChatbotActive(true);
                    setFullscreen(false);
                    if (sessionId) {
                        const session = await getSession();
                        if (session) {
                            setChatbotOpened(true);
                        } else {
                            const result = await createSession({id: sessionId, magentoSessionId});
                            if (result) {
                                setChatbotOpened(true);
                            } else {
                                addToast({
                                    type: "error",
                                    icon: errorIcon,
                                    message: formatMessage({
                                        id: "global.errorText",
                                        defaultMessage:
                                            "Something went wrong. Please refresh and try again."
                                    }),
                                    dismissable: true,
                                    timeout: 7000
                                });
                            }
                        }
                    } else {
                        const newSessionId = await createNewSessionId();
                        const result = await createSession({id: newSessionId, magentoSessionId});
                        if (result) {
                            setSessionId(newSessionId);
                            setChatbotOpened(true);
                        } else {
                            addToast({
                                type: "error",
                                icon: errorIcon,
                                message: formatMessage({
                                    id: "global.errorText",
                                    defaultMessage:
                                        "Something went wrong. Please refresh and try again."
                                }),
                                dismissable: true,
                                timeout: 7000
                            });
                        }
                    }
                }
                setLoading(false);
            } catch (e) {
                setLoading(false);
                addToast({
                    type: "error",
                    icon: errorIcon,
                    message: e.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        },
        [sessionId, setChatbotOpened, getSession, createSession]
    );

    const handleNewSession = useCallback(
        async ({ magentoSessionId = null }) => {
            try {
                // Kill any running handleConfirm processes
                setProcessing(false);
                setTimeoutMessage(false);
                setTryAgainMessage(false);
                setErrorMessage(null);

                // Abort all pending controllers (this will stop any ongoing handleConfirm requests)
                controllersRef.current.forEach(c => {
                    try {
                        c.abort();
                    } catch {}
                });
                controllersRef.current.clear();

                setLoading(true);
                handleGetHistory();
                const newSessionId = await createNewSessionId();
                const result = await createSession({ id: newSessionId, magentoSessionId });
                if (result) {
                    setSessionTooLarge(false);
                    setSessionId(newSessionId);
                    setChatbotOpened(true);
                    setFetchHistory(true)
                } else {
                    addToast({
                        type: "error",
                        icon: errorIcon,
                        message: formatMessage({
                            id: "global.errorText",
                            defaultMessage:
                                "Something went wrong. Please refresh and try again."
                        }),
                        dismissable: true,
                        timeout: 7000
                    });
                }
                setLoading(false);
            } catch (e) {
                setLoading(false);
                addToast({
                    type: "error",
                    icon: errorIcon,
                    message: e.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        },
        [setChatbotOpened, createSession, handleGetHistory]
    );

    const handleSwitchSession = useCallback(
        async ({ sessionTarget, tooLarger = false, magentoSessionId = null }) => {
            try {
                // Kill any running handleConfirm processes
                setProcessing(false);
                setTimeoutMessage(false);
                setTryAgainMessage(false);
                setErrorMessage(null);

                // Abort all pending controllers (this will stop any ongoing handleConfirm requests)
                controllersRef.current.forEach(c => {
                    try {
                        c.abort();
                    } catch {}
                });
                controllersRef.current.clear();

                setLoading(true);
                handleGetHistory();
                const result = await getSession(sessionTarget);
                if (result) {
                    setSessionId(sessionTarget);
                    setSessionTooLarge(tooLarger);
                    setChatbotOpened(true);
                } else {
                    addToast({
                        type: "error",
                        icon: errorIcon,
                        message: formatMessage({
                            id: "aiChatbox.historyNotFound",
                            defaultMessage:
                                "Chat history not found"
                        }),
                        dismissable: true,
                        timeout: 7000
                    });
                }
                setLoading(false);
            } catch (e) {
                setLoading(false);
                addToast({
                    type: "error",
                    icon: errorIcon,
                    message: e.message,
                    dismissable: true,
                    timeout: 7000
                });
            }
        },
        [setChatbotOpened, createSession, getSession, handleGetHistory]
    );

    const handleDeteleSession = useCallback(
        async ({ id }) => {
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${id}`;
            if (!url) return false;

            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    signal: controller.signal
                });
                if (res?.ok) {
                    removeSessionId(id);
                    handleGetHistory();

                    if (id === sessionId) {
                        handleNewSession({magentoSessionId: null});
                    }
                }
                return !!res?.ok;
            } catch (error) {
                console.log(
                    `Chatbot updateSession error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [userId, sessionId, handleNewSession, handleGetHistory]
    );

    const handleDeteleAllSession = useCallback(
        async () => {
            const url = `${REACT_APP_AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions_delete_all`;
            if (!url) return false;
            const controller = new AbortController();
            addPending(controller);
            try {
                const res = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        ...(userId === 'user' ? {session_ids: getAllSessionIds() || []} : {})
                    }),
                    signal: controller.signal
                });

                if (res?.ok) {
                    clearAllSessionIds();
                    setChatbotHistory([]);
                    handleNewSession({magentoSessionId: null});
                }
                return !!res?.ok;
            } catch (error) {
                console.log(
                    `Chatbot error: msg - ${error?.message}. stack - ${error?.stack}`
                );
                return false;
            } finally {
                removePending(controller);
            }
        },
        [userId]
    );

    const buildUserEvent = ({ text, file, image, voice }) => ({
        id: `local-${
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now()
        }`,
        author: "user",
        invocationId: "",
        timestamp: Math.floor(Date.now() / 1000),
        content: {
            role: "user",
            parts: [
                ...(text ? [{ text: String(text) }] : []),
                ...(file ? [{inlineData: {displayName: fileName || "", mimeType: file.mime_type || "*/*", data: file.data}}] : []),
                ...(image ? [{inlineData: {displayName: imageName || "", mimeType: image.mime_type || "image/*", data: image.data}}] : []),
                ...(voice ? [{inlineData: {mimeType: voice.mime_type || "audio/*", data: voice.data}}] : [])
            ]
        },
        actions: {
            stateDelta: {},
            artifactDelta: {},
            requestedAuthConfigs: {},
            requestedToolConfirmations: {}
        },
        longRunningToolIds: []
    });

    const handleConfirm = useCallback(
        async ({ searchText = searchKey, payloadData = payload }) => {
            setErrorMessage(null);
            setTimeoutMessage(false);
            setTryAgainMessage(false);

            const hasText = !!searchText;
            const hasFile = !!payloadData?.file?.data;
            const hasImage = !!payloadData?.image?.data;
            const hasVoice = !!payloadData?.voice?.data;

            if (!hasText && !hasFile && !hasImage && !hasVoice) {
                setShowErrorMessage(true);
                return;
            }
            setShowErrorMessage(false);

            // show user's message immediately
            const userEvent = buildUserEvent({
                text: hasText ? searchText : null,
                file: hasFile ? payloadData.file : null,
                image: hasImage ? payloadData.image : null,
                voice: hasVoice ? payloadData.voice : null
            });
            setChatEvents(prev => mergeChatEvents(prev, [userEvent]));
            setProcessing(true);

            const parts = [];
            if (hasText) parts.push({ text: String(searchText) });
            if (hasFile) parts.push({inlineData: {displayName: fileName || "", mimeType: payloadData.file.mime_type || "*/*", data: payloadData.file.data}});
            if (hasImage) parts.push({inlineData: {displayName: imageName || "", mimeType: payloadData.image.mime_type || "image/*", data: payloadData.image.data}});
            if (hasVoice) parts.push({inlineData: {mimeType: payloadData.voice.mime_type || "audio/*", data: payloadData.voice.data}});

            // Clear inputs; if you want to keep previews until first chunk, move this below.
            removeAll();

            await sendMessage({ parts });
        },
        [payload, searchKey, fileName, imageName, callThirdPartyStream, formatMessage, setShowProducts, onKeywordsUpdate, onProductsUpdate]
    );

    const sendMessage = useCallback(
        async ({ parts }) => {
            // Create a flag to track if the request has completed
            let requestCompleted = false;

            // Set 45-second timeout to show try again message and cancel process
            const timeoutId = setTimeout(() => {
                if (!requestCompleted) {
                    setTimeoutMessage(true);
                    setProcessing(false);
                    // Abort all pending controllers
                    controllersRef.current.forEach(c => {
                        try {
                            c.abort();
                        } catch {}
                    });
                }
            }, 45000); // 45 seconds

            try {
                // Track partial message accumulation
                const partialMessages = new Map();

                // STREAM SSE and update UI incrementally
                await callThirdPartyStream({
                    parts,
                    streaming: true,
                    onEvent: evt => {
                        // Check if event has final_response in actions.stateDelta
                        const hasFinalResponse = evt?.actions?.stateDelta?.final_response;

                        // Handle partial message accumulation or final_response override
                        if ((evt.partial || hasFinalResponse) && evt.invocationId && evt.author) {
                            const messageKey = `${evt.invocationId}_${evt.author}`;

                            // Get existing partial message or create new one
                            const existing = partialMessages.get(messageKey) || { ...evt };

                            if (hasFinalResponse) {
                                // Override accumulated text with final_response
                                if (existing.content && existing.content.parts) {
                                    const newParts = [...existing.content.parts];
                                    // Find text part and replace with final_response
                                    let textPartFound = false;
                                    newParts.forEach((part, index) => {
                                        if (part.text !== undefined && !textPartFound) {
                                            newParts[index] = { ...part, text: hasFinalResponse };
                                            textPartFound = true;
                                        }
                                    });
                                    // If no text part exists, add one
                                    if (!textPartFound) {
                                        newParts.push({ text: hasFinalResponse });
                                    }
                                    existing.content.parts = newParts;
                                }
                            } else {
                                // Accumulate text content from parts (existing logic for partial messages)
                                if (evt.content && evt.content.parts && existing.content && existing.content.parts) {
                                    const newParts = [...existing.content.parts];

                                    evt.content.parts.forEach((newPart, index) => {
                                        if (newPart.text !== undefined) {
                                            // Accumulate text content
                                            if (newParts[index] && newParts[index].text !== undefined) {
                                                newParts[index] = { ...newParts[index], text: newParts[index].text + newPart.text };
                                            } else {
                                                newParts[index] = { ...newPart };
                                            }
                                        } else if (newPart.functionCall || newPart.functionResponse || newPart.thoughtSignature) {
                                            // Keep non-text parts as is
                                            newParts[index] = { ...newPart };
                                        }
                                    });

                                    existing.content.parts = newParts;
                                }
                            }

                            // Update other properties from the latest event
                            existing.timestamp = evt.timestamp;
                            existing.usageMetadata = evt.usageMetadata;
                            existing.actions = evt.actions;

                            // Store accumulated message
                            partialMessages.set(messageKey, existing);

                            // Update chat events with accumulated message
                            setChatEvents(prev => mergeChatEvents(prev, [existing]));
                        } else {
                            // Handle complete messages or messages with finishReason
                            if (evt.finishReason && evt.invocationId && evt.author) {
                                const messageKey = `${evt.invocationId}_${evt.author}`;
                                // Clean up partial message tracking for completed message
                                partialMessages.delete(messageKey);
                            }

                            // Add complete message to chat events
                            setChatEvents(prev => mergeChatEvents(prev, [evt]));
                        }
                    },
                    onKeywordsUpdate: (keywords) => {
                        // Real-time update of keywords as they stream in
                        // Call the external callback if provided
                        onKeywordsUpdate?.(keywords);
                        // Also dispatch custom event for backward compatibility
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('aiChatKeywordsUpdate', {
                                detail: keywords
                            }));
                        }
                    },
                    onProductsUpdate: (products) => {
                        // Real-time update of products as they stream in
                        setShowProducts(prevProducts => {
                            if (!prevProducts || prevProducts.length === 0) {
                                return products;
                            }
                            // Merge with existing products, avoiding duplicates by SKU
                            const existingSkus = new Set(prevProducts.map(p => p?.sku).filter(Boolean));
                            const newProducts = products?.filter(p => p?.sku && !existingSkus.has(p.sku)) || [];
                            return newProducts.length > 0 ? [...prevProducts, ...newProducts] : prevProducts;
                        });
                        // Call the external callback if provided, passing setShowProducts function
                        onProductsUpdate?.(products, setShowProducts);
                        // Also dispatch custom event for backward compatibility
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('aiChatProductsUpdate', {
                                detail: products
                            }));
                        }
                    },
                    onError: ({ status, payload, error }) => {
                        setErrorMessage(
                            formatMessage({
                                id: "searchAIDialog.error",
                                defaultMessage:
                                    "Sorry, our AI Search is currently experiencing issues. Please try again later or use the regular search."
                            })
                        );
                        setTryAgainMessage(true);
                        console.error("SSE error", status, payload, error);
                    },
                    onDone: () => {
                        requestCompleted = true;
                        clearTimeout(timeoutId);
                        setProcessing(false);
                        setSearchKeyProcessing(null);
                        if (fetchHistory) {
                            handleGetHistory();
                            setFetchHistory(false);
                        }
                    }
                });
            } catch (e) {
                requestCompleted = true;
                clearTimeout(timeoutId);
                setErrorMessage(
                    formatMessage({
                        id: "searchAIDialog.error",
                        defaultMessage:
                            "Sorry, our AI Search is currently experiencing issues. Please try again later or use the regular search."
                    })
                );
                setProcessing(false);
                setSearchKeyProcessing(null);
                setTryAgainMessage(true);
                if (fetchHistory) {
                    handleGetHistory();
                    setFetchHistory(false);
                }
            }
        }, [callThirdPartyStream, handleGetHistory, fetchHistory, onKeywordsUpdate, onProductsUpdate, setShowProducts])

    const getImageSrc = image => {
        if (!image || !image.data) return "";
        const src = typeof image.data === "string" ? image.data : String(image.data);
        if (src.startsWith("data:")) return src;
        const mime =
            image.mime_type && typeof image.mime_type === "string"
                ? image.mime_type
                : "image/*";
        return `data:${mime};base64,${src}`;
    };

    const handleAgeConfirm = useCallback(async (confirmed = false) => {
        setProcessing(true);
        setAgeConfirm(false);
        if (confirmed) {
            Cookies.set('ageConfirmed', true, {expires: 7});
        }
        const message = confirmed ? 'The user has verified that they are over 18 years old.' : 'The user refused to verify their age';
        const parts = [
            {
                "functionResponse": {
                    "id": ageConfirmId,
                    "willContinue": false,
                    "name": "age_verify",
                    "response": {
                        "status": "done",
                        "message": message
                    }
                }
            }
        ];
        await sendMessage({parts});

    }, [setAgeConfirm, ageConfirmId])

    return {
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
        setSessionTooLarge,
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
        fileResetKey,
        setFileResetKey,
        fileName,
        setFileName,
        imageResetKey,
        setImageResetKey,
        imageName,
        setImageName,
        voiceName,
        setVoiceName,
        handleGetHistory,
        handleOpenChat,
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
    };
};

export default useAIChatbox;
