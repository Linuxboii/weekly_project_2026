'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WizardData {
    problem: string
    tools: string[]
    frequency: string
    output: string
}

const toolOptions = [
    { id: 'sheets', label: 'Google Sheets', icon: '📊' },
    { id: 'slack', label: 'Slack', icon: '💬' },
    { id: 'notion', label: 'Notion', icon: '📝' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'crm', label: 'CRM', icon: '👥' },
    { id: 'api', label: 'Custom API', icon: '🔌' },
]

const frequencyOptions = [
    { id: 'onetime', label: 'One-time', desc: 'Run once and done' },
    { id: 'daily', label: 'Daily', desc: 'Scheduled daily runs' },
    { id: 'event', label: 'Event-based', desc: 'Triggered by actions' },
    { id: 'realtime', label: 'Real-time', desc: 'Instant processing' },
]

const outputOptions = [
    { id: 'report', label: 'Report', icon: '📈' },
    { id: 'alert', label: 'Alert', icon: '🔔' },
    { id: 'decision', label: 'Decision', icon: '🎯' },
    { id: 'action', label: 'Action', icon: '⚡' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
]

const steps = [
    { id: 1, title: 'Problem', question: 'What problem are you trying to solve?' },
    { id: 2, title: 'Tools', question: 'What tools do you currently use?' },
    { id: 3, title: 'Frequency', question: 'How often should this run?' },
    { id: 4, title: 'Output', question: 'What should the output be?' },
    { id: 5, title: 'Summary', question: 'Your automation blueprint' },
]

export default function AutomationWizard() {
    const [step, setStep] = useState(1)
    const [data, setData] = useState<WizardData>({
        problem: '',
        tools: [],
        frequency: '',
        output: '',
    })

    const nextStep = () => {
        if (step < 5) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const toggleTool = (toolId: string) => {
        setData((prev) => ({
            ...prev,
            tools: prev.tools.includes(toolId)
                ? prev.tools.filter((t) => t !== toolId)
                : [...prev.tools, toolId],
        }))
    }

    const canProceed = () => {
        switch (step) {
            case 1:
                return data.problem.length > 10
            case 2:
                return data.tools.length > 0
            case 3:
                return data.frequency !== ''
            case 4:
                return data.output !== ''
            default:
                return true
        }
    }

    return (
        <section className="py-24 px-6 bg-card/50">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                        Build your <span className="gradient-text">automation</span>
                    </h2>
                    <p className="text-muted">
                        Tell me about your workflow. I'll design the system.
                    </p>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-2">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center">
                                <button
                                    onClick={() => step > s.id && setStep(s.id)}
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${step === s.id ? 'bg-accent text-background' : ''}
                    ${step > s.id ? 'bg-accent/20 text-accent cursor-pointer hover:bg-accent/30' : ''}
                    ${step < s.id ? 'bg-card text-muted' : ''}
                  `}
                                >
                                    {step > s.id ? '✓' : s.id}
                                </button>
                                {i < steps.length - 1 && (
                                    <div
                                        className={`w-8 h-0.5 mx-1 ${step > s.id ? 'bg-accent' : 'bg-border'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step content */}
                <div className="glass-card rounded-2xl p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className="text-xl font-medium mb-6">{steps[step - 1].question}</h3>

                            {step === 1 && (
                                <textarea
                                    value={data.problem}
                                    onChange={(e) => setData({ ...data, problem: e.target.value })}
                                    placeholder="e.g., I spend 3 hours every week manually copying data from emails into our spreadsheet..."
                                    className="w-full h-32 bg-background border border-border rounded-lg p-4 text-foreground placeholder:text-muted resize-none focus:border-accent transition-colors"
                                />
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {toolOptions.map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id)}
                                            className={`
                        p-4 rounded-xl border transition-all text-left
                        ${data.tools.includes(tool.id)
                                                    ? 'border-accent bg-accent/10'
                                                    : 'border-border bg-background hover:border-muted'
                                                }
                      `}
                                        >
                                            <span className="text-2xl mb-2 block">{tool.icon}</span>
                                            <span className="text-sm font-medium">{tool.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {frequencyOptions.map((freq) => (
                                        <button
                                            key={freq.id}
                                            onClick={() => setData({ ...data, frequency: freq.id })}
                                            className={`
                        p-4 rounded-xl border transition-all text-left
                        ${data.frequency === freq.id
                                                    ? 'border-accent bg-accent/10'
                                                    : 'border-border bg-background hover:border-muted'
                                                }
                      `}
                                        >
                                            <span className="font-medium block mb-1">{freq.label}</span>
                                            <span className="text-sm text-muted">{freq.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 4 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {outputOptions.map((out) => (
                                        <button
                                            key={out.id}
                                            onClick={() => setData({ ...data, output: out.id })}
                                            className={`
                        p-4 rounded-xl border transition-all text-left
                        ${data.output === out.id
                                                    ? 'border-accent bg-accent/10'
                                                    : 'border-border bg-background hover:border-muted'
                                                }
                      `}
                                        >
                                            <span className="text-2xl mb-2 block">{out.icon}</span>
                                            <span className="text-sm font-medium">{out.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-background border border-border">
                                        <h4 className="text-sm text-muted mb-2">Problem</h4>
                                        <p className="text-sm">{data.problem || 'Not specified'}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {data.tools.map((toolId) => {
                                            const tool = toolOptions.find((t) => t.id === toolId)
                                            return (
                                                <span
                                                    key={toolId}
                                                    className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm"
                                                >
                                                    {tool?.icon} {tool?.label}
                                                </span>
                                            )
                                        })}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-background border border-border">
                                            <h4 className="text-sm text-muted mb-1">Frequency</h4>
                                            <p className="font-medium">
                                                {frequencyOptions.find((f) => f.id === data.frequency)?.label || 'Not set'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-background border border-border">
                                            <h4 className="text-sm text-muted mb-1">Output</h4>
                                            <p className="font-medium">
                                                {outputOptions.find((o) => o.id === data.output)?.label || 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mini diagram */}
                                    <div className="p-6 rounded-xl bg-background border border-accent/30">
                                        <h4 className="text-sm text-accent mb-4">Generated System Blueprint</h4>
                                        <div className="flex items-center justify-center gap-2 text-sm overflow-x-auto">
                                            <span className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-500 whitespace-nowrap">
                                                ⚡ Trigger
                                            </span>
                                            <span className="text-muted">→</span>
                                            <span className="px-3 py-2 rounded-lg bg-purple-500/10 text-purple-500 whitespace-nowrap">
                                                🔀 Filter
                                            </span>
                                            <span className="text-muted">→</span>
                                            <span className="px-3 py-2 rounded-lg bg-accent/10 text-accent whitespace-nowrap">
                                                🤖 Process
                                            </span>
                                            <span className="text-muted">→</span>
                                            <span className="px-3 py-2 rounded-lg bg-pink-500/10 text-pink-500 whitespace-nowrap">
                                                📤 {outputOptions.find((o) => o.id === data.output)?.label || 'Output'}
                                            </span>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-accent hover:bg-accent-dim text-background font-medium rounded-lg transition-all">
                                        Turn this into a real system →
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {step < 5 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <button
                                onClick={prevStep}
                                disabled={step === 1}
                                className={`px-6 py-2 rounded-lg transition-all ${step === 1
                                        ? 'text-muted cursor-not-allowed'
                                        : 'text-foreground hover:bg-card-hover'
                                    }`}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className={`px-6 py-2 rounded-lg transition-all ${canProceed()
                                        ? 'bg-accent text-background hover:bg-accent-dim'
                                        : 'bg-muted/20 text-muted cursor-not-allowed'
                                    }`}
                            >
                                Continue →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
