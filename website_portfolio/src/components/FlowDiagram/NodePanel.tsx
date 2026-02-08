'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface NodeData {
    label: string
    type: string
    description: string
    purpose: string
    breaks: string
}

interface NodePanelProps {
    node: NodeData | null
    onClose: () => void
}

const typeLabels: Record<string, string> = {
    trigger: 'Trigger Node',
    logic: 'Logic Node',
    ai: 'AI Node',
    data: 'Data Node',
    output: 'Output Node',
}

export default function NodePanel({ node, onClose }: NodePanelProps) {
    return (
        <AnimatePresence>
            {node && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 h-full w-80 glass-card border-l border-border p-6 overflow-y-auto z-20"
                >
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-medium text-muted uppercase tracking-wide">
                            {typeLabels[node.type] || 'Node Details'}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors"
                        >
                            <svg
                                className="w-4 h-4 text-muted"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-4">{node.label}</h3>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-accent mb-2">What it does</h4>
                            <p className="text-sm text-muted leading-relaxed">{node.description}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-accent mb-2">Why it exists</h4>
                            <p className="text-sm text-muted leading-relaxed">{node.purpose}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-accent mb-2">What breaks without it</h4>
                            <p className="text-sm text-muted leading-relaxed">{node.breaks}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-xs text-muted">
                            Click anywhere on the diagram to close this panel.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
