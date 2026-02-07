import React, { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState.jsx';
import { useProjects } from '../hooks/useProjects';
import { SIDEBAR_CATEGORIES } from '../data/nodeData';
import { Search, ChevronDown, ChevronRight, GripVertical, RefreshCw, Globe, ExternalLink } from 'lucide-react';

export default function LeftSidebar() {
    const { theme } = useAppState();
    const { projects, projectNodes, loading, error, refetch } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(['projects', 'core', 'module', 'client']);
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'library'

    const isDark = theme === 'dark';

    // Group projects by planet for display
    const projectsByPlanet = useMemo(() => {
        const groups = {};
        projects.forEach(proj => {
            const planet = proj.planet || 'unassigned';
            if (!groups[planet]) {
                groups[planet] = [];
            }
            groups[planet].push(proj);
        });
        return groups;
    }, [projects]);

    // Filter library nodes based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return SIDEBAR_CATEGORIES;

        const query = searchQuery.toLowerCase();
        return SIDEBAR_CATEGORIES.map(cat => ({
            ...cat,
            nodes: cat.nodes.filter(node =>
                node.label.toLowerCase().includes(query) ||
                node.description.toLowerCase().includes(query)
            )
        })).filter(cat => cat.nodes.length > 0);
    }, [searchQuery]);

    // Filter projects based on search
    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const query = searchQuery.toLowerCase();
        return projects.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.planet?.toLowerCase().includes(query) ||
            p.slug?.toLowerCase().includes(query)
        );
    }, [projects, searchQuery]);

    const toggleCategory = (catId) => {
        setExpandedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    const onDragStart = (event, nodeTemplate) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeTemplate));
        event.dataTransfer.effectAllowed = 'move';
    };

    const getCategoryColor = (catId) => {
        switch (catId) {
            case 'core': return { bg: '#10b981', light: 'rgba(16, 185, 129, 0.15)' };
            case 'module': return { bg: '#8b5cf6', light: 'rgba(139, 92, 246, 0.15)' };
            case 'client': return { bg: '#f59e0b', light: 'rgba(245, 158, 11, 0.15)' };
            default: return { bg: '#6b7280', light: 'rgba(107, 114, 128, 0.15)' };
        }
    };

    const getPlanetColor = (planet) => {
        const colors = {
            'sun': '#fbbf24',
            'mercury': '#94a3b8',
            'venus': '#fb923c',
            'earth': '#22c55e',
            'mars': '#ef4444',
            'jupiter': '#f59e0b',
            'saturn': '#eab308',
            'uranus': '#22d3d1',
            'neptune': '#3b82f6',
            'asteroid-belt': '#6b7280'
        };
        return colors[planet?.toLowerCase()] || '#6b7280';
    };

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
                padding: '12px 16px',
                borderBottom: isDark ? '1px solid #222225' : '1px solid #e5e5e5'
            }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '12px',
                    padding: '3px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1a1a1c' : '#f3f4f6'
                }}>
                    <button
                        onClick={() => setActiveTab('projects')}
                        style={{
                            flex: 1,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            backgroundColor: activeTab === 'projects'
                                ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff')
                                : 'transparent',
                            color: activeTab === 'projects'
                                ? (isDark ? '#fff' : '#111')
                                : (isDark ? '#6b7280' : '#9ca3af'),
                            boxShadow: activeTab === 'projects' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        My Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        style={{
                            flex: 1,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            backgroundColor: activeTab === 'library'
                                ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff')
                                : 'transparent',
                            color: activeTab === 'library'
                                ? (isDark ? '#fff' : '#111')
                                : (isDark ? '#6b7280' : '#9ca3af'),
                            boxShadow: activeTab === 'library' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Node Library
                    </button>
                </div>

                {/* Search */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1a1a1c' : '#f9fafb',
                    border: isDark ? '1px solid #2a2a2e' : '1px solid #e5e5e5'
                }}>
                    <Search size={14} color="#6b7280" />
                    <input
                        type="text"
                        placeholder={activeTab === 'projects' ? 'Search projects...' : 'Search nodes...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            color: isDark ? '#e5e5e5' : '#374151'
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {activeTab === 'projects' ? (
                    <ProjectsList
                        projects={filteredProjects}
                        projectsByPlanet={projectsByPlanet}
                        loading={loading}
                        error={error}
                        refetch={refetch}
                        isDark={isDark}
                        expandedCategories={expandedCategories}
                        toggleCategory={toggleCategory}
                        onDragStart={onDragStart}
                        getPlanetColor={getPlanetColor}
                        projectNodes={projectNodes}
                    />
                ) : (
                    <NodeLibrary
                        categories={filteredCategories}
                        isDark={isDark}
                        expandedCategories={expandedCategories}
                        toggleCategory={toggleCategory}
                        onDragStart={onDragStart}
                        getCategoryColor={getCategoryColor}
                    />
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '12px',
                borderTop: isDark ? '1px solid #222225' : '1px solid #e5e5e5',
                textAlign: 'center'
            }}>
                <p style={{
                    fontSize: '10px',
                    color: isDark ? '#4b5563' : '#9ca3af',
                    margin: 0
                }}>
                    Drag to canvas • {activeTab === 'projects' ? `${projects.length} projects` : 'Node templates'}
                </p>
            </div>
        </div>
    );
}

// ============ SUB-COMPONENTS ============

function ProjectsList({ projects, loading, error, refetch, isDark, onDragStart, getPlanetColor, projectNodes }) {
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                <div style={{ textAlign: 'center' }}>
                    <RefreshCw size={20} color="#6b7280" className="animate-spin" />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>Failed to load projects</p>
                <button
                    onClick={refetch}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                        color: isDark ? '#fff' : '#374151',
                        fontSize: '11px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <Globe size={28} color="#6b7280" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: '#6b7280' }}>No projects found</p>
            </div>
        );
    }

    return (
        <div>
            {projects.map((project) => {
                const nodeData = projectNodes.find(n => n.templateId === `project-${project.id}`);
                const planetColor = getPlanetColor(project.planet);

                return (
                    <div
                        key={project.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, nodeData)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            marginBottom: '6px',
                            borderRadius: '10px',
                            cursor: 'grab',
                            backgroundColor: 'transparent',
                            border: isDark ? '1px solid #222225' : '1px solid #e5e5e5',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : '#fafafa';
                            e.currentTarget.style.borderColor = isDark ? '#333' : '#d1d5db';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = isDark ? '#222225' : '#e5e5e5';
                        }}
                    >
                        {/* Drag Handle */}
                        <div style={{ opacity: 0.3 }}>
                            <GripVertical size={12} color="#6b7280" />
                        </div>

                        {/* Planet Indicator */}
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${planetColor}, ${planetColor}88)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#fff',
                            textTransform: 'uppercase'
                        }}>
                            {(project.planet || 'U')[0]}
                        </div>

                        {/* Project Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <p style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: isDark ? '#e5e5e5' : '#374151',
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {project.name}
                                </p>
                                {project.url && (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            color: '#6b7280',
                                            lineHeight: 0,
                                            opacity: 0.7
                                        }}
                                    >
                                        <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                <span style={{
                                    fontSize: '9px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: `${planetColor}22`,
                                    color: planetColor,
                                    textTransform: 'capitalize'
                                }}>
                                    {project.planet || 'Unassigned'}
                                </span>
                                <span style={{
                                    fontSize: '9px',
                                    color: isDark ? '#4b5563' : '#9ca3af'
                                }}>
                                    {project.deployment_type || 'static'}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: project.status === 'active' ? '#22c55e' :
                                project.status === 'deprecated' ? '#ef4444' : '#6b7280'
                        }} />
                    </div>
                );
            })}
        </div>
    );
}

function NodeLibrary({ categories, isDark, expandedCategories, toggleCategory, onDragStart, getCategoryColor }) {
    return (
        <>
            {categories.map((category) => {
                const catColor = getCategoryColor(category.id);
                const isExpanded = expandedCategories.includes(category.id);

                return (
                    <div key={category.id} style={{ marginBottom: '8px' }}>
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: catColor.bg
                                }} />
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: isDark ? '#d1d5db' : '#374151'
                                }}>
                                    {category.label}
                                </span>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    color: isDark ? '#6b7280' : '#9ca3af'
                                }}>
                                    {category.nodes.length}
                                </span>
                            </div>
                            {isExpanded ?
                                <ChevronDown size={14} color="#6b7280" /> :
                                <ChevronRight size={14} color="#6b7280" />
                            }
                        </button>

                        {/* Nodes */}
                        {isExpanded && (
                            <div style={{ marginTop: '4px' }}>
                                {category.nodes.map((node) => {
                                    const Icon = node.icon;
                                    return (
                                        <div
                                            key={node.templateId}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, node)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                marginBottom: '4px',
                                                borderRadius: '8px',
                                                cursor: 'grab',
                                                backgroundColor: 'transparent',
                                                border: isDark ? '1px solid transparent' : '1px solid transparent',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : '#fafafa';
                                                e.currentTarget.style.borderColor = isDark ? '#2a2a2e' : '#e5e5e5';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = 'transparent';
                                            }}
                                        >
                                            <div style={{ opacity: 0.4 }}>
                                                <GripVertical size={12} color="#6b7280" />
                                            </div>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                backgroundColor: catColor.bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Icon size={14} color="#fff" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: isDark ? '#e5e5e5' : '#374151',
                                                    margin: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {node.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}
