import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Panel,
    MarkerType,
    ReactFlowProvider,
    SelectionMode,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AppStateProvider, useAppState, CANVAS_MODES } from './hooks/useAppState.jsx';
import { useCanvas } from './hooks/useCanvas.js';
import { CanvasProvider } from './hooks/CanvasContext.jsx';
import Layout from './components/Layout';
import ArchitectureNode from './nodes/ArchitectureNode';
import ClientNode from './nodes/ClientNode';
import { edgeTypes } from './edges/CustomEdges';
import { CORE_NODES, MODULE_NODES, CLIENT_NODES, NODE_CATEGORIES, NODE_STATUS } from './data/nodeData';
import { Sparkles, Crosshair, AlertTriangle, X } from 'lucide-react';

// Initial demo nodes
const createInitialNodes = () => {
    const nodes = [];

    // Add some CORE nodes
    nodes.push({
        id: 'webhook-1',
        type: 'architecture',
        position: { x: 100, y: 100 },
        data: { ...CORE_NODES[0] } // Webhook Ingestor
    });

    nodes.push({
        id: 'normalizer-1',
        type: 'architecture',
        position: { x: 400, y: 100 },
        data: { ...CORE_NODES[1] } // Channel Normalizer
    });

    nodes.push({
        id: 'memory-1',
        type: 'architecture',
        position: { x: 700, y: 100 },
        data: { ...CORE_NODES[3] } // Conversation Memory
    });

    nodes.push({
        id: 'router-1',
        type: 'architecture',
        position: { x: 700, y: 350 },
        data: { ...CORE_NODES[4] } // Intent Router
    });

    // Add a MODULE node
    nodes.push({
        id: 'scoring-1',
        type: 'architecture',
        position: { x: 1000, y: 100 },
        data: { ...MODULE_NODES[0] } // Lead Scoring
    });

    // Add a CLIENT node
    nodes.push({
        id: 'client-1',
        type: 'client',
        position: { x: 400, y: 450 },
        data: { ...CLIENT_NODES[1] } // WhatsApp Sales Agent
    });

    return nodes;
};

