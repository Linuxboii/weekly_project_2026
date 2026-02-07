import React from 'react';
import { useAppState, CANVAS_MODES } from '../hooks/useAppState.jsx';
import { useCanvasContext } from '../hooks/CanvasContext.jsx';
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
    Loader2
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

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f97316, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                    }}>
                        <Zap size={14} color="#fff" />
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
                            {canvas?.name || 'AvlokAi'}
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
                </div>

                {/* Save Button */}
                {canvas && !isPresentationMode && (
                    <button
                        onClick={canvas.save}
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
