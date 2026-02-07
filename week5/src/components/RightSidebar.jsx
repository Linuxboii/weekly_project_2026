import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState.jsx';
import { getNodeTemplate, NODE_STATUS } from '../data/nodeData';
import {
    Info,
    ArrowRightLeft,
    Settings,
    GitBranch,
    BarChart2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    ChevronRight,
    ExternalLink
} from 'lucide-react';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'io', label: 'I/O', icon: ArrowRightLeft },
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'deps', label: 'Deps', icon: GitBranch },
    { id: 'usage', label: 'Usage', icon: BarChart2 }
];

export default function RightSidebar() {
    const { theme, selectedNodeId } = useAppState();
    const [activeTab, setActiveTab] = useState('overview');

    const isDark = theme === 'dark';
    const selectedNode = selectedNodeId ? getNodeTemplate(selectedNodeId) : null;

    if (!selectedNode) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: isDark ? '#111113' : '#fff'
            }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            margin: '0 auto 12px',
                            backgroundColor: isDark ? '#1a1a1c' : '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Info size={20} color="#6b7280" />
                        </div>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: isDark ? '#d1d5db' : '#374151',
                            margin: '0 0 4px 0'
                        }}>
                            No Node Selected
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: isDark ? '#6b7280' : '#9ca3af',
                            margin: 0
                        }}>
                            Click a node to inspect it
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const Icon = selectedNode.icon;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: isDark ? '#111113' : '#fff',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: isDark ? '1px solid #222225' : '1px solid #e5e5e5'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: selectedNode.category?.bgColor?.includes('emerald') ? '#10b981' :
                            selectedNode.category?.bgColor?.includes('violet') ? '#8b5cf6' :
                                selectedNode.category?.bgColor?.includes('amber') ? '#f59e0b' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {Icon && <Icon size={18} color="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: isDark ? '#fff' : '#111',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {selectedNode.label}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <span style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                backgroundColor: selectedNode.category?.bgColor?.includes('emerald') ? '#10b981' :
                                    selectedNode.category?.bgColor?.includes('violet') ? '#8b5cf6' :
                                        selectedNode.category?.bgColor?.includes('amber') ? '#f59e0b' : '#6b7280',
                                color: '#fff'
                            }}>
                                {selectedNode.category?.id || 'node'}
                            </span>
                            <span style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: selectedNode.status?.id === 'active' ? 'rgba(16, 185, 129, 0.15)' :
                                    selectedNode.status?.id === 'deprecated' ? 'rgba(239, 68, 68, 0.15)' :
                                        'rgba(107, 114, 128, 0.15)',
                                color: selectedNode.status?.id === 'active' ? '#10b981' :
                                    selectedNode.status?.id === 'deprecated' ? '#ef4444' : '#6b7280'
                            }}>
                                {selectedNode.status?.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: isDark ? '1px solid #222225' : '1px solid #e5e5e5'
            }}>
                {TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: '10px 0',
                                border: 'none',
                                borderBottom: isActive ? '2px solid #ff6d5a' : '2px solid transparent',
                                background: 'transparent',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: isActive
                                    ? (isDark ? '#fff' : '#111')
                                    : (isDark ? '#6b7280' : '#9ca3af'),
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <TabIcon size={12} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {activeTab === 'overview' && <OverviewTab node={selectedNode} isDark={isDark} />}
                {activeTab === 'io' && <IOTab node={selectedNode} isDark={isDark} />}
                {activeTab === 'config' && <ConfigTab node={selectedNode} isDark={isDark} />}
                {activeTab === 'deps' && <DependenciesTab node={selectedNode} isDark={isDark} />}
                {activeTab === 'usage' && <UsageTab node={selectedNode} isDark={isDark} />}
            </div>
        </div>
    );
}

// ============ TAB COMPONENTS ============

