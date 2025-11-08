import { fetchEventSource } from '@microsoft/fetch-event-source';
import { message } from 'antd';

const AI_SEARCH_URL = import.meta.env.VITE_AI_SEARCH_URL || '';
const AI_SEARCH_KEY = import.meta.env.VITE_AI_SEARCH_KEY || '';

/**
 * Process streaming event to extract keywords and products
 */
const processStreamingEvent = (evt) => {
  if (!evt || !evt.content || !evt.content.parts) return { keywordData: {}, products: [], hasCartModification: false };

  const parts = evt.content.parts;
  const keywordData = {};
  const products = [];
  let hasCartModification = false;

  // List of function names that modify the cart
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
        products.push(...data);
      }
    }

    // Check for cart-modifying function responses
    if (part?.functionResponse && cartModifyingFunctions.includes(part.functionResponse.name)) {
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
          products.push(...parsed.product_data);
        }
      } catch {
        // Not JSON, continue
      }
    }
  }

  return { keywordData, products, hasCartModification };
};

/**
 * Debounce helper for real-time updates
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Stream SSE and push events as they arrive
 */
export const streamAIResponse = async ({
  parts = [],
  streaming = true,
  sessionId,
  userId = 'user',
  storeViewCode = '',
  onEvent,
  onError,
  onDone,
  onKeywordUpdate,
  onProductUpdate,
  onSearchKeyProcessing,
  onSessionTooLarge,
  onTooltipDisplay
}) => {
  if (!AI_SEARCH_URL) {
    console.error('AI_SEARCH_URL is not configured');
    return;
  }

  const url = `${AI_SEARCH_URL}run_sse`;
  const controller = new AbortController();

  // Track accumulated keywords and products for progressive updates
  const accumulatedKeywords = new Map();
  const accumulatedProducts = new Map();
  let cartModification = false;

  // Debounced update functions
  const debouncedKeywordUpdate = debounce((data) => {
    onKeywordUpdate?.(data);
  }, 100);

  const debouncedProductUpdate = debounce((data) => {
    onProductUpdate?.(data);
  }, 100);

  try {
    const ageVerified = document.cookie.includes('ageConfirmed=true');

    await fetchEventSource(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        ...(AI_SEARCH_KEY ? { Authorization: `Bearer ${AI_SEARCH_KEY}` } : {}),
        ...(storeViewCode ? { store: storeViewCode } : {})
      },
      body: JSON.stringify({
        appName: "mmvn_b2c_agent",
        userId: userId,
        sessionId: sessionId,
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
      retry: 0,
      openWhenHidden: true,

      onopen: (res) => {
        if (!res.ok) {
          onError?.({ status: res.status });
          throw new Error(`SSE open failed: ${res.status}`);
        }
      },

      onmessage: (msg) => {
        if (!msg?.data) return;
        try {
          const obj = JSON.parse(msg.data);

          // Check token count for session size warnings
          if (obj?.actions?.stateDelta?.input_token_count) {
            const tokenCount = obj.actions.stateDelta.input_token_count;
            if (tokenCount > 41000) {
              onTooltipDisplay?.(true);
              if (tokenCount > 100000) {
                onSessionTooLarge?.(true);
              }
            }
          }

          // Process streaming event for keywords and products
          const { keywordData, products, hasCartModification: hasCartMod } = processStreamingEvent(obj);

          if (hasCartMod) {
            cartModification = true;
          }

          // Update search key processing
          if (keywordData && Object.keys(keywordData).length > 0) {
            const keys = Object.values(keywordData)
              .map(v => v?.keyword)
              .filter(Boolean)
              .join(', ');

            if (keys) {
              onSearchKeyProcessing?.({ type: 'searchProduct', keys });
            }
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
              accumulatedProducts.set(sku, product);
              productsUpdated = true;
            }
          }

          // Trigger real-time updates
          if (keywordsUpdated || productsUpdated) {
            // Build keywords data
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

              const uniqueQueries = [...new Set(queries)];

              return {
                queries: uniqueQueries,
                pairs: keywordPairs
              };
            };

            // Build products data
            const buildProductsData = () => {
              const keywordsData = buildKeywordsData();
              const firstPairWithData = keywordsData.pairs.find(p => p.data && Array.isArray(p.data));
              return firstPairWithData ? firstPairWithData.data : Array.from(accumulatedProducts.values());
            };

            const currentKeywordsData = buildKeywordsData();
            if (currentKeywordsData?.queries?.length) {
              debouncedKeywordUpdate(buildKeywordsData());
            }

            if (productsUpdated && accumulatedProducts.size > 0) {
              const currentProductsData = buildProductsData();
              debouncedProductUpdate(currentProductsData);
            }
          }

          // Always call the original onEvent
          onEvent?.(obj);
        } catch (error) {
          console.warn('Failed to parse SSE message:', error);
          // Continue processing
        }
      },

      onclose: () => {
        onDone?.();
      },

      onerror: (err) => {
        console.error('SSE error:', err);
        message.error(err.message || 'Connection error occurred');
        onError?.({ error: err });
        throw err;
      }
    });
  } catch (e) {
    console.error('Stream error:', e);
    onDone?.();
  }
};

