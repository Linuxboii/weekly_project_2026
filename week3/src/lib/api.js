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
            // Optional: Dispatch a custom event or callback to handle logout centrally
            // For now, we'll let the component/App handle the redirect based on the error
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

    logout() {
        localStorage.removeItem('auth_token');
    }
};



