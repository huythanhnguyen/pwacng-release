import React, { useState } from 'react';
import { Drawer, Input, List, Button, Modal, Empty, Spin } from 'antd';
import { SearchOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import './ChatHistory.scss';

const { Search } = Input;
const { confirm } = Modal;

const ChatHistory = ({
  opened,
  onClose,
  history,
  historyKeyword,
  onSearchChange,
  onGetHistory,
  onSwitchSession,
  onDeleteSession,
  onDeleteAllSessions,
  currentSessionId
}) => {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value) => {
    setSearchValue(value);
    onSearchChange(value);
    onGetHistory(value);
  };

  const handleDelete = (sessionId) => {
    confirm({
      title: formatMessage({ id: 'aiHistory.delete', defaultMessage: 'Delete conversation' }),
      content: formatMessage({ id: 'aiHistory.deleteConfirm', defaultMessage: 'Are you sure you want to delete this conversation?' }),
      okText: formatMessage({ id: 'global.confirm', defaultMessage: 'Confirm' }),
      cancelText: formatMessage({ id: 'global.cancel', defaultMessage: 'Cancel' }),
      onOk: () => {
        onDeleteSession(sessionId);
      }
    });
  };

  const handleDeleteAll = () => {
    confirm({
      title: formatMessage({ id: 'aiHistory.deleteAll', defaultMessage: 'Delete all conversations' }),
      content: formatMessage({ id: 'aiHistory.deleteAllConfirm', defaultMessage: 'Are you sure you want to delete all conversations?' }),
      okText: formatMessage({ id: 'global.confirm', defaultMessage: 'Confirm' }),
      cancelText: formatMessage({ id: 'global.cancel', defaultMessage: 'Cancel' }),
      onOk: () => {
        onDeleteAllSessions();
      }
    });
  };

  const handleSwitch = (sessionId) => {
    onSwitchSession(sessionId);
    onClose();
  };

  return (
    <Drawer
      title={formatMessage({ id: 'aiHistory.head', defaultMessage: 'Chat History' })}
      placement="left"
      closable={true}
      onClose={onClose}
      open={opened}
      width={320}
      className="chat-history-drawer"
    >
      <div className="chat-history-content">
        <div className="search-section">
          <Search
            placeholder={formatMessage({ id: 'aiHistory.search', defaultMessage: 'Search' })}
            allowClear
            enterButton={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        {history && history.length > 0 ? (
          <>
            <List
              dataSource={history}
              renderItem={(item) => (
                <List.Item
                  className={item.session_id === currentSessionId ? 'active' : ''}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.session_id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Button
                        type="link"
                        onClick={() => handleSwitch(item.session_id)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {item.title || item.session_id || 'Untitled'}
                      </Button>
                    }
                    description={item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  />
                </List.Item>
              )}
            />
            {history.length > 1 && (
              <div className="delete-all-section">
                <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAll} block>
                  {formatMessage({ id: 'aiHistory.deleteAll', defaultMessage: 'Delete all conversations' })}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Empty
            description={formatMessage({ id: 'aiHistory.empty', defaultMessage: 'History is empty' })}
            style={{ marginTop: 40 }}
          />
        )}
      </div>
    </Drawer>
  );
};

export default ChatHistory;

