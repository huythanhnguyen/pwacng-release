import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Button, Spin } from 'antd';
import { RobotOutlined, CloseOutlined, FullscreenOutlined, FullscreenExitOutlined, HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { useAIChat } from '../../hooks/useAIChat';
import ChatContent from './ChatContent';
import ChatForm from './ChatForm';
import ChatHistory from './ChatHistory';
import ProductSidebar from '../ProductSidebar/ProductSidebar';
import { processImageFile, getImageFromDataTransfer } from '../../utils/imageUpload';
import { processFile, getFileFromDataTransfer } from '../../utils/fileUpload';
import './Chatbox.scss';

const { Header, Content, Sider } = Layout;

const Chatbox = () => {
  const { formatMessage } = useIntl();
  const containerRef = useRef(null);
  const [chatbotOpened, setChatbotOpened] = useState(true);
  const [chatbotActive, setChatbotActive] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [productKeywords, setProductKeywords] = useState(false);
  const [showProducts, setShowProducts] = useState(null);
  const setShowProductsRef = useRef(null);

  const handleRealTimeKeywordsUpdate = useCallback((keywords) => {
    if (keywords?.queries?.length && setShowProductsRef.current) {
      setProductKeywords(keywords);
      setShowProductsRef.current((prevProducts) => {
        if (prevProducts === null) {
          return [];
        }
        return prevProducts;
      });
    }
  }, []);

  const handleRealTimeProductsUpdate = useCallback((products) => {
    if (setShowProductsRef.current) {
      setShowProductsRef.current((prevProducts) => {
        if (!prevProducts || prevProducts.length === 0) {
          return products;
        } else {
          const existingSkus = new Set(prevProducts.map((p) => p.sku));
          const newProducts = products?.filter((p) => !existingSkus.has(p.sku)) || [];
          return newProducts.length > 0 ? [...prevProducts, ...newProducts] : prevProducts;
        }
      });
    }
  }, []);

  useEffect(() => {
    setShowProductsRef.current = setShowProducts;
  }, [setShowProducts]);

  const aiChatProps = useAIChat({
    userId: 'user',
    storeViewCode: '',
    language: 'vi',
    onKeywordsUpdate: handleRealTimeKeywordsUpdate,
    onProductsUpdate: handleRealTimeProductsUpdate
  });

  const {
    loading,
    processing,
    searchKeyProcessing,
    timeoutMessage,
    tryAgainMessage,
    sessionTooLarge,
    chatEvents,
    chatbotHistory,
    historyKeyword,
    setHistoryKeyword,
    handleOpenChat,
    handleGetHistory,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
    handleDeleteAllSessions,
    handleSelectSuggestion,
    handleImage,
    handleFile,
    handleVoice,
    removeAll,
    handleConfirm,
    getImageSrc,
    searchKey,
    setSearchKey,
    searchKeyInput,
    setSearchKeyInput,
    payload,
    setPayload,
    imageResetKey,
    setImageResetKey,
    imageName,
    fileResetKey,
    setFileResetKey,
    fileName,
    voiceName,
    sessionId
  } = aiChatProps;

  // Initialize chat on mount
  useEffect(() => {
    setChatbotActive(true);
    handleOpenChat();
  }, [handleOpenChat]);

  // Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (processing) return;

      const imageFile = getImageFromDataTransfer(e.dataTransfer);
      if (imageFile && handleImage) {
        await processImageFile(imageFile, handleImage);
        return;
      }

      const file = getFileFromDataTransfer(e.dataTransfer);
      if (file && handleFile) {
        await processFile(file, handleFile);
      }
    },
    [processing, handleImage, handleFile]
  );

  if (!chatbotOpened) {
    return (
      <div className="chatbox-trigger">
        <Button
          type="primary"
          icon={<RobotOutlined />}
          onClick={() => {
            setChatbotOpened(true);
            if (!chatbotActive) {
              handleOpenChat();
            }
          }}
          disabled={loading}
        >
          {formatMessage({ id: 'global.assistant', defaultMessage: 'Assistant' })}
        </Button>
      </div>
    );
  }

  return (
    <div className={`chatbox-container ${fullscreen ? 'fullscreen' : ''} ${historyOpened ? 'history-opened' : ''}`}>
      <Layout className="chatbox-layout">
        <Header className="chatbox-header">
          <div className="header-left">
            <RobotOutlined className="header-icon" />
            <span className="header-title">
              {formatMessage({ id: 'aiChatbox.brandName', defaultMessage: 'MM AI' })}
            </span>
          </div>
          <div className="header-actions">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleNewSession}
              title={formatMessage({ id: 'aiChatbox.newSession', defaultMessage: 'Start new session' })}
            />
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => {
                setHistoryOpened((prev) => !prev);
                handleGetHistory();
              }}
              title={formatMessage({ id: 'aiChatbox.history', defaultMessage: 'Chat history' })}
            />
            <Button
              type="text"
              icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setFullscreen((prev) => !prev)}
              title={formatMessage({
                id: fullscreen ? 'aiChatbox.exitFullscreen' : 'aiChatbox.enterFullscreen',
                defaultMessage: fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
              })}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setChatbotOpened(false)}
              title={formatMessage({ id: 'global.close', defaultMessage: 'Close' })}
            />
          </div>
        </Header>

        <Layout className="chatbox-body">
          <ChatHistory
            opened={historyOpened}
            onClose={() => setHistoryOpened(false)}
            history={chatbotHistory}
            historyKeyword={historyKeyword}
            onSearchChange={setHistoryKeyword}
            onGetHistory={handleGetHistory}
            onSwitchSession={handleSwitchSession}
            onDeleteSession={handleDeleteSession}
            onDeleteAllSessions={handleDeleteAllSessions}
            currentSessionId={sessionId}
          />

          <Content
            className={`chatbox-content ${isDragOver ? 'drag-over' : ''}`}
            ref={containerRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragOver && (
              <div className="drop-overlay">
                <div className="drop-message">
                  {formatMessage({
                    id: 'aiChatbox.dropFile',
                    defaultMessage: 'Drop image or file here to upload'
                  })}
                </div>
              </div>
            )}

            {chatbotActive && (
              <>
                <ChatContent
                  chatEvents={chatEvents}
                  processing={processing}
                  searchKeyProcessing={searchKeyProcessing}
                  timeoutMessage={timeoutMessage}
                  tryAgainMessage={tryAgainMessage}
                  handleSelectSuggestion={handleSelectSuggestion}
                  handleNewSession={handleNewSession}
                  setShowProducts={setShowProducts}
                  setFullscreen={setFullscreen}
                  setProductKeywords={setProductKeywords}
                />
                <ChatForm
                  processing={processing}
                  sessionTooLarge={sessionTooLarge}
                  searchKey={searchKey}
                  setSearchKey={setSearchKey}
                  searchKeyInput={searchKeyInput}
                  setSearchKeyInput={setSearchKeyInput}
                  payload={payload}
                  setPayload={setPayload}
                  imageResetKey={imageResetKey}
                  setImageResetKey={setImageResetKey}
                  imageName={imageName}
                  fileResetKey={fileResetKey}
                  setFileResetKey={setFileResetKey}
                  fileName={fileName}
                  voiceName={voiceName}
                  handleFile={handleFile}
                  handleImage={handleImage}
                  handleVoice={handleVoice}
                  handleConfirm={handleConfirm}
                  handleNewSession={handleNewSession}
                  getImageSrc={getImageSrc}
                />
              </>
            )}

            {loading && (
              <div className="loading-wrapper">
                <Spin size="large" />
              </div>
            )}
          </Content>

          {!fullscreen && (
            <Sider width={300} className="chatbox-sidebar" theme="light">
              {showProducts !== null ? (
                <ProductSidebar
                  productKeywords={productKeywords}
                  showProducts={showProducts}
                  setShowProducts={setShowProducts}
                  onClose={() => setShowProducts(null)}
                />
              ) : (
                <div className="sidebar-empty">
                  {formatMessage({
                    id: 'chatbot.sidebarEmpty',
                    defaultMessage: 'Do you need any help?'
                  })}
                </div>
              )}
            </Sider>
          )}
        </Layout>
      </Layout>
    </div>
  );
};

export default Chatbox;

