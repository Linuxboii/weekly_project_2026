/**
 * Dashboard Application
 * Modern interface for project selection - API driven
 */

// ============================================
// API CONFIGURATION
// ============================================
// Note: Using different name to avoid conflict with auth.js
const DASHBOARD_API_URL = 'https://api.avlokai.com';

// State
let projects = [];

// ============================================
// API FETCHING
// ============================================
async function fetchProjects() {
    try {
        console.log('[Dashboard] Fetching projects from API...');
        const res = await fetch(`${DASHBOARD_API_URL}/control/projects`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('[Dashboard] Fetched', data.length, 'projects');
        return data;
    } catch (err) {
        console.error('[Dashboard] Failed to fetch projects:', err);
        return [];
    }
}

// ============================================
// PROJECT TRANSFORMATION
// ============================================
function transformProjectsForDisplay(apiProjects) {
    // Show all projects regardless of moon_index
    return apiProjects
        // .filter(p => p.moon_index === null) 
        .map((p, index) => ({
            id: p.slug,
            title: p.name,
            description: `${p.status} • ${p.deployment_type}`,
            url: p.url || '#',
            status: p.status === 'live' ? 'Active' :
                p.status === 'paused' ? 'Paused' :
                    p.status === 'archived' ? 'Archived' : 'Unknown',
            isArchived: p.status === 'archived',
            icon: getProjectIcon(p.deployment_type),
            // Keep backend data for reference
            projectData: p
        }));
}

function getProjectIcon(deploymentType) {
    switch (deploymentType) {
        case 'vercel':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 22 20 2 20"/>
            </svg>`;
        case 'cloudflare':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10"/>
                <path d="M12 12h.5"/>
            </svg>`;
        case 'self_hosted':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="8" rx="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/>
                <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>`;
        case 'static':
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>`;
        default:
            return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>`;
    }
}

// DOM Elements
const projectsGrid = document.getElementById('projects-grid');

/**
 * Build project URL with auth token for cross-subdomain handoff
 */
function getProjectUrlWithToken(baseUrl) {
    const token = localStorage.getItem('auth_token');
    if (token && baseUrl !== '#') {
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}auth_token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
}

/**
 * Render project cards to the grid
 */
function renderProjects(projectList) {
    if (!projectsGrid) return;

    if (projectList.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; opacity: 0.6;">
                <p>No projects found</p>
                <p style="font-size: 12px;">Projects will appear here once configured in the backend.</p>
            </div>
        `;
        return;
    }

    projectsGrid.innerHTML = projectList.map(project => `
        <a href="${getProjectUrlWithToken(project.url)}" 
           class="project-card ${project.isArchived ? 'archived' : ''}" 
           target="_blank" 
           rel="noopener noreferrer"
           style="${project.isArchived ? 'opacity: 0.5;' : ''}">
            <div class="project-card-content">
                <div class="project-icon">
                    ${project.icon}
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <div class="project-status">
                        <span class="status-dot" style="background: ${project.status === 'Active' ? '#22c55e' :
            project.status === 'Paused' ? '#eab308' :
                '#6b7280'
        };"></span>
                        <span>${project.status}</span>
                    </div>
                </div>
            </div>
            <div class="project-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            </div>
        </a>
    `).join('');
}

// Make renderProjects globally available
window.renderProjects = renderProjects;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch projects from API
    const apiProjects = await fetchProjects();

    // Transform for display
    projects = transformProjectsForDisplay(apiProjects);

    // Render to UI
    renderProjects(projects);

    // Update global list for solar system modal
    window.projectsList = apiProjects.map(p => ({
        id: p.slug,
        name: p.name,
        description: `${p.planet || 'Project'} - ${p.status}`,
        url: p.url
    }));

    console.log('[Dashboard] Initialized with', projects.length, 'projects');
});
