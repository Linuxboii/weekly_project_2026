import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { getConversations, POLLING_INTERVALS } from './services/api';
import './index.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeConversation = conversations.find(c => c.conversation_id === activeId);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, POLLING_INTERVALS.CONVERSATIONS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="branding-watermark">
        Avlok ai
      </div>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(conv) => setActiveId(conv.conversation_id)}
        loading={loading}
      />
      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          onUpdateStatus={fetchConversations}
        />
      ) : (
        <div className="chat-window empty">
          <div className="empty-chat-content">
            <div className="logo-placeholder">A</div>
            <h1 className="hero-text">Avlok AI Messenger</h1>
            <p className="sub-text">Connecting clients with precision and intelligence.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
