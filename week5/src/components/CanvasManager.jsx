import React, { useState, useEffect, useRef } from 'react';
import { useCanvasContext } from '../hooks/CanvasContext.jsx';
import { listCanvases, getVersionHistory } from '../api/canvas.js';
import { useAppState } from '../hooks/useAppState.jsx';
import {
    ChevronDown,
    Plus,
    Folder,
    Clock,
    History,
    Loader2,
    AlertCircle,
    X
} from 'lucide-react';

/**
 * Canvas Manager Dropdown
 * - List all canvases
 * - Create new canvas
 * - Load existing canvas
 * - Show version history
 */
export default function CanvasManager({ onClose }) {
    const canvas = useCanvasContext();
    const { theme } = useAppState();
    const isDark = theme === 'dark';

    const [view, setView] = useState('list'); // 'list' | 'versions'
    const [canvases, setCanvases] = useState([]);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCanvasName, setNewCanvasName] = useState('');
    const [creating, setCreating] = useState(false);

    const dropdownRef = useRef(null);

    // Load canvases on mount
    useEffect(() => {
        loadCanvases();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const loadCanvases = async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await listCanvases();
            setCanvases(list);
        } catch (err) {
            console.error('[CanvasManager] Failed to load canvases:', err);
            setError('Failed to load canvases');
        } finally {
            setLoading(false);
        }
    };

    const loadVersions = async () => {
        if (!canvas?.id) return;

        setLoading(true);
        setError(null);
        try {
            const versionList = await getVersionHistory(canvas.id);
            setVersions(versionList);
            setView('versions');
        } catch (err) {
            console.error('[CanvasManager] Failed to load versions:', err);
            setError('Failed to load version history');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCanvas = async () => {
        if (!newCanvasName.trim()) return;

        setCreating(true);
        try {
            const newId = await canvas.create(newCanvasName.trim());
            if (newId) {
                // Navigate to new canvas using query parameter
                window.location.href = `${window.location.pathname}?canvas=${newId}`;
            }
        } catch (err) {
            setError('Failed to create canvas');
        } finally {
            setCreating(false);
        }
    };

    const handleLoadCanvas = (canvasId) => {
        if (canvas?.hasUnsavedChanges) {
            if (!window.confirm('You have unsaved changes. Discard and switch canvas?')) {
                return;
            }
        }
        // Navigate to the canvas using query parameter (more deployment-friendly)
        window.location.href = `${window.location.pathname}?canvas=${canvasId}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const containerStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '4px',
        width: '320px',
        maxHeight: '400px',
        overflowY: 'auto',
        borderRadius: '12px',
        border: isDark ? '1px solid #333' : '1px solid #e5e5e5',
        backgroundColor: isDark ? '#1a1a1c' : '#fff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 1000
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: isDark ? '1px solid #333' : '1px solid #e5e5e5'
    };

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        borderBottom: isDark ? '1px solid #222' : '1px solid #f0f0f0'
    };

    return (
        <div ref={dropdownRef} style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <span style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: isDark ? '#fff' : '#111'
                }}>
                    {view === 'list' ? 'Your Canvases' : 'Version History'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {view === 'versions' && (
                        <button
                            onClick={() => setView('list')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: isDark ? '#9ca3af' : '#6b7280',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: isDark ? '#6b7280' : '#9ca3af',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Create New Canvas */}
            {view === 'list' && (
                <div style={{
                    padding: '12px 16px',
                    borderBottom: isDark ? '1px solid #333' : '1px solid #e5e5e5'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={newCanvasName}
                            onChange={(e) => setNewCanvasName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCanvas()}
                            placeholder="New canvas name..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: isDark ? '1px solid #333' : '1px solid #e5e5e5',
                                backgroundColor: isDark ? '#111' : '#f9f9f9',
                                color: isDark ? '#fff' : '#111',
                                fontSize: '12px',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleCreateCanvas}
                            disabled={creating || !newCanvasName.trim()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#10b981',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: creating || !newCanvasName.trim() ? 'not-allowed' : 'pointer',
                                opacity: creating || !newCanvasName.trim() ? 0.5 : 1
                            }}
                        >
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Create
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                    color: '#ef4444',
                    fontSize: '12px'
                }}>
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    color: isDark ? '#6b7280' : '#9ca3af'
                }}>
                    <Loader2 size={20} className="animate-spin" />
                </div>
            ) : view === 'list' ? (
                /* Canvas List */
                <>
                    {/* Version History Button (if canvas is loaded) */}
                    {canvas?.id && (
                        <div
                            onClick={loadVersions}
                            style={{
                                ...itemStyle,
                                backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)'}
                        >
                            <History size={16} style={{ color: '#8b5cf6' }} />
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#8b5cf6'
                                }}>
                                    Version History
                                </div>
                                <div style={{
                                    fontSize: '10px',
                                    color: isDark ? '#6b7280' : '#9ca3af'
                                }}>
                                    View previous versions of "{canvas.name}"
                                </div>
                            </div>
                        </div>
                    )}

                    {canvases.length === 0 ? (
                        <div style={{
                            padding: '32px',
                            textAlign: 'center',
                            color: isDark ? '#6b7280' : '#9ca3af',
                            fontSize: '12px'
                        }}>
                            No canvases yet. Create one above!
                        </div>
                    ) : (
                        canvases.map((c) => (
                            <div
                                key={c.canvasId}
                                onClick={() => handleLoadCanvas(c.canvasId)}
                                style={{
                                    ...itemStyle,
                                    backgroundColor: c.canvasId === canvas?.id
                                        ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)')
                                        : 'transparent'
                                }}
                                onMouseOver={(e) => {
                                    if (c.canvasId !== canvas?.id) {
                                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = c.canvasId === canvas?.id
                                        ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)')
                                        : 'transparent';
                                }}
                            >
                                <Folder size={16} style={{
                                    color: c.canvasId === canvas?.id ? '#10b981' : (isDark ? '#6b7280' : '#9ca3af')
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: isDark ? '#fff' : '#111',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {c.name}
                                        {c.canvasId === canvas?.id && (
                                            <span style={{
                                                marginLeft: '8px',
                                                fontSize: '10px',
                                                color: '#10b981'
                                            }}>
                                                (current)
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: isDark ? '#6b7280' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Clock size={10} />
                                        {formatDate(c.updatedAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </>
            ) : (
                /* Version History */
                <>
                    {versions.length === 0 ? (
                        <div style={{
                            padding: '32px',
                            textAlign: 'center',
                            color: isDark ? '#6b7280' : '#9ca3af',
                            fontSize: '12px'
                        }}>
                            No versions found
                        </div>
                    ) : (
                        versions.map((v) => (
                            <div
                                key={v.version}
                                style={{
                                    ...itemStyle,
                                    cursor: 'default',
                                    backgroundColor: v.isActive
                                        ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)')
                                        : 'transparent'
                                }}
                            >
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    backgroundColor: v.isActive ? '#10b981' : (isDark ? '#333' : '#e5e5e5'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: v.isActive ? '#fff' : (isDark ? '#9ca3af' : '#6b7280')
                                }}>
                                    v{v.version}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: isDark ? '#fff' : '#111'
                                    }}>
                                        Version {v.version}
                                        {v.isActive && (
                                            <span style={{
                                                marginLeft: '8px',
                                                fontSize: '10px',
                                                color: '#10b981'
                                            }}>
                                                (active)
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: isDark ? '#6b7280' : '#9ca3af'
                                    }}>
                                        {formatDate(v.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}
