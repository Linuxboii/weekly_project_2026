import React, { createContext, useContext, useState, useCallback } from 'react';

const AppStateContext = createContext(null);

export const CANVAS_MODES = {
    ARCHITECTURE: 'architecture',
    CLIENT_ASSEMBLY: 'client-assembly',
    PRESENTATION: 'presentation'
};

const initialState = {
    // UI State
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    theme: 'dark',
    canvasMode: CANVAS_MODES.ARCHITECTURE,

    // Selection
    selectedNodeId: null,
    selectedEdgeId: null,

    // Visual Storytelling
    highlightMode: false,
    highlightedClientId: null,
    tracingNodeId: null,
    impactSimulationNodeId: null,

    // Grid
    showGrid: true,
    snapToGrid: true
};

export function AppStateProvider({ children }) {
    const [state, setState] = useState(initialState);

    // UI Toggles
    const toggleLeftSidebar = useCallback(() => {
        setState(s => ({ ...s, leftSidebarOpen: !s.leftSidebarOpen }));
    }, []);

    const toggleRightSidebar = useCallback(() => {
        setState(s => ({ ...s, rightSidebarOpen: !s.rightSidebarOpen }));
    }, []);

    const toggleTheme = useCallback(() => {
        setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
    }, []);

    const setCanvasMode = useCallback((mode) => {
        setState(s => ({
            ...s,
            canvasMode: mode,
            // Reset storytelling when switching modes
            highlightMode: false,
            tracingNodeId: null,
            impactSimulationNodeId: null
        }));
    }, []);

    // Selection
    const selectNode = useCallback((nodeId) => {
        setState(s => ({
            ...s,
            selectedNodeId: nodeId,
            selectedEdgeId: null,
            rightSidebarOpen: nodeId ? true : s.rightSidebarOpen
        }));
    }, []);

    const selectEdge = useCallback((edgeId) => {
        setState(s => ({ ...s, selectedEdgeId: edgeId, selectedNodeId: null }));
    }, []);

    const clearSelection = useCallback(() => {
        setState(s => ({ ...s, selectedNodeId: null, selectedEdgeId: null }));
    }, []);

    // Visual Storytelling
    const enableHighlightMode = useCallback((clientNodeId) => {
        setState(s => ({
            ...s,
            highlightMode: true,
            highlightedClientId: clientNodeId,
            tracingNodeId: null,
            impactSimulationNodeId: null
        }));
    }, []);

    const disableHighlightMode = useCallback(() => {
        setState(s => ({ ...s, highlightMode: false, highlightedClientId: null }));
    }, []);

    const startDependencyTrace = useCallback((nodeId) => {
        setState(s => ({
            ...s,
            tracingNodeId: nodeId,
            highlightMode: false,
            impactSimulationNodeId: null
        }));
    }, []);

    const stopDependencyTrace = useCallback(() => {
        setState(s => ({ ...s, tracingNodeId: null }));
    }, []);

    const startImpactSimulation = useCallback((nodeId) => {
        setState(s => ({
            ...s,
            impactSimulationNodeId: nodeId,
            highlightMode: false,
            tracingNodeId: null
        }));
    }, []);

    const stopImpactSimulation = useCallback(() => {
        setState(s => ({ ...s, impactSimulationNodeId: null }));
    }, []);

    // Grid
    const toggleGrid = useCallback(() => {
        setState(s => ({ ...s, showGrid: !s.showGrid }));
    }, []);

    const toggleSnapToGrid = useCallback(() => {
        setState(s => ({ ...s, snapToGrid: !s.snapToGrid }));
    }, []);

    const value = {
        ...state,
        // Actions
        toggleLeftSidebar,
        toggleRightSidebar,
        toggleTheme,
        setCanvasMode,
        selectNode,
        selectEdge,
        clearSelection,
        enableHighlightMode,
        disableHighlightMode,
        startDependencyTrace,
        stopDependencyTrace,
        startImpactSimulation,
        stopImpactSimulation,
        toggleGrid,
        toggleSnapToGrid
    };

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within AppStateProvider');
    }
    return context;
}
