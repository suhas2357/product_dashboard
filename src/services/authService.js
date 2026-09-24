import axiosInstance from './api/axiosInstance.js';

export const loginUser = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};