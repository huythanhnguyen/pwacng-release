/**
 * Parse JSON message from AI response
 */
export const parseJsonMessage = (data) => {
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

/**
 * Normalize base64 string
 */
export const normalizeBase64 = (src) => {
  if (src.startsWith('data:')) return src;
  if (/^https?:\/\//i.test(src)) return src;
  let b64 = src.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  return b64;
};

/**
 * Get binary source from inline data
 */
export const getBinarySrc = (obj) => {
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

export const getAudioSrc = (audioInline) => getBinarySrc(audioInline);
export const getImageSrc = (imageInline) => getBinarySrc(imageInline);

