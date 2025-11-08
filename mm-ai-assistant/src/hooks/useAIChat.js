import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { message } from 'antd';
import { streamAIResponse, createSession, getSession, updateSession, getSessionHistory, searchSessionHistory } from '../services/aiService';
import { getAllSessionIds, createNewSessionId, removeSessionId, clearAllSessionIds } from '../services/sessionService';

/**
 * Main hook for AI Chat functionality
 */
export const useAIChat = (options = {}) => {
  const {
    userId = 'user',
    storeViewCode = '',
    language = 'vi',
    cartId = null,
    token = null,
    onKeywordsUpdate,
    onProductsUpdate
  } = options;

  const { formatMessage } = useIntl();
  const browserSession = sessionStorage.getItem('aiBrowserSession');

  // State
  const [sessionId, setSessionId] = useState(browserSession || null);
  const [chatbotHistory, setChatbotHistory] = useState([]);
  const [historyKeyword, setHistoryKeyword] = useState(null);
  const [fetchHistory, setFetchHistory] = useState(true);
  const [chatEvents, setChatEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchKeyProcessing, setSearchKeyProcessing] = useState(null);
  const [searchKey, setSearchKey] = useState('');
  const [searchKeyInput, setSearchKeyInput] = useState('');
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

  // Refs
  const sessionIdRef = useRef(sessionId);
  const debounceTimeoutRef = useRef({ keywords: null, products: null });

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (tooltipDisplay) {
      const id = setTimeout(() => setTooltipDisplay(false), 6000);
      return () => clearTimeout(id);
    }
  }, [tooltipDisplay]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current.keywords) {
        clearTimeout(debounceTimeoutRef.current.keywords);
      }
      if (debounceTimeoutRef.current.products) {
        clearTimeout(debounceTimeoutRef.current.products);
      }
    };
  }, []);

  useEffect(() => {
    if (!errorMessage) return;
    const id = setTimeout(() => setErrorMessage(null), 10000);
    return () => clearTimeout(id);
  }, [errorMessage]);

  /**
   * Merge chat events, deduplicating by ID
   */
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

  /**
   * Get session history
   */
  const handleGetHistory = useCallback(
    async (query = historyKeyword || null) => {
      try {
        const sessionIds = getAllSessionIds();
        const result = query
          ? await searchSessionHistory({ userId, query, sessionIds })
          : await getSessionHistory({ userId, sessionIds });
        setChatbotHistory(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Get history error:', error);
        setChatbotHistory([]);
      }
    },
    [userId, historyKeyword]
  );

  /**
   * Create a new session
   */
  const handleCreateSession = useCallback(
    async (newSessionId) => {
      try {
        const result = await createSession({
          sessionId: newSessionId,
          userId,
          storeViewCode,
          cartId,
          token,
          language
        });
        if (result) {
          setSessionId(newSessionId);
          sessionStorage.setItem('aiBrowserSession', newSessionId);
          setChatEvents([]);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Create session error:', error);
        return false;
      }
    },
    [userId, storeViewCode, cartId, token, language]
  );

  /**
   * Get existing session
   */
  const handleGetSession = useCallback(
    async (sessionIdToGet) => {
      try {
        const result = await getSession({
          sessionId: sessionIdToGet || sessionIdRef.current,
          userId,
          storeViewCode
        });
        if (result) {
          const events = Array.isArray(result?.events) ? result.events : [];
          setChatEvents(events);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Get session error:', error);
        setChatEvents([]);
        return false;
      }
    },
    [userId, storeViewCode]
  );

  /**
   * Open chat - initialize or load session
   */
  const handleOpenChat = useCallback(
    async () => {
      try {
        setLoading(true);
        if (sessionId) {
          const session = await handleGetSession();
          if (!session) {
            const result = await handleCreateSession(sessionId);
            if (!result) {
              message.error(formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
            }
          }
        } else {
          const newSessionId = createNewSessionId();
          const result = await handleCreateSession(newSessionId);
          if (!result) {
            message.error(formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        message.error(error.message || formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
      }
    },
    [sessionId, handleGetSession, handleCreateSession, formatMessage]
  );

  /**
   * Start a new session
   */
  const handleNewSession = useCallback(
    async () => {
      try {
        setProcessing(false);
        setTimeoutMessage(false);
        setTryAgainMessage(false);
        setErrorMessage(null);
        setSessionTooLarge(false);

        setLoading(true);
        await handleGetHistory();
        const newSessionId = createNewSessionId();
        const result = await handleCreateSession(newSessionId);
        if (result) {
          setFetchHistory(true);
        } else {
          message.error(formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        message.error(error.message || formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
      }
    },
    [handleGetHistory, handleCreateSession, formatMessage]
  );

  /**
   * Switch to a different session
   */
  const handleSwitchSession = useCallback(
    async (sessionTarget, tooLarge = false) => {
      try {
        setProcessing(false);
        setTimeoutMessage(false);
        setTryAgainMessage(false);
        setErrorMessage(null);

        setLoading(true);
        await handleGetHistory();
        const result = await handleGetSession(sessionTarget);
        if (result) {
          setSessionId(sessionTarget);
          setSessionTooLarge(tooLarge);
        } else {
          message.error(formatMessage({ id: 'aiChatbox.historyNotFound', defaultMessage: 'Chat history not found' }));
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        message.error(error.message || formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
      }
    },
    [handleGetHistory, handleGetSession, formatMessage]
  );

  /**
   * Delete a session
   */
  const handleDeleteSession = useCallback(
    async (id) => {
      try {
        // Note: deleteSession API call would be here if we had it in aiService
        // For now, just remove from local storage
        removeSessionId(id);
        await handleGetHistory();

        if (id === sessionId) {
          await handleNewSession();
        }
      } catch (error) {
        console.error('Delete session error:', error);
      }
    },
    [sessionId, handleGetHistory, handleNewSession]
  );

  /**
   * Delete all sessions
   */
  const handleDeleteAllSessions = useCallback(
    async () => {
      try {
        clearAllSessionIds();
        setChatbotHistory([]);
        await handleNewSession();
      } catch (error) {
        console.error('Delete all sessions error:', error);
      }
    },
    [handleNewSession]
  );

  /**
   * Build user event from input
   */
  const buildUserEvent = ({ text, file, image, voice }) => ({
    id: `local-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
    author: 'user',
    invocationId: '',
    timestamp: Math.floor(Date.now() / 1000),
    content: {
      role: 'user',
      parts: [
        ...(text ? [{ text: String(text) }] : []),
        ...(file ? [{ inlineData: { displayName: fileName || '', mimeType: file.mime_type || '*/*', data: file.data } }] : []),
        ...(image ? [{ inlineData: { displayName: imageName || '', mimeType: image.mime_type || 'image/*', data: image.data } }] : []),
        ...(voice ? [{ inlineData: { mimeType: voice.mime_type || 'audio/*', data: voice.data } }] : [])
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

  /**
   * Send message to AI
   */
  const sendMessage = useCallback(
    async ({ parts }) => {
      let requestCompleted = false;

      // Set 45-second timeout
      const timeoutId = setTimeout(() => {
        if (!requestCompleted) {
          setTimeoutMessage(true);
          setProcessing(false);
        }
      }, 45000);

      try {
        const partialMessages = new Map();

        await streamAIResponse({
          parts,
          streaming: true,
          sessionId: sessionIdRef.current,
          userId,
          storeViewCode,
          onEvent: (evt) => {
            const hasFinalResponse = evt?.actions?.stateDelta?.final_response;

            if ((evt.partial || hasFinalResponse) && evt.invocationId && evt.author) {
              const messageKey = `${evt.invocationId}_${evt.author}`;
              const existing = partialMessages.get(messageKey) || { ...evt };

              if (hasFinalResponse) {
                if (existing.content && existing.content.parts) {
                  const newParts = [...existing.content.parts];
                  let textPartFound = false;
                  newParts.forEach((part, index) => {
                    if (part.text !== undefined && !textPartFound) {
                      newParts[index] = { ...part, text: hasFinalResponse };
                      textPartFound = true;
                    }
                  });
                  if (!textPartFound) {
                    newParts.push({ text: hasFinalResponse });
                  }
                  existing.content.parts = newParts;
                }
              } else {
                if (evt.content && evt.content.parts && existing.content && existing.content.parts) {
                  const newParts = [...existing.content.parts];
                  evt.content.parts.forEach((newPart, index) => {
                    if (newPart.text !== undefined) {
                      if (newParts[index] && newParts[index].text !== undefined) {
                        newParts[index] = { ...newParts[index], text: newParts[index].text + newPart.text };
                      } else {
                        newParts[index] = { ...newPart };
                      }
                    } else if (newPart.functionCall || newPart.functionResponse || newPart.thoughtSignature) {
                      newParts[index] = { ...newPart };
                    }
                  });
                  existing.content.parts = newParts;
                }
              }

              existing.timestamp = evt.timestamp;
              existing.usageMetadata = evt.usageMetadata;
              existing.actions = evt.actions;

              partialMessages.set(messageKey, existing);
              setChatEvents((prev) => mergeChatEvents(prev, [existing]));
            } else {
              if (evt.finishReason && evt.invocationId && evt.author) {
                const messageKey = `${evt.invocationId}_${evt.author}`;
                partialMessages.delete(messageKey);
              }
              setChatEvents((prev) => mergeChatEvents(prev, [evt]));
            }
          },
          onKeywordsUpdate: (keywords) => {
            onKeywordsUpdate?.(keywords);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('aiChatKeywordsUpdate', { detail: keywords }));
            }
          },
          onProductUpdate: (products) => {
            onProductsUpdate?.(products);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('aiChatProductsUpdate', { detail: products }));
            }
          },
          onSearchKeyProcessing: (data) => {
            setSearchKeyProcessing(data);
          },
          onSessionTooLarge: (value) => {
            setSessionTooLarge(value);
          },
          onTooltipDisplay: (value) => {
            setTooltipDisplay(value);
          },
          onError: ({ status, error }) => {
            setErrorMessage(formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
            setTryAgainMessage(true);
            console.error('SSE error', status, error);
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
        setErrorMessage(formatMessage({ id: 'global.errorText', defaultMessage: 'Something went wrong. Please refresh and try again.' }));
        setProcessing(false);
        setSearchKeyProcessing(null);
        setTryAgainMessage(true);
        if (fetchHistory) {
          handleGetHistory();
          setFetchHistory(false);
        }
      }
    },
    [userId, storeViewCode, fetchHistory, handleGetHistory, onKeywordsUpdate, onProductsUpdate, formatMessage]
  );

  /**
   * Handle confirm - send message
   */
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

      // Show user's message immediately
      const userEvent = buildUserEvent({
        text: hasText ? searchText : null,
        file: hasFile ? payloadData.file : null,
        image: hasImage ? payloadData.image : null,
        voice: hasVoice ? payloadData.voice : null
      });
      setChatEvents((prev) => mergeChatEvents(prev, [userEvent]));
      setProcessing(true);

      const parts = [];
      if (hasText) parts.push({ text: String(searchText) });
      if (hasFile) parts.push({ inlineData: { displayName: fileName || '', mimeType: payloadData.file.mime_type || '*/*', data: payloadData.file.data } });
      if (hasImage) parts.push({ inlineData: { displayName: imageName || '', mimeType: payloadData.image.mime_type || 'image/*', data: payloadData.image.data } });
      if (hasVoice) parts.push({ inlineData: { mimeType: payloadData.voice.mime_type || 'audio/*', data: payloadData.voice.data } });

      // Clear inputs
      removeAll();

      await sendMessage({ parts });
    },
    [payload, searchKey, fileName, imageName, sendMessage]
  );

  /**
   * Handle file/image/voice upload
   */
  const handleImage = (data, name) => {
    setPayload((prev) => ({ ...prev, ...data }));
    setImageName(typeof name === 'string' ? name : '');
  };

  const handleFile = (data, name) => {
    setPayload((prev) => ({ ...prev, ...data }));
    setFileName(typeof name === 'string' ? name : '');
  };

  const handleVoice = useCallback(
    (data, name) => {
      if (data?.transcription) {
        const searchText = data.transcription;
        setSearchKey(searchText);
        handleConfirm({ searchText, payload });
      } else {
        const payloadData = { ...payload, ...data };
        setPayload((prev) => ({ ...prev, ...data }));
        setVoiceName(typeof name === 'string' ? name : '');
        handleConfirm({ searchKey, payloadData });
      }
    },
    [payload, searchKey, handleConfirm]
  );

  /**
   * Handle suggestion selection
   */
  const handleSelectSuggestion = useCallback(
    async (searchText) => {
      setSearchKeyInput(searchText);
      setSearchKey(searchText);
      handleConfirm({ searchText, payloadData: payload });
    },
    [payload, handleConfirm]
  );

  /**
   * Remove all inputs
   */
  const removeAll = () => {
    setPayload({});
    setSearchKeyInput('');
    setSearchKey('');
  };

  /**
   * Get image src
   */
  const getImageSrc = (image) => {
    if (!image || !image.data) return '';
    const src = typeof image.data === 'string' ? image.data : String(image.data);
    if (src.startsWith('data:')) return src;
    const mime = image.mime_type && typeof image.mime_type === 'string' ? image.mime_type : 'image/*';
    return `data:${mime};base64,${src}`;
  };

  /**
   * Handle age confirmation
   */
  const handleAgeConfirm = useCallback(
    async (confirmed = false) => {
      setProcessing(true);
      setAgeConfirm(false);
      if (confirmed) {
        document.cookie = 'ageConfirmed=true; max-age=604800'; // 7 days
      }
      const messageText = confirmed ? 'The user has verified that they are over 18 years old.' : 'The user refused to verify their age';
      const parts = [
        {
          functionResponse: {
            id: ageConfirmId,
            willContinue: false,
            name: 'age_verify',
            response: {
              status: 'done',
              message: messageText
            }
          }
        }
      ];
      await sendMessage({ parts });
    },
    [ageConfirmId, sendMessage]
  );

  return {
    // State
    sessionId,
    setSessionId,
    chatbotHistory,
    setChatbotHistory,
    historyKeyword,
    setHistoryKeyword,
    chatEvents,
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
    searchKey,
    setSearchKey,
    searchKeyInput,
    setSearchKeyInput,
    payload,
    setPayload,
    fileResetKey,
    setFileResetKey,
    fileName,
    imageResetKey,
    setImageResetKey,
    imageName,
    voiceName,
    ageConfirm,
    setAgeConfirm,
    ageConfirmId,
    setAgeConfirmId,

    // Handlers
    handleOpenChat,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
    handleDeleteAllSessions,
    handleGetHistory,
    handleConfirm,
    handleImage,
    handleFile,
    handleVoice,
    handleSelectSuggestion,
    removeAll,
    getImageSrc,
    handleAgeConfirm
  };
};

