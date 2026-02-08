import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'AvlokAI - AI Automation Systems',
    description: 'I design AI systems that eliminate manual work. Not demos. Not chatbots for the sake of it. Real automations that run businesses.',
    keywords: ['AI automation', 'workflow automation', 'n8n', 'AI systems', 'business automation'],
    authors: [{ name: 'AvlokAI' }],
    icons: {
        icon: '/favicon.png',
    },
    openGraph: {
        title: 'AvlokAI - AI Automation Systems',
        description: 'I design AI systems that eliminate manual work.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-background text-foreground">
                {children}
            </body>
        </html>
    )
}
