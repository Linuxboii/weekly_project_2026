import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Search, Paperclip, Smile, Zap, ZapOff, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getMessages, sendMessage as apiSendMessage, getAiHoldStatus, getAiStatus, POLLING_INTERVALS, sendImageToN8n } from '../services/api';

// -----------------------------------------------------------------------------
// MODULE-LEVEL CACHE (Runtime Only - Clears on Refresh)
// -----------------------------------------------------------------------------
const sentImageFingerprints = new Set();
const imagePreviewBuffer = [];

function generateImageFingerprint(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}
// -----------------------------------------------------------------------------

const ChatWindow = ({ conversation, onUpdateStatus }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [tempImages, setTempImages] = useState([]); // Local state for UI re-renders
    const [aiHold, setAiHold] = useState({ ai_on_hold: false, remaining_seconds: 0 });
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const data = await getMessages(conversation.conversation_id);
            setMessages(data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const fetchAiHoldStatus = async () => {
        try {
            const data = await getAiHoldStatus(conversation.conversation_id);
            setAiHold(data);

            // If the timer has reached zero but we're still "on hold", 
            // trigger getAiStatus to let backend auto-re-enable AI
            if (data.ai_on_hold && data.remaining_seconds <= 0) {
                await getAiStatus(conversation.conversation_id);
                onUpdateStatus(); // Refresh parent to show AI is active
            }
        } catch (err) {
            console.error('Failed to fetch AI hold status:', err);
        }
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await apiSendMessage(conversation.mobile_number, newMessage);
            setNewMessage('');
            fetchMessages();
            onUpdateStatus(); // Refresh status in sidebar
            fetchAiHoldStatus();
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    // -------------------------------------------------------------------------
    // IMAGE HANDLING LOGIC
    // -------------------------------------------------------------------------
    const handleImageSelect = (e) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        let hasUpdates = false;

        for (const file of files) {
            const fingerprint = generateImageFingerprint(file);

            // 1. Prevent Duplicates (Session-based)
            if (sentImageFingerprints.has(fingerprint)) {
                alert(`Image "${file.name}" was already sent in this session.`);
                continue;
            }

            // check if already in queue (to avoid double processing if user selects same file twice quickly)
            if (imagePreviewBuffer.some(img => img.fingerprint === fingerprint)) {
                continue;
            }

            // 2. Create Preview
            const previewUrl = URL.createObjectURL(file);
            const imageEntry = {
                fingerprint,
                previewUrl,
                sentAt: Date.now(),
                status: 'uploading', // uploading -> sending_webhook -> sent
                file
            };

            imagePreviewBuffer.push(imageEntry);
            hasUpdates = true;

            // 3. Trigger Send Flow
            processImageSend(imageEntry);
        }

        if (hasUpdates) {
            setTempImages([...imagePreviewBuffer]);
            // Clear input so same file can be selected again if it wasn't valid, 
            // but here we block duplicates anyway. Good practice to reset though.
            e.target.value = '';
        }
    };

    const processImageSend = async (imageEntry) => {
        try {
            imageEntry.status = 'sending_webhook';
            setTempImages([...imagePreviewBuffer]);

            // A. Send to n8n (Direct Binary)
            await sendImageToN8n(conversation.mobile_number, imageEntry.file);

            // B. Mark as Sent
            sentImageFingerprints.add(imageEntry.fingerprint);
            imageEntry.status = 'sent';
            setTempImages([...imagePreviewBuffer]);

        } catch (err) {
            console.error('Image send failed:', err);
            imageEntry.status = 'error';
            setTempImages([...imagePreviewBuffer]);
        }
    };


    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, POLLING_INTERVALS.MESSAGES);
        return () => clearInterval(interval);
    }, [conversation.conversation_id]);

    useEffect(() => {
        fetchAiHoldStatus();
        const interval = setInterval(fetchAiHoldStatus, POLLING_INTERVALS.AI_HOLD_STATUS);
        return () => clearInterval(interval);
    }, [conversation.conversation_id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, tempImages]); // Scroll on temp images too

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="avatar" style={{ margin: 0, marginRight: 15, width: 38, height: 38 }}>
                        {conversation.mobile_number.slice(-1)}
                    </div>
                    <div>
                        <div className="mobile-number">{conversation.mobile_number}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {conversation.ai_allowed ? 'Intelligence Enabled' : 'Manual Intervention'}
                            </div>
                            {aiHold.ai_on_hold && aiHold.remaining_seconds > 0 && (
                                <div className="ai-hold-timer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontSize: '11px', fontWeight: 600 }}>
                                    <Clock size={12} />
                                    {Math.floor(aiHold.remaining_seconds / 60)}:{String(aiHold.remaining_seconds % 60).padStart(2, '0')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <div
                        className={`status-indicator-pill ${conversation.ai_allowed ? 'active' : 'paused'}`}
                        title={conversation.ai_allowed ? "Intelligence Active" : "Intelligence Paused"}
                    >
                        {conversation.ai_allowed ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
                        <span>{conversation.ai_allowed ? 'AI ON' : 'AI OFF'}</span>
                    </div>
                    <button className="icon-btn"><Search size={18} /></button>
                    <button className="icon-btn"><MoreVertical size={18} /></button>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-row ${msg.direction.toLowerCase()}`}>
                        <div className={`message-bubble ${msg.source === 'ai' ? 'ai-bubble' : ''}`}>
                            <div className="message-content">{msg.content}</div>
                            <div className="message-time">
                                {msg.source === 'ai' && <span className="ai-source-tag">AI ASSISTANT</span>}
                                {format(new Date(msg.created_at), 'HH:mm')}
                            </div>
                        </div>
                    </div>
                ))}

                {/* TEMPORARY IMAGES (Runtime Only) */}
                {tempImages.map((img) => (
                    <div key={img.fingerprint} className="message-row out">
                        <div className="message-bubble image-bubble" style={{ padding: '4px', overflow: 'hidden', minWidth: '200px' }}>
                            <img
                                src={img.previewUrl}
                                alt="Shared content"
                                style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }}
                            />
                            <div className="message-time" style={{ padding: '0 8px 4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{format(new Date(img.sentAt), 'HH:mm')}</span>
                                <span style={{ fontSize: '10px', opacity: 0.8 }}>
                                    {img.status === 'sent' ? '✓ Sent' : img.status === 'error' ? '⚠ Failed' : '...'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-footer" onSubmit={sendMessage}>
                <button type="button" className="icon-btn"><Smile size={20} /></button>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                />
                <button
                    type="button"
                    className="icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Send Image"
                >
                    <Paperclip size={20} />
                </button>

                <input
                    type="text"
                    className="message-input"
                    placeholder="Type your secure message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="icon-btn send" disabled={!newMessage.trim() || sending}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
