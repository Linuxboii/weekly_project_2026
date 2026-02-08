import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { loadCanvas, saveCanvas, createCanvas, getErrorMessage, requiresLogin, listCanvases, getVersionHistory } from '../api/canvas';

/**
 * Custom hook for managing canvas state with backend persistence
 * 
 * Features:
 * - Load canvas from backend on mount
 * - Track unsaved changes
 * - Manual save (no autosave per spec)
 * - beforeunload warning
 */
export function useCanvas(canvasId) {
    const { getNodes, getEdges, setNodes, setEdges, getViewport, setViewport } = useReactFlow();

    // Canvas metadata
    const [id, setId] = useState(canvasId || null);
    const [name, setName] = useState('Untitled Canvas');
    const [version, setVersion] = useState(0);

    // State flags
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);

    // Track initial state to detect changes
    const initialStateRef = useRef(null);

    /**
     * Load canvas from backend
     */
    const load = useCallback(async (loadCanvasId) => {
        if (!loadCanvasId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await loadCanvas(loadCanvasId);

            // Update metadata
            setId(result.canvasId);
            setName(result.name);
            setVersion(result.version);

            // Restore canvas state
            if (result.data) {
                if (result.data.nodes) setNodes(result.data.nodes);
                if (result.data.edges) setEdges(result.data.edges);
                if (result.data.viewport) {
                    setViewport(result.data.viewport);
                }
            }

            // Store initial state for change detection
            initialStateRef.current = JSON.stringify(result.data || {});
            setHasUnsavedChanges(false);

            console.log('[Canvas] Loaded:', result.name, 'v' + result.version);
        } catch (err) {
            console.error('[Canvas] Load failed:', err);
            setError(getErrorMessage(err));
            // Don't auto-redirect - let auth guard handle session issues
            // Just show the error to the user
        } finally {
            setLoading(false);
        }
    }, [setNodes, setEdges, setViewport]);

    /**
     * Save canvas to backend (manual save only)
     * Auto-creates a new canvas if no canvasId exists
     */
    const save = useCallback(async () => {
        setSaving(true);
        setError(null);

        try {
            const data = {
                viewport: getViewport(),
                nodes: getNodes(),
                edges: getEdges()
            };

            let canvasIdToSave = id;

            // If no canvas ID, auto-create one first
            if (!canvasIdToSave) {
                console.log('[Canvas] No ID - creating new canvas...');
                const createResult = await createCanvas(name);
                canvasIdToSave = createResult.canvasId;
                setId(canvasIdToSave);
                setName(createResult.name);

                // Update URL without page reload (using query param)
                const newUrl = `${window.location.pathname}?canvas=${canvasIdToSave}`;
                window.history.pushState({}, '', newUrl);
                console.log('[Canvas] Created canvas:', canvasIdToSave);
            }

            // Save to backend (include name for rename support)
            const result = await saveCanvas(canvasIdToSave, data, name);

            // Update version and state
            setVersion(result.version);
            setLastSavedAt(result.savedAt);
            setHasUnsavedChanges(false);
            initialStateRef.current = JSON.stringify(data);

            console.log('[Canvas] Saved to backend:', name, 'v' + result.version);
            return true;
        } catch (err) {
            console.error('[Canvas] Save failed:', err);
            setError(getErrorMessage(err));
            // Don't auto-redirect - let auth guard handle session issues
            return false;
        } finally {
            setSaving(false);
        }
    }, [id, name, getNodes, getEdges, getViewport]);

    /**
     * Create a new canvas
     */
    const create = useCallback(async (canvasName = 'Untitled Canvas') => {
        setLoading(true);
        setError(null);

        try {
            const result = await createCanvas(canvasName);

            setId(result.canvasId);
            setName(result.name);
            setVersion(0);
            setHasUnsavedChanges(false);

            // Clear canvas for new project
            setNodes([]);
            setEdges([]);
            initialStateRef.current = JSON.stringify({ nodes: [], edges: [], viewport: getViewport() });

            console.log('[Canvas] Created:', result.name);
            return result.canvasId;
        } catch (err) {
            console.error('[Canvas] Create failed:', err);
            setError(getErrorMessage(err));
            // Don't auto-redirect - let auth guard handle session issues
            return null;
        } finally {
            setLoading(false);
        }
    }, [setNodes, setEdges, getViewport]);

    /**
     * Mark canvas as having unsaved changes
     * Call this when nodes/edges/viewport change
     */
    const markDirty = useCallback(() => {
        if (!hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        }
    }, [hasUnsavedChanges]);

    /**
     * beforeunload handler for unsaved changes warning
     */
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    /**
     * Load canvas on mount
     * - If canvasId provided, load from backend
     * - Otherwise, try to restore from localStorage
     */
    useEffect(() => {
        if (canvasId) {
            load(canvasId);
        } else {
            // Try to restore from localStorage (local dev mode)
            try {
                const saved = localStorage.getItem('nexus_canvas_local');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.data) {
                        if (parsed.data.nodes) setNodes(parsed.data.nodes);
                        if (parsed.data.edges) setEdges(parsed.data.edges);
                        if (parsed.data.viewport) setViewport(parsed.data.viewport);
                        setName(parsed.name || 'Untitled Canvas');
                        setVersion(parsed.version || 0);
                        console.log('[Canvas] Restored from localStorage');
                    }
                }
            } catch (err) {
                console.log('[Canvas] No local save found');
            }
        }
    }, [canvasId, load, setNodes, setEdges, setViewport]);

    return {
        // State
        id,
        name,
        version,
        loading,
        saving,
        error,
        hasUnsavedChanges,
        lastSavedAt,

        // Actions
        load,
        save,
        create,
        markDirty,
        setName,
        clearError: () => setError(null)
    };
}
