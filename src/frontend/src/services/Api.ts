import axios from 'axios';

const api = axios.create({


  baseURL: 'https://nutrivet-api-bbh8hwfagmcdb9a9.chilecentral-01.azurewebsites.net/api',


});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
