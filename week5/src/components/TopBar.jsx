import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAppState, CANVAS_MODES } from '../hooks/useAppState.jsx';
import { useCanvasContext } from '../hooks/CanvasContext.jsx';
import { useToast } from './Toast.jsx';
import CanvasManager from './CanvasManager.jsx';
import {
    Zap,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Sun,
    Moon,
    Grid3X3,
    Magnet,
    Eye,
    Layers,
    Users,
    Save,
    Loader2,
    ChevronDown
} from 'lucide-react';

const modeOptions = [
    { id: CANVAS_MODES.ARCHITECTURE, label: 'Architecture', icon: Layers },
    { id: CANVAS_MODES.CLIENT_ASSEMBLY, label: 'Assembly', icon: Users },
    { id: CANVAS_MODES.PRESENTATION, label: 'Present', icon: Eye }
];

export default function TopBar() {
    const {
        theme,
        toggleTheme,
        canvasMode,
        setCanvasMode,
        leftSidebarOpen,
        rightSidebarOpen,
        toggleLeftSidebar,
        toggleRightSidebar,
        showGrid,
        toggleGrid,
        snapToGrid,
        toggleSnapToGrid
    } = useAppState();

    // Canvas persistence state
    const canvas = useCanvasContext();
    const { showToast } = useToast();
    const [showCanvasManager, setShowCanvasManager] = useState(false);

    // Editable canvas name
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const nameInputRef = useRef(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    // Start editing name
    const handleStartEditing = useCallback(() => {
        if (canvas) {
            setEditName(canvas.name || 'Untitled Canvas');
            setIsEditingName(true);
        }
    }, [canvas]);

    // Save name change
    const handleSaveName = useCallback(() => {
        if (canvas && editName.trim() && editName.trim() !== canvas.name) {
            canvas.setName(editName.trim());
            canvas.markDirty();
        }
        setIsEditingName(false);
    }, [canvas, editName]);

    // Handle key press in name input
    const handleNameKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
        }
    }, [handleSaveName]);

    // Handle save with toast notification
    const handleSave = useCallback(async () => {
        if (!canvas || !canvas.hasUnsavedChanges) return;

        const success = await canvas.save();
        if (success) {
            showToast(`Saved v${canvas.version + 1}`, 'success');
        } else {
            showToast(canvas.error || 'Failed to save', 'error');
        }
    }, [canvas, showToast]);

    const isPresentationMode = canvasMode === CANVAS_MODES.PRESENTATION;
    const isDark = theme === 'dark';

    const buttonStyle = {
        padding: '8px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDark ? '#9ca3af' : '#6b7280',
        transition: 'all 0.15s ease'
    };

    const activeButtonStyle = {
        ...buttonStyle,
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        color: isDark ? '#fff' : '#111'
    };

    return (
        <div style={{
            height: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            borderBottom: isDark ? '1px solid #222225' : '1px solid #e5e5e5',
            backgroundColor: isDark ? '#111113' : '#fff'
        }}>
            {/* Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Sidebar Toggle */}
                {!isPresentationMode && (
                    <button
                        onClick={toggleLeftSidebar}
                        style={buttonStyle}
                        onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                )}

                {/* Logo - Clickable to open Canvas Manager */}
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setShowCanvasManager(!showCanvasManager)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            background: showCanvasManager ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent'
                        }}
                        onMouseOver={(e) => !showCanvasManager && (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')}
                        onMouseOut={(e) => !showCanvasManager && (e.currentTarget.style.background = 'transparent')}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '8px'
                        }}>
                            <img src="/avlokai_logo.png" alt="Avlok AI" style={{ height: '28px', width: 'auto' }} />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '14px',
                                color: isDark ? '#fff' : '#111',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                {isEditingName ? (
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={handleSaveName}
                                        onKeyDown={handleNameKeyDown}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            background: isDark ? '#222' : '#f5f5f5',
                                            border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: isDark ? '#fff' : '#111',
                                            outline: 'none',
                                            width: '150px'
                                        }}
                                    />
                                ) : (
                                    <span
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditing();
                                        }}
                                        title="Double-click to rename"
                                        style={{ cursor: 'text' }}
                                    >
                                        {canvas?.name || 'AvlokAi'}
                                    </span>
                                )}
                                {canvas?.hasUnsavedChanges && (
                                    <span style={{ color: '#f59e0b', fontSize: '16px' }} title="Unsaved changes">●</span>
                                )}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: isDark ? '#6b7280' : '#9ca3af',
                                marginTop: '-2px'
                            }}>
                                {canvas?.version ? `v${canvas.version}` : 'Dashboard'}
                            </div>
                        </div>
                        <ChevronDown size={14} style={{
                            color: isDark ? '#6b7280' : '#9ca3af',
                            transform: showCanvasManager ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s'
                        }} />
                    </div>

                    {/* Canvas Manager Dropdown */}
                    {showCanvasManager && (
                        <CanvasManager onClose={() => setShowCanvasManager(false)} />
                    )}
                </div>

                {/* Save Button */}
                {canvas && !isPresentationMode && (
                    <button
                        onClick={handleSave}
                        disabled={canvas.saving || !canvas.hasUnsavedChanges}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: canvas.saving || !canvas.hasUnsavedChanges ? 'not-allowed' : 'pointer',
                            backgroundColor: canvas.hasUnsavedChanges
                                ? '#10b981'
                                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                            color: canvas.hasUnsavedChanges ? '#fff' : (isDark ? '#6b7280' : '#9ca3af'),
                            opacity: canvas.saving ? 0.7 : 1,
                            transition: 'all 0.15s ease'
                        }}
                        title="Save (Ctrl+S)"
                    >
                        {canvas.saving ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        {canvas.saving ? 'Saving...' : 'Save'}
                    </button>
                )}

                {/* Error Display */}
                {canvas?.error && (
                    <div
                        onClick={canvas.clearError}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                        title="Click to dismiss"
                    >
                        {canvas.error}
                    </div>
                )}
            </div>

            {/* Center Section - Mode Switcher */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1a1a1c' : '#f3f4f6'
            }}>
                {modeOptions.map((mode) => {
                    const isActive = canvasMode === mode.id;
                    const Icon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => setCanvasMode(mode.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: isActive
                                    ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff')
                                    : 'transparent',
                                color: isActive
                                    ? (isDark ? '#fff' : '#111')
                                    : (isDark ? '#9ca3af' : '#6b7280'),
                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <Icon size={14} />
                            {mode.label}
                        </button>
                    );
                })}
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Grid Controls */}
                {!isPresentationMode && (
                    <>
                        <button
                            onClick={toggleGrid}
                            style={showGrid ? activeButtonStyle : buttonStyle}
                            title="Toggle Grid"
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            onClick={toggleSnapToGrid}
                            style={snapToGrid ? activeButtonStyle : buttonStyle}
                            title="Snap to Grid"
                        >
                            <Magnet size={16} />
                        </button>

                        <div style={{
                            width: '1px',
                            height: '20px',
                            margin: '0 4px',
                            backgroundColor: isDark ? '#333' : '#e5e5e5'
                        }} />
                    </>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={buttonStyle}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Right Sidebar Toggle */}
                {!isPresentationMode && (
                    <button
                        onClick={toggleRightSidebar}
                        style={buttonStyle}
                    >
                        {rightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </button>
                )}

                {/* Divider before logout */}
                <div style={{
                    width: '1px',
                    height: '20px',
                    margin: '0 8px',
                    backgroundColor: isDark ? '#333' : '#e5e5e5'
                }} />

                {/* Logout Button */}
                <button
                    onClick={() => window.logout && window.logout()}
                    style={{
                        ...buttonStyle,
                        color: isDark ? '#ef4444' : '#dc2626'
                    }}
                    title="Logout"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
