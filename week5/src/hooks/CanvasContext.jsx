import React, { createContext, useContext } from 'react';

/**
 * Context for passing canvas state to UI components
 * This allows TopBar and other components to access canvas save/load functions
 */
const CanvasContext = createContext(null);

export function CanvasProvider({ value, children }) {
    return (
        <CanvasContext.Provider value={value}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvasContext() {
    return useContext(CanvasContext);
}
