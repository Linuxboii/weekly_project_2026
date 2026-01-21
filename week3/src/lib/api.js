import axios from 'axios';

const BASE_URL = 'https://api.avlokai.com';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Dispatch a custom event to handle logout centrally
            window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
    }
);

export const api = {
    async login(email, password) {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data; // Expected { token: "..." }
    },

    async signup(email, password) {
        // Strict adherence: Only email and password. No role.
        try {
            const response = await apiClient.post('/auth/add_user', { email, password });
            return response.data;
        } catch (error) {
            // Re-throw to be handled by component, but ensure error.response is preserved
            throw error;
        }
    },

    async getGoals() {
        const response = await apiClient.get('/goals');
        return response.data;
    },

    /**
     * Get hydrated goals for Dashboard (current user's goals only)
     * Returns goals with counter_value, counter_target, and username
     */
    async getHydratedGoalsMe() {
        const response = await apiClient.get('/goals/hydrated/me');
        return response.data;
    },

    /**
     * Get hydrated goals for People page (all users' goals)
     * Returns goals with counter_value, counter_target, and username
     */
    async getHydratedGoals() {
        const response = await apiClient.get('/goals/hydrated');
        return response.data;
    },

    async createGoal(title, description) {
        // Description is optional, but API expects it if provided
        const payload = { title };
        if (description) payload.description = description;

        const response = await apiClient.post('/goals', payload);
        return response.data;
    },

    async updateGoal(goalId, data) {
        // data: { title: string, description: string(optional) }
        const response = await apiClient.put(`/goals/${goalId}`, data);
        return response.data;
    },

    async completeGoal(goalId) {
        const response = await apiClient.post(`/goals/${goalId}/complete`);
        return response.data;
    },

    async getCompletedTasks() {
        const response = await apiClient.get('/completed_tasks');
        return response.data;
    },

    async incrementGoalCounter(goalId) {
        const response = await apiClient.post(`/goals/${goalId}/counter/increment`);
        return response.data; // Expected { value: number }
    },

    async decrementGoalCounter(goalId) {
        const response = await apiClient.post(`/goals/${goalId}/counter/decrement`);
        return response.data; // Expected { value: number }
    },

    async setGoalCounter(goalId, value) {
        const response = await apiClient.put(`/goals/${goalId}/counter`, { value });
        return response.data; // Expected { value: number }
    },

    /**
     * Update user profile (username and/or display_name)
     * Uses PUT /users/me/profile - handles both create and update (UPSERT)
     * @param {Object} data - { username?: string, display_name?: string }
     * @returns {Promise<Object>} Profile data with user_id, username, display_name, timestamps
     */
    async updateUserProfile(data) {
        const response = await apiClient.put('/users/me/profile', data);
        return response.data;
    },

    /**
     * Get current user's profile
     * @returns {Promise<Object|null>} Profile data or null if not found
     */
    async getUserProfile() {
        try {
            const response = await apiClient.get('/users/me/profile');
            return response.data;
        } catch (err) {
            // Return null for 404 (no profile exists yet) - this is expected for new users
            if (err.response?.status === 404) {
                return null;
            }
            throw err;
        }
    },

    /**
     * Get a user's profile by their user ID
     * @param {number|string} userId - The user ID
     * @returns {Promise<Object|null>} Profile data or null if not found
     */
    async getUserProfileById(userId) {
        try {
            const response = await apiClient.get(`/users/${userId}/profile`);
            return response.data;
        } catch (err) {
            // Return null for 404 (profile not found)
            if (err.response?.status === 404) {
                return null;
            }
            return null; // Silently fail for other errors
        }
    },

    logout() {
        localStorage.removeItem('auth_token');
    }
};
