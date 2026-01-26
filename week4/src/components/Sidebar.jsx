import React, { useState } from 'react';
import { Search, Settings, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

const Sidebar = ({ conversations, activeId, onSelect, loading }) => {
    const [search, setSearch] = useState('');

    const filtered = conversations.filter(c =>
        c.mobile_number.includes(search)
    );

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="header-actions" style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn" title="Settings"><Settings size={18} /></button>
                </div>
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search size={14} color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="conversation-list">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        Syncing...
                    </div>
                ) : (
                    filtered.map(conv => (
                        <div
                            key={conv.conversation_id}
                            className={`conversation-item ${activeId === conv.conversation_id ? 'active' : ''}`}
                            onClick={() => onSelect(conv)}
                        >
                            <div className="avatar">
                                {conv.mobile_number.slice(-1)}
                            </div>
                            <div className="conversation-info">
                                <div className="conversation-top">
                                    <span className="mobile-number">{conv.mobile_number}</span>
                                    <span className="last-time">
                                        {conv.last_human_activity ? format(new Date(conv.last_human_activity), 'HH:mm') : ''}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                        Active session
                                    </span>
                                    {conv.ai_allowed ? (
                                        <span className="ai-badge">AI Active</span>
                                    ) : (
                                        <span className="ai-badge paused">Paused</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