const initialEdges = [
    {
        id: 'e1-2',
        source: 'webhook-1',
        target: 'normalizer-1',
        type: 'data',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    },
    {
        id: 'e2-3',
        source: 'normalizer-1',
        target: 'memory-1',
        type: 'data',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    },
    {
        id: 'e3-4',
        source: 'memory-1',
        target: 'router-1',
        type: 'control',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
    },
    {
        id: 'e3-5',
        source: 'memory-1',
        target: 'scoring-1',
        type: 'data',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    },
    {
        id: 'e-client',
        source: 'router-1',
        target: 'client-1',
        type: 'dependency',
        data: { label: 'Uses' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' }
    }
];

function Canvas({ canvas }) {
    const {
        theme,
        showGrid,
        snapToGrid,
        canvasMode,
        selectNode,
        selectedNodeId,
        highlightMode,
        highlightedClientId,
        enableHighlightMode,
        disableHighlightMode,
        tracingNodeId,
        startDependencyTrace,
        stopDependencyTrace,
        impactSimulationNodeId,
        startImpactSimulation,
        stopImpactSimulation
    } = useAppState();

    const reactFlowWrapper = useRef(null);

    // Load saved state from localStorage if available, otherwise use defaults
    const getInitialState = () => {
        try {
            const saved = localStorage.getItem('nexus_canvas_local');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.data && parsed.data.nodes && parsed.data.nodes.length > 0) {
                    console.log('[Canvas] Using saved state from localStorage');
                    return {
                        nodes: parsed.data.nodes,
                        edges: parsed.data.edges || []
                    };
                }
            }
        } catch (err) {
            console.log('[Canvas] Error loading saved state:', err);
        }
        console.log('[Canvas] Using default initial nodes');
        return {
            nodes: createInitialNodes(),
            edges: initialEdges
        };
    };

    const initialState = useMemo(getInitialState, []);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);

    const nodeTypes = useMemo(() => ({
        architecture: ArchitectureNode,
        client: ClientNode,
    }), []);

    // Simple undo history - stores snapshots before deletions
    const undoStack = useRef([]);

    // Keyboard shortcuts: Delete, Undo, and Save
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Save: Ctrl+S
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                if (canvas.hasUnsavedChanges) {
                    canvas.save();
                }
                return;
            }

            // Prevent Ctrl+Z from doing anything weird - handle our own undo
            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                if (undoStack.current.length > 0) {
                    const lastState = undoStack.current.pop();
                    setNodes(lastState.nodes);
                    setEdges(lastState.edges);
                }
                return;
            }

            // Delete selected nodes
            if (event.key === 'Delete' || event.key === 'Backspace') {
                // Don't delete if user is typing in an input
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                    return;
                }

                setNodes(currentNodes => {
                    const selectedNodes = currentNodes.filter(node => node.selected);
                    if (selectedNodes.length > 0) {
                        // Save current state before deletion
                        undoStack.current.push({
                            nodes: currentNodes,
                            edges: edges
                        });
                        // Keep only last 20 states
                        if (undoStack.current.length > 20) {
                            undoStack.current.shift();
                        }

                        // Mark as having unsaved changes
                        canvas.markDirty();

                        const selectedIds = new Set(selectedNodes.map(n => n.id));
                        setEdges(eds => eds.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
                        return currentNodes.filter(n => !selectedIds.has(n.id));
                    }
                    return currentNodes;
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [edges, setNodes, setEdges, canvas]);

    // Track changes for unsaved indicator
    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);
        // Mark dirty on meaningful changes (position, add, remove)
        const meaningfulChange = changes.some(c =>
            c.type === 'position' || c.type === 'add' || c.type === 'remove'
        );
        if (meaningfulChange) {
            canvas.markDirty();
        }
    }, [onNodesChange, canvas]);

    const handleEdgesChange = useCallback((changes) => {
        onEdgesChange(changes);
        if (changes.length > 0) {
            canvas.markDirty();
        }
    }, [onEdgesChange, canvas]);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({
            ...params,
            type: 'data',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
        }, eds));
    }, [setEdges]);

    const onNodeClick = useCallback((event, node) => {
        selectNode(node.data.templateId);
    }, [selectNode]);

    const onPaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    // Drag and drop from sidebar
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();

        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;

        const nodeTemplate = JSON.parse(type);
        const position = {
            x: event.clientX - 300,
            y: event.clientY - 100,
        };

        const newNode = {
            id: `${nodeTemplate.templateId}-${Date.now()}`,
            type: nodeTemplate.type === 'client' ? 'client' : 'architecture',
            position,
            data: { ...nodeTemplate },
        };

        setNodes((nds) => [...nds, newNode]);
    }, [setNodes]);

    // Apply visual storytelling effects
    const processedNodes = useMemo(() => {
        if (!highlightMode || !highlightedClientId) return nodes;

        const clientNode = nodes.find(n => n.id === highlightedClientId);
        if (!clientNode?.data?.containedNodes) return nodes;

        const highlightedIds = new Set(clientNode.data.containedNodes);
        highlightedIds.add(highlightedClientId);

        return nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                faded: !highlightedIds.has(node.data.templateId) && node.id !== highlightedClientId
            }
        }));
    }, [nodes, highlightMode, highlightedClientId]);

    const isPresentationMode = canvasMode === CANVAS_MODES.PRESENTATION;

    return (
        <div
            ref={reactFlowWrapper}
            style={{ width: '100%', height: '100%' }}
        >
            <ReactFlow
                nodes={processedNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                fitView
                snapToGrid={snapToGrid}
                snapGrid={[20, 20]}
                selectionOnDrag={!isPresentationMode}
                selectionMode={SelectionMode.Partial}
                panOnDrag={isPresentationMode ? false : [1, 2]}
                panOnScroll={false}
                zoomOnScroll={!isPresentationMode}
                nodesDraggable={!isPresentationMode}
                nodesConnectable={!isPresentationMode}
                elementsSelectable={!isPresentationMode}
                selectNodesOnDrag={false}
                deleteKeyCode={null}
                className={theme === 'dark' ? 'bg-[#0a0a0b]' : 'bg-gray-50'}
                proOptions={{ hideAttribution: true }}
            >
                {showGrid && (
                    <Background
                        color={theme === 'dark' ? '#1a1a1c' : '#e5e5e5'}
                        gap={20}
                        size={1}
                        variant="dots"
                    />
                )}

                {/* Visual Storytelling Controls */}
                {!isPresentationMode && (
                    <Panel position="top-left" className="m-4 mt-2">
                        <div className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-[#111113]/90 border border-[#222225]' : 'bg-white/90 border border-gray-200'
                            } backdrop-blur shadow-lg`}>
                            {/* Highlight Mode */}
                            <button
                                onClick={() => highlightMode ? disableHighlightMode() : enableHighlightMode('client-1')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${highlightMode
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : theme === 'dark'
                                        ? 'text-gray-400 hover:bg-white/5'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Sparkles size={14} />
                                Highlight
                            </button>

                            {/* Trace Mode */}
                            <button
                                onClick={() => tracingNodeId ? stopDependencyTrace() : startDependencyTrace('webhook-1')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tracingNodeId
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : theme === 'dark'
                                        ? 'text-gray-400 hover:bg-white/5'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Crosshair size={14} />
                                Trace
                            </button>

                            {/* Impact Simulation */}
                            <button
                                onClick={() => impactSimulationNodeId ? stopImpactSimulation() : startImpactSimulation('normalizer-1')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${impactSimulationNodeId
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : theme === 'dark'
                                        ? 'text-gray-400 hover:bg-white/5'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <AlertTriangle size={14} />
                                Impact
                            </button>
                        </div>
                    </Panel>
                )}

                {/* Presentation Mode Banner */}
                {isPresentationMode && (
                    <Panel position="bottom-center" className="mb-4">
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-full ${theme === 'dark'
                            ? 'bg-[#111113]/90 border border-[#222225]'
                            : 'bg-white/90 border border-gray-200'
                            } backdrop-blur shadow-lg`}>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Presentation Mode
                            </span>
                        </div>
                    </Panel>
                )}

                <Controls
                    className={`!rounded-lg !border ${theme === 'dark'
                        ? '!bg-[#111113] !border-[#222225] [&>button]:!bg-transparent [&>button]:!border-[#222225] [&>button]:!text-gray-400 [&>button:hover]:!bg-white/5'
                        : '!bg-white !border-gray-200 [&>button]:!bg-transparent [&>button]:!border-gray-200 [&>button]:!text-gray-500 [&>button:hover]:!bg-gray-100'
                        }`}
                    showInteractive={false}
                />
                <MiniMap
                    nodeColor={(node) => {
                        if (node.type === 'client') return '#f59e0b';
                        if (node.data?.category?.id === 'core') return '#10b981';
                        if (node.data?.category?.id === 'module') return '#8b5cf6';
                        return '#6b7280';
                    }}
                    maskColor={theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)'}
                    className={`!rounded-lg !border ${theme === 'dark'
                        ? '!bg-[#111113] !border-[#222225]'
                        : '!bg-white !border-gray-200'
                        }`}
                />
            </ReactFlow>
        </div>
    );
}

export default function App() {
    return (
        <ReactFlowProvider>
            <AppStateProvider>
                <CanvasApp />
            </AppStateProvider>
        </ReactFlowProvider>
    );
}

// Wrapper component to access canvas hook inside ReactFlowProvider
function CanvasApp() {
    // Get canvasId from URL if present
    const canvasIdFromUrl = useMemo(() => {
        const match = window.location.pathname.match(/\/canvas\/([^/]+)/);
        return match ? match[1] : null;
    }, []);

    const canvas = useCanvas(canvasIdFromUrl);

    return (
        <CanvasProvider value={canvas}>
            <Layout>
                <Canvas canvas={canvas} />
            </Layout>
        </CanvasProvider>
    );
}
