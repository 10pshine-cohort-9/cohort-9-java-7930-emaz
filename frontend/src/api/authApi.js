import axios from './axiosConfig';

export const register = (userData) => {
  return axios.post('/auth/register', userData);
};

export const login = (credentials) => {
  return axios.post('/auth/login', credentials);
};

export const getProfile = () => {
  return axios.get('/users/profile');
};

export const updateProfile = (userData) => {
  return axios.put('/users/profile', userData);
};

export const changePassword = (passwordData) => {
  return axios.post('/users/change-password', passwordData);
};

export const logout = () => {
  return axios.post('/users/logout');
};