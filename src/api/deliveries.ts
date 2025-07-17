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
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Попытаемся обновить токен
        const refreshToken = await AsyncStorage.getItem('refresh');
        if (refreshToken) {
          console.log('[API] Attempting to refresh token...');
          const refreshResponse = await axios.post('http://192.168.50.116:8000/api/token/refresh/', {
            refresh: refreshToken
          });
          
          const newAccessToken = refreshResponse.data.access;
          await AsyncStorage.setItem('access', newAccessToken);
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
      }
      
      // Если обновление не удалось, очищаем токены
      console.log('[API] Clearing tokens due to auth failure');
      await AsyncStorage.removeItem('access');
      await AsyncStorage.removeItem('refresh');
      
      // Можно добавить редирект на экран входа здесь, если нужно
    }
    return Promise.reject(error);
  }
);

export default api;

export async function getDeliveries() {
  return api.get('deliveries/');
}

export async function getDeliveryById(id: number) {
  try {
    console.log(`[API] Getting delivery ${id}`);
    const response = await api.get(`deliveries/${id}/`);
    console.log(`[API] Get delivery ${id} success:`, response.data);
    return response;
  } catch (error: any) {
    console.error(`[API] Get delivery ${id} error:`, error.response?.data || error.message);
    throw error;
  }
}

export async function deleteDelivery(id: number) {
  return api.delete(`deliveries/${id}/`);
}

export async function updateDelivery(id: number, data: any) {
  try {
    console.log(`[API] Updating delivery ${id} with data:`, data);
    const response = await api.put(`deliveries/${id}/`, data);
    console.log(`[API] Update delivery ${id} success:`, response.data);
    return response;
  } catch (error: any) {
    console.error(`[API] Update delivery ${id} error:`, error.response?.data || error.message);
    throw error;
  }
}

export async function createDelivery(data: any, isFormData = false) {
  try {
    console.log('[API] Creating delivery with data:', data);
    const config = isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : {};
    
    const response = await api.post('deliveries/', data, config);
    console.log('[API] Create delivery success:', response.data);
    return response;
  } catch (error: any) {
    console.error('[API] Create delivery error:', error.response?.data || error.message);
    throw error;
  }
}