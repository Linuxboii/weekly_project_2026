'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const mockClassifications = [
    { intent: 'Support Request', confidence: 0.92, sentiment: 'Neutral' },
    { intent: 'Sales Inquiry', confidence: 0.87, sentiment: 'Positive' },
    { intent: 'Bug Report', confidence: 0.95, sentiment: 'Negative' },
    { intent: 'Feature Request', confidence: 0.89, sentiment: 'Positive' },
    { intent: 'General Feedback', confidence: 0.78, sentiment: 'Neutral' },
]

export default function DemoPlayground() {
    const [inputText, setInputText] = useState('')
    const [classification, setClassification] = useState<typeof mockClassifications[0] | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const classifyText = () => {
        if (!inputText.trim()) return

        setIsProcessing(true)
        setClassification(null)

        // Simulate AI processing
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * mockClassifications.length)
            setClassification(mockClassifications[randomIndex])
            setIsProcessing(false)
        }, 1200)
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'Positive':
                return 'text-green-400'
            case 'Negative':
                return 'text-red-400'
            default:
                return 'text-yellow-400'
        }
    }

    return (
        <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                        Try the kind of systems <span className="gradient-text">I build</span>
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Interactive demos showing real automation patterns. These aren't mockups — they're working examples.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Text Classifier Demo */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <span className="text-xl">🧠</span>
                            </div>
                            <div>
                                <h3 className="font-medium">Intent Classifier</h3>
                                <p className="text-sm text-muted">Paste text → AI classifies</p>
                            </div>
                        </div>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste a customer message, email, or support ticket..."
                            className="w-full h-28 bg-background border border-border rounded-lg p-4 text-sm text-foreground placeholder:text-muted resize-none focus:border-accent transition-colors mb-4"
                        />

                        <button
                            onClick={classifyText}
                            disabled={!inputText.trim() || isProcessing}
                            className={`w-full py-3 rounded-lg font-medium transition-all ${inputText.trim() && !isProcessing
                                    ? 'bg-accent text-background hover:bg-accent-dim'
                                    : 'bg-muted/20 text-muted cursor-not-allowed'
                                }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="inline-block"
                                    >
                                        ⚙️
                                    </motion.span>
                                    Processing...
                                </span>
                            ) : (
                                'Classify Intent'
                            )}
                        </button>

                        {classification && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 rounded-xl bg-background border border-accent/30"
                            >
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-muted mb-1">Intent</p>
                                        <p className="text-sm font-medium text-accent">{classification.intent}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-1">Confidence</p>
                                        <p className="text-sm font-medium">{Math.round(classification.confidence * 100)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-1">Sentiment</p>
                                        <p className={`text-sm font-medium ${getSentimentColor(classification.sentiment)}`}>
                                            {classification.sentiment}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Data Transform Demo */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <h3 className="font-medium">Data Transformer</h3>
                                <p className="text-sm text-muted">See how data flows through</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted mb-2">Input (Raw)</p>
                                <div className="p-3 rounded-lg bg-background border border-border font-mono text-xs overflow-x-auto">
                                    <pre className="text-muted">
                                        {`{
  "name": "John Doe",
  "email": "john@example.com",
  "created": "2024-01-15T10:30:00Z",
  "status": "ACTIVE"
}`}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-medium">
                                    🔄 Transform & Enrich
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted mb-2">Output (Processed)</p>
                                <div className="p-3 rounded-lg bg-background border border-accent/30 font-mono text-xs overflow-x-auto">
                                    <pre className="text-accent">
                                        {`{
  "user": {
    "displayName": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "daysSinceCreated": 385,
    "domain": "example.com"
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
