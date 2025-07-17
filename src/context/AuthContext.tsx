import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TokenRefreshService from '../services/TokenRefreshService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkTokenValidity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access');
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      
      // Если пользователь уже авторизован, запускаем автоматическое обновление токенов
      if (isAuth) {
        TokenRefreshService.start();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string, refreshToken: string) => {
    try {
      await AsyncStorage.setItem('access', accessToken);
      await AsyncStorage.setItem('refresh', refreshToken);
      setIsAuthenticated(true);
      
      // Запускаем автоматическое обновление токенов
      TokenRefreshService.start();
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  };

  const checkTokenValidity = async () => {
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Проверяем валидность токена через запрос к защищенному эндпоинту
      const response = await axios.get('http://192.168.50.116:8000/api/transport-models/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        setIsAuthenticated(true);
        TokenRefreshService.start(); // Запускаем сервис если токен валиден
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Токен недействителен, пытаемся обновить
        try {
          const refresh = await AsyncStorage.getItem('refresh');
          if (refresh) {
            const res = await axios.post('http://192.168.50.116:8000/api/token/refresh/', { refresh });
            await AsyncStorage.setItem('access', res.data.access);
            setIsAuthenticated(true);
            TokenRefreshService.start(); // Запускаем сервис после успешного обновления
          } else {
            await logout();
          }
        } catch (refreshError) {
          await logout();
        }
      }
    }
  };

  const logout = async () => {
    try {
      // Останавливаем автоматическое обновление токенов
      TokenRefreshService.stop();
      
      await AsyncStorage.removeItem('access');
      await AsyncStorage.removeItem('refresh');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing tokens:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkTokenValidity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