/**
 * Create a new session
 */
export const createSession = async ({ sessionId, userId = 'user', storeViewCode = '', cartId = null, token = null, language = 'vi' }) => {
  if (!AI_SEARCH_URL) return false;

  const url = `${AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${sessionId}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(storeViewCode ? { store: storeViewCode } : {})
      },
      body: JSON.stringify({
        state: {
          magento_session_data: {
            base_url: window.location.origin,
            magento_cart_id: cartId,
            signin_token: token || null,
            magento_session_id: null,
            store_id: storeViewCode,
            language: language
          }
        }
      })
    });

    if (res.ok) {
      sessionStorage.setItem('aiBrowserSession', sessionId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Create session error:', error);
    return false;
  }
};

/**
 * Get session data
 */
export const getSession = async ({ sessionId, userId = 'user', storeViewCode = '' }) => {
  if (!AI_SEARCH_URL) return null;

  const url = `${AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${sessionId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(storeViewCode ? { store: storeViewCode } : {})
      }
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const responseJson = await res.json();
      sessionStorage.setItem('aiBrowserSession', sessionId);
      return responseJson;
    }
    return null;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Update session
 */
export const updateSession = async ({ sessionId, userId = 'user', storeViewCode = '', cartId = null, token = null, language = 'vi' }) => {
  if (!AI_SEARCH_URL) return false;

  const url = `${AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${sessionId}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(storeViewCode ? { store: storeViewCode } : {})
      },
      body: JSON.stringify({
        magento_session_data: {
          base_url: window.location.origin,
          magento_cart_id: cartId,
          signin_token: token || null,
          magento_session_id: null,
          store_id: storeViewCode,
          language: language
        }
      })
    });

    return res.ok;
  } catch (error) {
    console.error('Update session error:', error);
    return false;
  }
};

/**
 * Delete session
 */
export const deleteSession = async ({ sessionId, userId = 'user' }) => {
  if (!AI_SEARCH_URL) return false;

  const url = `${AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/sessions/${sessionId}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    return res.ok;
  } catch (error) {
    console.error('Delete session error:', error);
    return false;
  }
};

/**
 * Get session history
 */
export const getSessionHistory = async ({ userId = 'user', sessionIds = [] }) => {
  if (!AI_SEARCH_URL) return [];

  const url = `${AI_SEARCH_URL}apps/mmvn_b2c_agent/session_title`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_SEARCH_KEY ? { Authorization: `Bearer ${AI_SEARCH_KEY}` } : {})
      },
      body: JSON.stringify({
        user_id: userId,
        ...(userId === 'user' ? { session_ids: sessionIds || [] } : {})
      })
    });

    if (res?.ok) {
      const responseJson = await res.json();
      return Array.isArray(responseJson) ? responseJson : [];
    }
    return [];
  } catch (error) {
    console.error('Get session history error:', error);
    return [];
  }
};

/**
 * Search session history
 */
export const searchSessionHistory = async ({ userId = 'user', query, sessionIds = [], limit = 20, page = 1 }) => {
  if (!AI_SEARCH_URL) return [];

  const url = `${AI_SEARCH_URL}apps/mmvn_b2c_agent/users/${userId}/session_search`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_SEARCH_KEY ? { Authorization: `Bearer ${AI_SEARCH_KEY}` } : {})
      },
      body: JSON.stringify({
        user_id: userId,
        query,
        limit,
        page,
        ...(userId === 'user' ? { session_ids: sessionIds || [] } : {})
      })
    });

    if (res?.ok) {
      const responseJson = await res.json();
      return Array.isArray(responseJson) ? responseJson : [];
    }
    return [];
  } catch (error) {
    console.error('Search session history error:', error);
    return [];
  }
};

