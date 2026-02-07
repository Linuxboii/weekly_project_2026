// Canvas API client
// Backend base URL: https://backend.avlokai.com (or http://localhost:3567 in dev)

const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:3567'
    : 'https://backend.avlokai.com';

/**
 * Get auth token from localStorage
 * @returns {string|null} Session token or null
 */
function getAuthToken() {
    // Use auth_token key (same as auth.js)
    return localStorage.getItem('auth_token');
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw { status: 401, message: 'No auth token found' };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = { status: response.status };
        try {
            error.message = (await response.json()).error;
        } catch {
            error.message = response.statusText;
        }
        throw error;
    }

    return response.json();
}

/**
 * Create a new canvas
 * @param {string} name - Canvas name
 * @returns {Promise<{canvasId: string, name: string}>}
 */
export async function createCanvas(name) {
    return apiRequest('/api/canvas', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

/**
 * Load canvas by ID
 * @param {string} canvasId - Canvas ID
 * @returns {Promise<{canvasId: string, name: string, version: number, data: object}>}
 */
export async function loadCanvas(canvasId) {
    return apiRequest(`/api/canvas/${canvasId}`);
}

/**
 * Save canvas state (manual save only)
 * @param {string} canvasId - Canvas ID
 * @param {object} data - Canvas state {viewport, nodes, edges}
 * @returns {Promise<{canvasId: string, version: number, savedAt: string}>}
 */
export async function saveCanvas(canvasId, data) {
    return apiRequest(`/api/canvas/${canvasId}/save`, {
        method: 'POST',
        body: JSON.stringify({ data })
    });
}

/**
 * List all canvases for current user
 * @returns {Promise<Array<{canvasId: string, name: string, updatedAt: string}>>}
 */
export async function listCanvases() {
    return apiRequest('/api/canvas');
}

/**
 * Get version history for a canvas
 * @param {string} canvasId - Canvas ID
 * @returns {Promise<Array<{version: number, createdAt: string, isActive: boolean}>>}
 */
export async function getVersionHistory(canvasId) {
    return apiRequest(`/api/canvas/${canvasId}/versions`);
}

/**
 * Handle API errors and return user-friendly message
 * @param {object} error - Error object with status
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
    switch (error.status) {
        case 401:
            return 'Please log in to continue';
        case 403:
            return 'Session expired. Please log in again';
        case 404:
            return 'Canvas not found';
        case 500:
            return 'Server error. Please try again';
        default:
            return error.message || 'An error occurred';
    }
}

/**
 * Check if error requires redirect to login
 * @param {object} error - Error object with status
 * @returns {boolean}
 */
export function requiresLogin(error) {
    return error.status === 401 || error.status === 403;
}
