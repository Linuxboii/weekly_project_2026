'use client'

import { motion } from 'framer-motion'

const steps = [
    {
        number: '01',
        title: 'Identify friction',
        description: 'Find the manual, repetitive tasks that slow your team down. Look for patterns.',
        icon: '🔍',
    },
    {
        number: '02',
        title: 'Map the system',
        description: 'Understand the data flow, dependencies, and edge cases before writing any code.',
        icon: '🗺️',
    },
    {
        number: '03',
        title: 'Automate safely',
        description: 'Build with guardrails. Test incrementally. Never ship black-box systems.',
        icon: '🔧',
    },
    {
        number: '04',
        title: 'Monitor & improve',
        description: 'Track performance, catch failures early, and iterate based on real data.',
        icon: '📈',
    },
]

export default function ProcessFlow() {
    return (
        <section className="py-24 px-6 bg-card/50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                        How I approach <span className="gradient-text">automation problems</span>
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        A systematic process that reduces risk and delivers reliable systems.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="glass-card rounded-2xl p-6 h-full hover:bg-card-hover transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{step.icon}</span>
                                    <span className="text-sm font-mono text-accent">{step.number}</span>
                                </div>
                                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
