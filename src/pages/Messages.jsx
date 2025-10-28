import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenDentalService from '../services/OpenDentalService';
import PatientLink from '../components/PatientLink';
import './Messages.css';

function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [messageType, setMessageType] = useState('sms');

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filterType]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await OpenDentalService.getConversations(filterType);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await OpenDentalService.getMessages(conversationId);
      setMessages(data);
      // Mark as read
      await OpenDentalService.markConversationRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await OpenDentalService.sendMessage({
        conversationId: selectedConversation.conversationId,
        toNumber: selectedConversation.phoneNumber,
        message: newMessage,
        type: selectedConversation.type // 'sms' or 'whatsapp'
      });

      setNewMessage('');
      await loadMessages(selectedConversation.conversationId);
      await loadConversations(); // Refresh conversation list
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async () => {
    if (!newRecipient || !newMessage.trim()) {
      alert('Please enter recipient and message');
      return;
    }

    try {
      setSending(true);
      const result = await OpenDentalService.startNewConversation({
        toNumber: newRecipient,
        patientName: newRecipientName,
        message: newMessage,
        type: messageType
      });

      setShowNewMessageModal(false);
      setNewRecipient('');
      setNewRecipientName('');
      setNewMessage('');
      await loadConversations();
      setSelectedConversation(result.conversation);
    } catch (error) {
      alert('Failed to start conversation');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations;

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>💬 Messages</h3>
            <button className="btn btn-primary btn-small" onClick={() => setShowNewMessageModal(true)}>
              ✉️ New
            </button>
          </div>

          <div className="filter-tabs-vertical">
            <button className={`filter-tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
              All
            </button>
            <button className={`filter-tab ${filterType === 'sms' ? 'active' : ''}`} onClick={() => setFilterType('sms')}>
              📱 SMS
            </button>
            <button className={`filter-tab ${filterType === 'whatsapp' ? 'active' : ''}`} onClick={() => setFilterType('whatsapp')}>
              💚 WhatsApp
            </button>
            <button className={`filter-tab ${filterType === 'unread' ? 'active' : ''}`} onClick={() => setFilterType('unread')}>
              🔔 Unread
            </button>
          </div>

          <div className="conversations-list">
            {loading ? (
              <div className="loading-state-small">
                <div className="spinner-small"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state-small">
                <p>No conversations</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  className={`conversation-item ${selectedConversation?.conversationId === conv.conversationId ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.type === 'whatsapp' ? '💚' : '📱'}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">
                        {conv.patientName ? (
                          <PatientLink patNum={conv.patNum} stopPropagation>
                            {conv.patientName}
                          </PatientLink>
                        ) : (
                          conv.phoneNumber
                        )}
                      </span>
                      <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="conversation-preview">
                      {conv.lastMessage}
                    </div>
                  </div>
                  {conv.unread && <div className="unread-badge">{conv.unreadCount}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="messages-panel">
          {!selectedConversation ? (
            <div className="no-conversation-selected">
              <div className="empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list or start a new one</p>
              <button className="btn btn-primary" onClick={() => setShowNewMessageModal(true)}>
                ✉️ Start New Conversation
              </button>
            </div>
          ) : (
            <>
              <div className="messages-header">
                <div className="header-info">
                  <div className="header-avatar">
                    {selectedConversation.type === 'whatsapp' ? '💚' : '📱'}
                  </div>
                  <div>
                    <h3>
                      {selectedConversation.patientName ? (
                        <PatientLink patNum={selectedConversation.patNum} stopPropagation>
                          {selectedConversation.patientName}
                        </PatientLink>
                      ) : (
                        selectedConversation.phoneNumber
                      )}
                    </h3>
                    <p className="header-phone">{selectedConversation.phoneNumber}</p>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => navigate('/patients?selectMode=checkout')}
                >
                  👤 View Patient
                </button>
              </div>

              <div className="messages-content">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.direction === 'outbound' ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-meta">
                        <span className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {msg.direction === 'outbound' && msg.status && (
                          <span className="message-status">
                            {msg.status === 'delivered' ? '✓✓' : msg.status === 'sent' ? '✓' : '⏱'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-input-container">
                <textarea
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                <button
                  className="btn btn-primary send-button"
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? '...' : '📤 Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✉️ New Message</h3>

            <div className="form-group">
              <label>Message Type</label>
              <div className="type-selector">
                <button
                  className={`type-button ${messageType === 'sms' ? 'active' : ''}`}
                  onClick={() => setMessageType('sms')}
                >
                  📱 SMS
                </button>
                <button
                  className={`type-button ${messageType === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setMessageType('whatsapp')}
                >
                  💚 WhatsApp
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 123-4567"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Patient Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Patient name"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewMessageModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNewConversation}
                disabled={sending}
              >
                {sending ? 'Sending...' : '📤 Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
