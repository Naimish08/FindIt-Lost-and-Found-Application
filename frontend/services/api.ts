import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Token management
export const tokenManager = {
  async setToken(token: string) {
    try {
      await AsyncStorage.setItem('@auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem('@auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

// Helper function to make authenticated API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await tokenManager.getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// Auth API calls
export const authAPI = {
  async register(username: string, email: string, password: string) {
    const response = await apiCall('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await apiCall('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getProfile() {
    const response = await apiCall('/api/users/profile');
    return response.json();
  },

  async logout() {
    await tokenManager.removeToken();
  },
};

// Items API calls
export const itemsAPI = {
  async getAll() {
    const response = await apiCall('/api/items');
    return response.json();
  },

  async getById(id: number) {
    const response = await apiCall(`/api/items/${id}`);
    return response.json();
  },

  async search(query: string) {
    const response = await apiCall(`/api/items/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  async create(description: string, location: string, images: string[] = []) {
    const response = await apiCall('/api/items', {
      method: 'POST',
      body: JSON.stringify({ description, location, images }),
    });
    return response.json();
  },
};

// Claims API calls
export const claimsAPI = {
  async submit(postID: number, claimDetails: string) {
    const response = await apiCall(`/api/claims/${postID}`, {
      method: 'POST',
      body: JSON.stringify({ claimDetails }),
    });
    return response.json();
  },

  async getByPost(postID: number) {
    const response = await apiCall(`/api/claims/post/${postID}`);
    return response.json();
  },

  async updateStatus(claimID: number, status: 'pending' | 'accepted' | 'rejected') {
    const response = await apiCall(`/api/claims/${claimID}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};

// Notifications API calls
export const notificationsAPI = {
  async getAll() {
    const response = await apiCall('/api/notifications');
    return response.json();
  },

  async create(message: string, status: string = 'unread') {
    const response = await apiCall('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ message, status }),
    });
    return response.json();
  },

  async markAsRead(notifID: number) {
    const response = await apiCall(`/api/notifications/${notifID}/read`, {
      method: 'PUT',
    });
    return response.json();
  },
};

export default { authAPI, itemsAPI, claimsAPI, notificationsAPI, tokenManager };
