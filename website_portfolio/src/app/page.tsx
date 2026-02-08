'use client'

import { useRef } from 'react'
import AnimatedGrid from '@/components/AnimatedGrid'
import Hero from '@/components/Hero'
import FlowDiagram from '@/components/FlowDiagram'
import AutomationWizard from '@/components/AutomationWizard'
import DemoPlayground from '@/components/DemoPlayground'
import ProcessFlow from '@/components/ProcessFlow'
import Constraints from '@/components/Constraints'
import FinalCTA from '@/components/FinalCTA'

export default function Home() {
    const wizardRef = useRef<HTMLDivElement>(null)
    const diagramRef = useRef<HTMLDivElement>(null)

    const scrollToWizard = () => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const scrollToDiagram = () => {
        diagramRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <main className="relative">
            {/* Animated background for hero */}
            <div className="absolute inset-0 h-screen">
                <AnimatedGrid />
            </div>

            {/* Hero Section */}
            <Hero onPrimaryCTA={scrollToWizard} onSecondaryCTA={scrollToDiagram} />

            {/* Interactive System Diagram */}
            <div ref={diagramRef}>
                <FlowDiagram />
            </div>

            {/* Build Your Automation Wizard */}
            <div ref={wizardRef}>
                <AutomationWizard />
            </div>

            {/* Demo Playground */}
            <DemoPlayground />

            {/* Process & Thinking */}
            <ProcessFlow />

            {/* Constraints & Philosophy */}
            <Constraints />

            {/* Final CTA */}
            <FinalCTA />

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-border">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted">
                        © {new Date().getFullYear()} AvlokAI. All rights reserved.
                    </p>
                    <p className="text-sm text-muted">
                        Built with systems thinking. No fluff.
                    </p>
                </div>
            </footer>
        </main>
    )
}
