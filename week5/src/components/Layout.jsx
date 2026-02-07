import React from 'react';
import { useAppState } from '../hooks/useAppState.jsx';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

export default function Layout({ children }) {
    const { leftSidebarOpen, rightSidebarOpen, theme } = useAppState();

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: theme === 'dark' ? '#0a0a0b' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#111'
            }}
        >
            {/* Top Bar */}
            <TopBar />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                minHeight: 0
            }}>
                {/* Left Sidebar - Node Library */}
                {leftSidebarOpen && (
                    <div style={{
                        width: '280px',
                        minWidth: '280px',
                        height: '100%',
                        overflow: 'hidden',
                        borderRight: theme === 'dark' ? '1px solid #222225' : '1px solid #e5e5e5'
                    }}>
                        <LeftSidebar />
                    </div>
                )}

                {/* Canvas */}
                <div style={{
                    flex: 1,
                    height: '100%',
                    position: 'relative',
                    minWidth: 0
                }}>
                    {children}
                </div>

                {/* Right Sidebar - Inspector */}
                {rightSidebarOpen && (
                    <div style={{
                        width: '320px',
                        minWidth: '320px',
                        height: '100%',
                        overflow: 'hidden',
                        borderLeft: theme === 'dark' ? '1px solid #222225' : '1px solid #e5e5e5'
                    }}>
                        <RightSidebar />
                    </div>
                )}
            </div>
        </div>
    );
}
