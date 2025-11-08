import React, { useState, useLayoutEffect, useRef, useCallback, useEffect } from 'react';
import { Form, Input, Button, Upload, message as antdMessage } from 'antd';
import { PaperClipOutlined, AudioOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { processImageFile, getImageFromClipboard } from '../../utils/imageUpload';
import { processFile } from '../../utils/fileUpload';
import { useSpeechRecognition, SpeechRecognition } from 'react-speech-recognition';
import './ChatForm.scss';

const { TextArea } = Input;

const ChatForm = ({
  processing,
  sessionTooLarge,
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
  handleFile,
  handleImage,
  handleVoice,
  handleConfirm,
  handleNewSession,
  getImageSrc
}) => {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();
  const textareaRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const formDisabled = processing || sessionTooLarge;

  // Auto-resize textarea
  const useAutoResize = (value) => {
    const ref = useRef(null);
    const fit = useCallback(() => {
      const el = ref.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }, []);
    useLayoutEffect(() => {
      fit();
    }, [value, fit]);
    return { ref, fit };
  };

  const { ref: taRef, fit } = useAutoResize(searchKeyInput);

  // Handle paste event for textarea
  const handlePaste = useCallback(
    async (e) => {
      if (processing || !handleImage) return;

      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const imageFile = await getImageFromClipboard(clipboardData);
      if (imageFile) {
        e.preventDefault();
        await processImageFile(imageFile, handleImage);
      }
    },
    [processing, handleImage]
  );

  // Update transcript to input
  useEffect(() => {
    if (transcript) {
      setSearchKeyInput(transcript);
      setSearchKey(transcript);
    }
  }, [transcript, setSearchKey, setSearchKeyInput]);

  // Voice recording
  const handleVoiceClick = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      antdMessage.error(formatMessage({ id: 'global.micNotFound', defaultMessage: 'Microphone not accessible. Please grant permission.' }));
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: 'vi-VN'
      });
    }
  }, [listening, browserSupportsSpeechRecognition, formatMessage, resetTranscript]);

  const onFinish = (values) => {
    if (formDisabled) return;
    handleConfirm({ searchText: searchKeyInput || searchKey, payloadData: payload });
  };

  return (
    <div className={`chat-form ${sessionTooLarge ? 'disabled' : ''}`}>
      {sessionTooLarge && (
        <div className="session-too-large-message">
          {formatMessage({ id: 'chatbot.sessionTooLargeText', defaultMessage: 'The conversation is too long. ' })}
          {formatMessage({ id: 'chatbot.sessionTooLargeSelect', defaultMessage: 'Please select ' })}
          <Button type="link" onClick={handleNewSession}>
            {formatMessage({ id: 'chatbot.sessionTooLargeBtn', defaultMessage: 'Start new conversation' })}
          </Button>
          {formatMessage({ id: 'chatbot.sessionTooLargeContinue', defaultMessage: ' to continue' })}
        </div>
      )}

      {payload?.voice?.data && (
        <div className="attachment-preview">
          <span>{voiceName || 'voice'}</span>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setPayload((prev) => {
                const { voice, ...rest } = prev;
                return rest;
              });
            }}
          />
        </div>
      )}

      {payload?.file?.data && (
        <div className="attachment-preview">
          <span>{fileName || 'file.png'}</span>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              setPayload((prev) => {
                const { file, ...rest } = prev;
                return rest;
              });
              setFileResetKey((k) => k + 1);
            }}
          />
        </div>
      )}

      <Form form={form} onFinish={onFinish} className="chat-form-inner">
        <div className="form-actions">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              processImageFile(file, handleImage);
              return false;
            }}
            key={imageResetKey}
          >
            <Button type="text" icon={<PaperClipOutlined />} disabled={formDisabled} />
          </Upload>

          <Upload
            accept="*/*"
            showUploadList={false}
            beforeUpload={(file) => {
              processFile(file, handleFile);
              return false;
            }}
            key={fileResetKey}
          >
            <Button type="text" icon={<PaperClipOutlined />} disabled={formDisabled} />
          </Upload>

          <Button
            type="text"
            icon={<AudioOutlined />}
            onClick={handleVoiceClick}
            disabled={formDisabled}
            className={listening ? 'recording' : ''}
          />
        </div>

        {payload?.image?.data && (
          <div className="image-preview">
            <img src={getImageSrc(payload.image)} alt={imageName || 'image.png'} />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => {
                setPayload((prev) => {
                  const { image, ...rest } = prev;
                  return rest;
                });
                setImageResetKey((k) => k + 1);
              }}
            />
          </div>
        )}

        <Form.Item className="textarea-item">
          <TextArea
            ref={taRef}
            rows={1}
            placeholder={formatMessage({
              id: 'aiChat.placeholder',
              defaultMessage: 'Enter the information you want to search for'
            })}
            value={searchKeyInput}
            onInput={fit}
            onPaste={handlePaste}
            onChange={(e) => {
              setSearchKeyInput(e.target.value || '');
              setSearchKey((e.target.value)?.trim() || '');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!processing && (searchKey || payload?.image?.data || payload?.file?.data || payload?.voice?.data)) {
                  form.submit();
                }
              }
            }}
            disabled={formDisabled}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            disabled={formDisabled || (!searchKey && !payload?.image?.data && !payload?.file?.data && !payload?.voice?.data)}
            loading={processing}
          >
            {formatMessage({ id: 'global.search', defaultMessage: 'Search' })}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChatForm;