function OverviewTab({ node, isDark }) {
    return (
        <div>
            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isDark ? '#6b7280' : '#9ca3af'
                }}>
                    Description
                </label>
                <p style={{
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: isDark ? '#d1d5db' : '#4b5563',
                    marginTop: '8px'
                }}>
                    {node.description}
                </p>
            </div>

            {/* Meta Info */}
            <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#1a1a1c' : '#f9fafb'
            }}>
                {[
                    { icon: Tag, label: 'Version', value: node.version },
                    { icon: User, label: 'Owner', value: node.clientName || 'AvlokAI' },
                    { icon: Calendar, label: 'Reusability', value: node.reusability === 'global' ? 'Global' : 'Client-specific', isTag: true }
                ].map((item, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: i < 2 ? (isDark ? '1px solid #27272a' : '1px solid #e5e5e5') : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <item.icon size={12} color="#6b7280" />
                            <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>{item.label}</span>
                        </div>
                        {item.isTag ? (
                            <span style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: node.reusability === 'global' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: node.reusability === 'global' ? '#10b981' : '#f59e0b'
                            }}>
                                {item.value}
                            </span>
                        ) : (
                            <span style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#e5e5e5' : '#374151' }}>
                                {item.value}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function IOTab({ node, isDark }) {
    const renderPorts = (ports, type) => (
        <div style={{ marginBottom: '16px' }}>
            <label style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: isDark ? '#6b7280' : '#9ca3af'
            }}>
                {type}s
            </label>
            <div style={{ marginTop: '8px' }}>
                {ports?.map((port) => (
                    <div key={port.id} style={{
                        padding: '10px 12px',
                        marginBottom: '6px',
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#1a1a1c' : '#f9fafb',
                        border: isDark ? '1px solid #27272a' : '1px solid #e5e5e5'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#e5e5e5' : '#374151' }}>
                                {port.label}
                            </span>
                            <code style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: type === 'Input' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: type === 'Input' ? '#3b82f6' : '#10b981'
                            }}>
                                {port.type}
                            </code>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            {renderPorts(node.inputs, 'Input')}
            {renderPorts(node.outputs, 'Output')}
        </div>
    );
}

function ConfigTab({ node, isDark }) {
    if (!node.config) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                <p style={{ fontSize: '12px', color: isDark ? '#6b7280' : '#9ca3af' }}>
                    No configuration available
                </p>
            </div>
        );
    }

    return (
        <div>
            {Object.entries(node.config).map(([key, value]) => (
                <div key={key} style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1a1a1c' : '#f9fafb'
                }}>
                    <label style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: isDark ? '#6b7280' : '#9ca3af'
                    }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div style={{ marginTop: '6px' }}>
                        {typeof value === 'boolean' ? (
                            <span style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: value ? '#10b981' : '#ef4444'
                            }}>
                                {value ? 'Enabled' : 'Disabled'}
                            </span>
                        ) : Array.isArray(value) ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {value.map((item, i) => (
                                    <span key={i} style={{
                                        fontSize: '10px',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        color: isDark ? '#d1d5db' : '#4b5563'
                                    }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: isDark ? '#e5e5e5' : '#374151' }}>
                                {String(value)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function DependenciesTab({ node, isDark }) {
    return (
        <div>
            <div style={{ marginBottom: '16px' }}>
                <label style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isDark ? '#6b7280' : '#9ca3af'
                }}>
                    Upstream Dependencies
                </label>
                <div style={{
                    marginTop: '8px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px dashed ${isDark ? '#27272a' : '#e5e5e5'}`,
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '12px', color: isDark ? '#6b7280' : '#9ca3af', margin: 0 }}>
                        Connect nodes to see dependencies
                    </p>
                </div>
            </div>

            <div>
                <label style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isDark ? '#6b7280' : '#9ca3af'
                }}>
                    Downstream Dependents
                </label>
                <div style={{
                    marginTop: '8px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px dashed ${isDark ? '#27272a' : '#e5e5e5'}`,
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '12px', color: isDark ? '#6b7280' : '#9ca3af', margin: 0 }}>
                        Connect nodes to see dependents
                    </p>
                </div>
            </div>
        </div>
    );
}

function UsageTab({ node, isDark }) {
    const usageData = {
        totalProjects: node.type === 'core' ? 12 : node.type === 'module' ? 5 : 1,
        reuseScore: node.reusability === 'global' ? 85 : 20
    };

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1a1a1c' : '#f9fafb',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: isDark ? '#fff' : '#111', margin: 0 }}>
                        {usageData.totalProjects}
                    </p>
                    <p style={{ fontSize: '10px', color: isDark ? '#6b7280' : '#9ca3af', marginTop: '4px' }}>
                        Projects Using
                    </p>
                </div>
                <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1a1a1c' : '#f9fafb',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        margin: 0,
                        color: usageData.reuseScore >= 70 ? '#10b981' : usageData.reuseScore >= 40 ? '#f59e0b' : '#ef4444'
                    }}>
                        {usageData.reuseScore}%
                    </p>
                    <p style={{ fontSize: '10px', color: isDark ? '#6b7280' : '#9ca3af', marginTop: '4px' }}>
                        Reuse Score
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: isDark ? '#1a1a1c' : '#e5e5e5',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${usageData.reuseScore}%`,
                        borderRadius: '3px',
                        backgroundColor: usageData.reuseScore >= 70 ? '#10b981' : usageData.reuseScore >= 40 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>
        </div>
    );
}
