'use client'

import { useCallback, useState } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Node,
    Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CustomNode from './CustomNode'
import NodePanel from './NodePanel'

const nodeTypes = {
    custom: CustomNode,
}

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'custom',
        position: { x: 50, y: 150 },
        data: {
            label: 'Trigger',
            type: 'trigger',
            description: 'Webhook / Form / Schedule',
            purpose: 'This is the entry point of your automation. It defines when and how the system activates — on a schedule, when data arrives, or when a user takes action.',
            breaks: 'Without a trigger, nothing happens. The automation has no way to start, and all downstream logic sits idle.',
        },
    },
    {
        id: '2',
        type: 'custom',
        position: { x: 300, y: 80 },
        data: {
            label: 'Logic',
            type: 'logic',
            description: 'Conditions / Filters',
            purpose: 'This node routes data based on conditions. It ensures only relevant information flows forward, preventing unnecessary processing.',
            breaks: 'Without conditional logic, every input gets treated the same way — leading to wrong outputs, wasted compute, and broken workflows.',
        },
    },
    {
        id: '3',
        type: 'custom',
        position: { x: 300, y: 220 },
        data: {
            label: 'AI',
            type: 'ai',
            description: 'LLM / Classifier / Extractor',
            purpose: 'The intelligence layer. This node processes unstructured data — classifying intent, extracting entities, or generating responses.',
            breaks: 'Without AI, your system can only handle structured, predictable inputs. No natural language, no fuzzy matching, no real intelligence.',
        },
    },
    {
        id: '4',
        type: 'custom',
        position: { x: 550, y: 150 },
        data: {
            label: 'Data',
            type: 'data',
            description: 'Sheets / DB / Notion',
            purpose: 'This node persists or retrieves information. It connects your automation to your source of truth — databases, spreadsheets, or documentation.',
            breaks: 'Without data persistence, your automation has no memory. It cannot look up context, store results, or maintain state.',
        },
    },
    {
        id: '5',
        type: 'custom',
        position: { x: 800, y: 150 },
        data: {
            label: 'Output',
            type: 'output',
            description: 'Email / Slack / API',
            purpose: 'The final step. This node delivers results — sending messages, updating systems, or triggering downstream actions.',
            breaks: 'Without output, your automation runs in silence. No notifications, no updates, no visible impact on your work.',
        },
    },
]

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-4', source: '2', target: '4', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
    { id: 'e4-5', source: '4', target: '5', animated: true },
]

export default function FlowDiagram() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const [selectedNode, setSelectedNode] = useState<any>(null)

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node.data)
    }, [])

    const onPaneClick = useCallback(() => {
        setSelectedNode(null)
    }, [])

    const resetView = useCallback(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
        setSelectedNode(null)
    }, [setNodes, setEdges])

    return (
        <section className="relative py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                        How my automations <span className="gradient-text">actually work</span>
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Click on any node to understand its purpose. Drag to explore. This is the anatomy of a real automation system.
                    </p>
                </div>

                <div className="relative h-[500px] rounded-2xl glass-card overflow-hidden">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-left"
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color="#27272a" gap={20} size={1} />
                        <Controls
                            className="!bg-card !border-border !rounded-lg"
                            showInteractive={false}
                        />
                    </ReactFlow>

                    <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />

                    <button
                        onClick={resetView}
                        className="absolute top-4 right-4 px-4 py-2 text-sm glass-card hover:bg-card-hover rounded-lg transition-colors z-10"
                    >
                        Reset view
                    </button>
                </div>
            </div>
        </section>
    )
}
