'use client'

import { motion } from 'framer-motion'

interface HeroProps {
    onPrimaryCTA: () => void
    onSecondaryCTA: () => void
}

export default function Hero({ onPrimaryCTA, onSecondaryCTA }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    AI Automation Consultant
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6"
                >
                    I design AI systems that{' '}
                    <span className="gradient-text">eliminate manual work.</span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12"
                >
                    Not demos. Not chatbots for the sake of it.{' '}
                    <span className="text-foreground">Real automations that run businesses.</span>
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={onPrimaryCTA}
                        className="px-8 py-4 bg-accent hover:bg-accent-dim text-background font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        Design your automation
                    </button>
                    <button
                        onClick={onSecondaryCTA}
                        className="px-8 py-4 glass-card hover:bg-card-hover text-foreground font-medium rounded-lg transition-all duration-200"
                    >
                        See live systems
                    </button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-6 h-10 rounded-full border-2 border-muted flex justify-center pt-2"
                    >
                        <div className="w-1 h-2 rounded-full bg-muted" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
