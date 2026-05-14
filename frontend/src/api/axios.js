import axios from 'axios';

const api = axios.create({
  baseURL: 'http://ad68ae42d8a6e4292b5e298144039636-137496230.ap-south-1.elb.amazonaws.com:5000/api',
  withCredentials: true
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
