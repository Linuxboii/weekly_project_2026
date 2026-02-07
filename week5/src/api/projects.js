// API configuration
const API_BASE_URL = 'https://api.avlokai.com';

/**
 * Fetch all projects from the control API
 * @returns {Promise<Array>} Array of project objects
 */
export async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/control/projects`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const projects = await response.json();
        console.log('[API] Fetched', projects.length, 'projects');
        return projects;
    } catch (error) {
        console.error('[API] Failed to fetch projects:', error);
        return [];
    }
}

/**
 * Add a new project
 * @param {Object} project - Project data
 * @returns {Promise<Object|null>} Created project or null on error
 */
export async function addProject(project) {
    try {
        const response = await fetch(`${API_BASE_URL}/control/projects/add_new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const newProject = await response.json();
        console.log('[API] Added project:', newProject.name);
        return newProject;
    } catch (error) {
        console.error('[API] Failed to add project:', error);
        return null;
    }
}

/**
 * Transform API project to node format for the canvas
 * @param {Object} project - API project object
 * @returns {Object} Node-compatible object
 */
export function transformProjectToNode(project) {
    // Determine category based on planet or status
    const getCategoryFromPlanet = (planet) => {
        // Map planets to categories
        const planetCategories = {
            'sun': 'core',        // Central infrastructure
            'mercury': 'core',
            'venus': 'module',
            'earth': 'module',
            'mars': 'client',
            'jupiter': 'client',
            'saturn': 'client',
            'uranus': 'module',
            'neptune': 'module',
            'asteroid-belt': 'module'
        };
        return planetCategories[planet?.toLowerCase()] || 'client';
    };

    const category = getCategoryFromPlanet(project.planet);

    return {
        templateId: `project-${project.id}`,
        label: project.name,
        description: `${project.deployment_type || 'static'} deployment on ${project.planet || 'unknown'}`,
        type: category,
        category: {
            id: category,
            bgColor: category === 'core' ? 'bg-emerald-500' :
                category === 'module' ? 'bg-violet-500' : 'bg-amber-500'
        },
        status: {
            id: project.status || 'active',
            label: project.status === 'deprecated' ? 'Deprecated' :
                project.status === 'draft' ? 'Draft' : 'Active',
            bgColor: project.status === 'deprecated' ? 'bg-red-500/20' :
                project.status === 'draft' ? 'bg-gray-500/20' : 'bg-emerald-500/20',
            color: project.status === 'deprecated' ? 'text-red-400' :
                project.status === 'draft' ? 'text-gray-400' : 'text-emerald-400'
        },
        version: 'v1.0',
        reusability: project.auto_deploy ? 'global' : 'client',
        // Additional project metadata
        projectUrl: project.url,
        planet: project.planet,
        moonIndex: project.moon_index,
        slug: project.slug,
        deploymentType: project.deployment_type,
        autoDeploy: project.auto_deploy,
        lastDeployedAt: project.last_deployed_at,
        inputs: [
            { id: 'trigger', label: 'Trigger', type: 'event' }
        ],
        outputs: [
            { id: 'result', label: 'Result', type: 'data' }
        ]
    };
}

/**
 * Group projects by planet
 * @param {Array} projects - Array of project objects
 * @returns {Object} Projects grouped by planet
 */
export function groupProjectsByPlanet(projects) {
    return projects.reduce((groups, project) => {
        const planet = project.planet || 'unassigned';
        if (!groups[planet]) {
            groups[planet] = [];
        }
        groups[planet].push(project);
        return groups;
    }, {});
}
