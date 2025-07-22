import axios from 'axios'

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL
const API_URL = `${AUTH_API_BASE_URL}/login`
const API_URL_USER_DETAIL = `${AUTH_API_BASE_URL}/users/get-details`

export const UserService = {

  async login(email, password) {
    try {
      const response = await axios.post(API_URL, { email, password })
      if (response.status === 200 && response.data.token) {
        const token = response.data.token
        const userData = await axios.get(API_URL_USER_DETAIL, {
          headers: { Authorization: `Bearer ${token}` }
        })
        localStorage.setItem('authProfile', JSON.stringify(userData.data))
        localStorage.setItem('authToken', token) // Store the token in localStorage
        return token // Return the token if login is successful
      }
      throw new Error('Invalid login response')
    } catch (error) {
      console.error('Login failed:', error.message)
      throw error // Propagate the error for further handling
    }
  },

  async getRoleActions() {
    const data = localStorage.getItem('authProfile')
    return (JSON.parse(data).data.role.rol_actions).map(r_a => r_a.action.key)
  },

  async getAdminOrRoleActions(keyAction) {
    const role = (await this.getUserRol()).toLowerCase();
    if(role === 'admin') return true;
    let data = localStorage.getItem('authProfile')
    data = (JSON.parse(data).data.role.rol_actions).map(r_a => r_a.action.key);
    return data.includes(keyAction)
  },

  async getUserRol(){
    const data = localStorage.getItem('authProfile')
    return JSON.parse(data).data.role.id
  },

  async getRoles() {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${AUTH_API_BASE_URL}/roles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async validateMenu(menu) {
    let actionList = null;
    const role = (await this.getUserRol()).toLowerCase();
    if(role!== 'admin') { actionList = await this.getRoleActions();}

    const validateItem = (item) => {
      if(role === 'admin' || item.key === 'free') {
        item.visible = true; // Admin role has access to all items
        return;
      }
     
      if (item.key && !item.children && actionList.includes(item.key)) {
        item.visible = true;
      } else {
        if (item.children && Array.isArray(item.children)) {
          item.visible = true;
          item.children.forEach(validateItem); // Ensure children are properly iterated
        } else {
          item.visible = false;
          item.children = []; // Ensure children is always an array
        }
      }
    };

    menu.forEach(item => {
      validateItem(item);
    });

    return menu;
  },

  async getAllUsers() {

    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${AUTH_API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateUser({ id, fullname, active, email, role_id }) {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${AUTH_API_BASE_URL}/users/${id}`, {
      fullname, active, email, role_id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createUser({ email, fullname, password, role_id, company_id }) {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${AUTH_API_BASE_URL}/users`, {
      email, fullname, password, role_id, company_id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async resetPassword({ email, password, repeat_password }) {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${AUTH_API_BASE_URL}/reset/pwd`, {
      email, password, repeat_password
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}
