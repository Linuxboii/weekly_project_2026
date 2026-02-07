import { useState, useEffect, useCallback } from 'react';
import { fetchProjects, transformProjectToNode } from '../api/projects';

/**
 * Hook to fetch and manage projects from the API
 */
export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjects = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchProjects();
            setProjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Transform projects to node format
    const projectNodes = projects.map(transformProjectToNode);

    // Group by category for sidebar
    const groupedProjects = {
        core: projectNodes.filter(p => p.type === 'core'),
        module: projectNodes.filter(p => p.type === 'module'),
        client: projectNodes.filter(p => p.type === 'client')
    };

    return {
        projects,
        projectNodes,
        groupedProjects,
        loading,
        error,
        refetch: loadProjects
    };
}
