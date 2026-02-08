'use client'

import { motion } from 'framer-motion'

const constraints = [
    {
        icon: '🚫',
        title: "I don't build chatbots without a clear job.",
        description: 'Every AI component needs a defined purpose, measurable outcome, and fallback strategy.',
    },
    {
        icon: '⚠️',
        title: "I don't automate broken processes.",
        description: 'Automation amplifies problems. If your workflow is broken, we fix it first.',
    },
    {
        icon: '📦',
        title: "I don't ship black-box systems.",
        description: 'You should understand how your automation works, why it makes decisions, and how to fix it.',
    },
    {
        icon: '🎪',
        title: "I don't build demos for demos' sake.",
        description: "If it won't run in production and solve a real problem, I won't build it.",
    },
]

export default function Constraints() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                        What I <span className="text-red-400">don't</span> do
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Clear boundaries lead to better outcomes. Here's where I draw the line.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {constraints.map((constraint, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="glass-card rounded-xl p-5 hover:bg-card-hover transition-colors"
                        >
                            <div className="flex gap-4">
                                <span className="text-2xl shrink-0">{constraint.icon}</span>
                                <div>
                                    <h3 className="font-medium mb-1">{constraint.title}</h3>
                                    <p className="text-sm text-muted leading-relaxed">{constraint.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
