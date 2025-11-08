import React, { Fragment, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { useIntl } from 'react-intl';
import MarkdownIt from 'markdown-it';
import BotMessage from '../Message/BotMessage';
import UserMessage from '../Message/UserMessage';
import { parseJsonMessage } from '../../utils/messageParser';
import './ChatContent.scss';

const md = new MarkdownIt();
const toHTML = (html) => <div dangerouslySetInnerHTML={{ __html: md.render(String(html || '')) }} />;

// Processing message component
const BotMessageProcessing = memo(({ text }) => {
  const { formatMessage } = useIntl();
  return (
    <div className="bot-message-processing">
      <div className="bot-avatar"></div>
      <div className="inner">
        <div className="dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <span className="processing">
          {text || formatMessage({ id: 'botMessage.processing', defaultMessage: 'Processing ..' })}
        </span>
      </div>
    </div>
  );
});

// Error message component
const ErrorMessage = memo(({ handleNewSession }) => {
  const { formatMessage } = useIntl();
  return (
    <div className="error-message">
      <div className="bot-message">
        <div className="bot-avatar"></div>
        <div className="message-content">
          <div className="message-text">
            <i>
              {formatMessage({
                id: 'aiChatbox.newSessionMessage',
                defaultMessage: 'Sorry, the system is having problems. Please click here to restart the conversation.'
              })}
            </i>
          </div>
        </div>
      </div>
      <div className="suggestions">
        <button type="button" className="suggestion" onClick={handleNewSession}>
          {formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
        </button>
      </div>
    </div>
  );
});

// First suggestions component
const FirstSuggestions = memo(({ handleSelectSuggestion }) => {
  const { formatMessage } = useIntl();
  return (
    <div className="suggestions first-suggestions">
      <button
        className="suggestion"
        onClick={() => handleSelectSuggestion(formatMessage({ id: 'botSuggestion.hotDeals', defaultMessage: 'Hot Deals' }))}
      >
        {formatMessage({ id: 'botSuggestion.hotDeals', defaultMessage: 'Hot Deals' })}
      </button>
      <button
        className="suggestion"
        onClick={() => handleSelectSuggestion(formatMessage({ id: 'botSuggestion.mmSignature', defaultMessage: 'Only at MM' }))}
      >
        {formatMessage({ id: 'botSuggestion.mmSignature', defaultMessage: 'Only at MM' })}
      </button>
      <button
        className="suggestion"
        onClick={() => handleSelectSuggestion(formatMessage({ id: 'botSuggestion.searchAI', defaultMessage: 'Chicken, Pork, Beef' }))}
      >
        {formatMessage({ id: 'botSuggestion.searchAI', defaultMessage: 'Chicken, Pork, Beef' })}
      </button>
    </div>
  );
});

// Individual chat event component
const ChatEvent = memo(({
  item,
  keywordsGroup,
  renderContent,
  setShowProducts,
  setFullscreen,
  setProductKeywords,
  handleSelectSuggestion
}) => {
  const role = item.content?.role || null;
  const parts = item?.content?.parts || [];

  if (!role || !parts?.length) return null;
  const isCustomer = role === 'user' && !(parts.some((p) => p?.functionCall) || parts.some((p) => p?.functionResponse));

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
          const { message, closingMessage, prods, cart, order, ctaButtons } = parseJsonMessage(part.text);
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
          if (keywordData) keywordsData[id] = { ...keywordsData[id], data: keywordData || [] };
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
    const uniqueSkus = Array.from(new Set(products.map((p) => String(p?.sku || '').trim()).filter(Boolean)));

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

  if (!text && !closing && !cta?.length && !skus?.length && !cartDetail?.length && !orderDetail?.length && !keywords?.length && !images?.length && !voices?.length && !files?.length && !keywordsGroup.queries.length && !keywordsGroup.pairs.length) {
    return null;
  }

  if (role === 'model') {
    return (
      <BotMessage
        key={item.id}
        html={text}
        closingHtml={closing}
        cta={cta}
        skus={skus}
        cart={cartDetail}
        order={orderDetail}
        keywords={keywordsGroup}
        keywordsData={keywords}
        setShowProducts={setShowProducts}
        setFullscreen={setFullscreen}
        setProductKeywords={setProductKeywords}
        handleSelectSuggestion={handleSelectSuggestion}
        renderContent={renderContent}
      />
    );
  }
  if (isCustomer) {
    return (
      <UserMessage
        text={text}
        images={images}
        voices={voices}
        files={files}
        renderContent={renderContent}
      />
    );
  }

  return null;
});

const ChatContent = ({
  chatEvents,
  processing,
  searchKeyProcessing,
  timeoutMessage,
  tryAgainMessage,
  handleSelectSuggestion,
  handleNewSession,
  setShowProducts,
  setFullscreen,
  setProductKeywords
}) => {
  const { formatMessage } = useIntl();
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const isIOS = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);

  useEffect(() => {
    const behavior = isIOS ? 'auto' : 'smooth';
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end', inline: 'nearest' });
    } else if (containerRef.current) {
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [chatEvents, processing, isIOS]);

  const renderContent = useCallback((content, onlyText = false) => {
    if (typeof content === 'string') return toHTML(content);
    return content;
  }, []);

  const botStartMessage = useMemo(
    () => (
      <div>
        <p>{formatMessage({ id: 'botStartMessage.welcome', defaultMessage: "Hello, I am MM's shopping assistant. How can I help you?" })}</p>
      </div>
    ),
    [formatMessage]
  );

  const keywordGroups = useMemo(() => {
    const byInvocation = new Map();
    const idToMeta = new Map();
    const idToData = new Map();

    const ensureGroup = (invId) => {
      if (!byInvocation.has(invId)) {
        byInvocation.set(invId, { queries: [], pairs: [] });
      }
      return byInvocation.get(invId);
    };

    for (const ev of Array.isArray(chatEvents) ? chatEvents : []) {
      const invId = ev?.invocationId;
      const parts = ev?.content?.parts || [];
      if (!invId || !parts?.length) continue;

      const group = ensureGroup(invId);

      for (const part of parts) {
        if (!part || part.thought) continue;

        const fc = part.functionCall;
        if (fc?.id) {
          const q = typeof fc?.args?.keyword === 'string' ? fc.args.keyword : null;
          idToMeta.set(fc.id, { invocationId: invId, query: q });
          if (typeof q === 'string' && q.trim()) {
            group.queries.push(q);
          }
        }

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
            renderContent={renderContent}
            setShowProducts={setShowProducts}
            setFullscreen={setFullscreen}
            setProductKeywords={setProductKeywords}
            handleSelectSuggestion={handleSelectSuggestion}
          />
        </Fragment>
      );
    });
  }, [chatEvents, keywordGroups, renderContent, setShowProducts, setFullscreen, setProductKeywords, handleSelectSuggestion]);

  return (
    <div className="chat-content" ref={containerRef}>
      <BotMessage html={botStartMessage} renderContent={renderContent} />
      {memoizedChatEvents}
      {!processing && timeoutMessage && (
        <BotMessage
          html={formatMessage({
            id: 'aiChatbox.timeoutMessage',
            defaultMessage: 'It seems the connection is unstable. Could you please try again with different content?'
          })}
          renderContent={renderContent}
        />
      )}
      {!processing && tryAgainMessage && <ErrorMessage handleNewSession={handleNewSession} />}

      <FirstSuggestions handleSelectSuggestion={handleSelectSuggestion} />
      {processing && (
        <>
          {searchKeyProcessing?.type === 'searchProduct' && searchKeyProcessing?.keys ? (
            <BotMessageProcessing
              text={`${formatMessage({ id: 'botMessage.processingProduct', defaultMessage: 'Searching for products with keywords' })} "${searchKeyProcessing.keys}"`}
            />
          ) : (
            <BotMessageProcessing text="" />
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatContent;

