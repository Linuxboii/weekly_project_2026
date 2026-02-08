'use client'

import { motion } from 'framer-motion'

export default function AnimatedGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base grid */}
            <div className="animated-grid absolute inset-0 opacity-40" />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />

            {/* Floating accent dots */}
            <motion.div
                className="absolute w-2 h-2 rounded-full bg-accent/30 blur-sm"
                style={{ left: '20%', top: '30%' }}
                animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute w-3 h-3 rounded-full bg-accent/20 blur-sm"
                style={{ left: '70%', top: '40%' }}
                animate={{
                    y: [0, 15, 0],
                    opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                }}
            />
            <motion.div
                className="absolute w-2 h-2 rounded-full bg-accent/25 blur-sm"
                style={{ left: '85%', top: '20%' }}
                animate={{
                    y: [0, -10, 0],
                    opacity: [0.25, 0.4, 0.25],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />
        </div>
    )
}
