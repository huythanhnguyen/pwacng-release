import React, { memo } from 'react';
import { getImageSrc, getAudioSrc } from '../../utils/messageParser';
import './Message.scss';

const UserMessage = memo(({ text, images = [], voices = [], files = [], renderContent }) => {
  if (!text && !images?.length && !voices?.length && !files?.length) return null;

  return (
    <div className="user-message">
      <div className="message-content">
        {images?.length > 0 && (
          <div className="images">
            {images.map((img, idx) => (
              <img key={idx} className="image" src={getImageSrc(img)} alt="" />
            ))}
          </div>
        )}
        {files?.length > 0 && (
          <div className="files">
            {files.map((item, idx) => (
              <p key={idx} className="file">
                {item.displayName || item.mimeType || ''}
              </p>
            ))}
          </div>
        )}
        {voices?.length > 0 && (
          <div className="voices">
            {voices.map((v, idx) => {
              const src = getAudioSrc(v);
              if (!src) return null;
              return (
                <audio key={idx} className="voice" controls src={src}>
                  Your browser does not support the audio element.
                </audio>
              );
            })}
          </div>
        )}
        {text && <div className="message-text">{renderContent(text, true)}</div>}
      </div>
    </div>
  );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;

