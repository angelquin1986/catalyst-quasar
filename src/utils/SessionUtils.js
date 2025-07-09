import axios from 'axios';
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL ;

export const SessionUtils = {
  async checkSession() {
    // Retrieve token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }
    try {
      // Make API call to validate session
      const response = await axios.get(`${AUTH_API_BASE_URL}/validate-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  },
  async isAuthenticated() {
    return await this.checkSession();
  },
  async logout() {
    // Clear token from localStorage
    localStorage.removeItem('authToken');
  }
};
