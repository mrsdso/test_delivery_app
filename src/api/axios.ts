import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.50.116:8000/api/',
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refresh = await AsyncStorage.getItem('refresh');
        if (refresh) {
          const res = await axios.post('http://192.168.50.116:8000/api/token/refresh/', { refresh });
          const newAccessToken = res.data.access;
          
          await AsyncStorage.setItem('access', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          return api.request(originalRequest);
        }
      } catch (refreshError) {
        // Если refresh токен тоже недействителен, очищаем токены
        await AsyncStorage.removeItem('access');
        await AsyncStorage.removeItem('refresh');
        
        // Здесь можно добавить логику для перенаправления на экран логина
        console.log('Refresh token expired, redirecting to login...');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;