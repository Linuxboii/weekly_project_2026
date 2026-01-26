/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 * 
 * DATA FLOW:
 * Frontend → API (https://api.avlokai.com/api) → PostgreSQL
 * 
 * IMPORTANT: Chats are identified by conversation_id (numeric), NOT phone number.
 * The frontend is READ-ONLY with respect to chat creation.
 * All data comes from the backend API which reads from PostgreSQL.
 */

// Backend API base URL
const API_BASE_URL = 'https://backend.avlokai.com/api';

/**
 * Determine the correct login URL based on environment
 */
function getLoginUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/';
    }
    return 'https://login.avlokai.com/';
}

const LOGIN_URL = getLoginUrl();

/**
 * Get JWT token for API authentication
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        // If no token exists, we can't make authenticated requests
        // But we should let the call proceed so the backend returns 401
        // and triggers the redirect flow standardly
        console.warn('No auth token found in localStorage');
        throw new Error('Missing auth token');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

/**
 * Generic fetch wrapper with error handling
 * All API calls go through this function
 */
async function fetchWithAuth(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`[API] ${options.method || 'GET'} ${url}`);

    let headers;
    try {
        headers = {
            ...getAuthHeaders(),
            ...options.headers,
        };
    } catch (error) {
        // Immediate redirect if we know we have no token
        console.error('Auth error:', error.message);
        window.location.href = LOGIN_URL;
        return;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
        console.warn(`[API] Auth failed (${response.status}) - Redirecting to login`);
        localStorage.removeItem('auth_token');
        window.location.href = LOGIN_URL;
        return;
    }

    // Handle other errors
    if (!response.ok) {
        let message = 'An error occurred';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch {
            message = response.statusText || message;
        }
        throw { message, status: response.status };
    }

    // Return parsed JSON for successful responses
    if (response.status === 204) {
        return {};
    }

    return response.json();
}

/**
 * Fetch all conversations from the database
 */
export async function getConversations() {
    const conversations = await fetchWithAuth('/conversations');
    // Sort by conversation_id descending (highest/newest first)
    return conversations ? conversations.sort((a, b) => b.conversation_id - a.conversation_id) : [];
}

/**
 * Fetch messages for a specific conversation
 */
export async function getMessages(conversationId) {
    const messages = await fetchWithAuth(`/messages/${conversationId}`);
    // Sort by created_at ascending (oldest first, newest at bottom)
    return messages ? messages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) : [];
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(mobileNumber, content) {
    const payload = {
        mobile_number: mobileNumber,
        direction: 'OUT',
        content,
        source: 'frontend',
    };

    return fetchWithAuth('/messages/by-phone', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Fetch AI hold status for a conversation
 */
export async function getAiHoldStatus(conversationId) {
    return fetchWithAuth(`/conversations/${conversationId}/ai-hold-status`);
}

/**
 * Fetch detailed AI status for a conversation
 * This endpoint also triggers auto-re-enable of AI if hold time expired
 */
export async function getAiStatus(conversationId) {
    return fetchWithAuth(`/conversations/${conversationId}/ai-status`);
}


/**
 * Fetch messages formatted for AI context
 */
export async function getMessageContext(conversationId, limit = 20) {
    return fetchWithAuth(`/messages/${conversationId}/context?limit=${limit}`);
}

/**
 * Polling intervals for real-time updates
 */
export const POLLING_INTERVALS = {
    CONVERSATIONS: 5000,    // 5 seconds
    MESSAGES: 3000,         // 3 seconds
    AI_HOLD_STATUS: 1000,   // 1 second
};
