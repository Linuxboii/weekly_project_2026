/**
 * Dashboard Application
 * Modern interface for project selection
 */

// Project configuration
const PROJECTS = [
    {
        id: 'week1',
        title: 'Week 1',
        description: 'File uploader with interactive particle background',
        url: 'https://week1.avlokai.com/', // Absolute URL for cross-subdomain
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>`,
        status: 'Active',
    },
    {
        id: 'week2',
        title: 'Week 2',
        description: 'This is Week 2',
        url: '#', // Current page
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`,
        status: 'Current',
    },
    {
        id: 'week3',
        title: 'Week 3',
        description: 'Goal & Habit Tracker with insights',
        url: 'https://tracker.avlokai.com/',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20V10"/>
            <path d="M18 20V4"/>
            <path d="M6 20v-4"/>
        </svg>`,
        status: 'Active',
    },
];

// Expose projects list globally for solar system modal
window.projectsList = PROJECTS.map(p => ({
    id: p.id,
    name: p.title,
    description: p.description,
    url: p.url
}));

// DOM Elements
const projectsGrid = document.getElementById('projects-grid');

/**
 * Build project URL with auth token for cross-subdomain handoff
 */
function getProjectUrlWithToken(baseUrl) {
    const token = localStorage.getItem('auth_token');
    if (token) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}auth_token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
}

/**
 * Render project cards to the grid
 */
function renderProjects() {
    if (!projectsGrid) return;

    projectsGrid.innerHTML = PROJECTS.map(project => `
        <a href="${getProjectUrlWithToken(project.url)}" class="project-card" target="_blank" rel="noopener noreferrer">
            <div class="project-card-content">
                <div class="project-icon">
                    ${project.icon}
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <div class="project-status">
                        <span class="status-dot"></span>
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
});
