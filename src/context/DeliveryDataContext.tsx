import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeliveries } from '../api/deliveries';

interface DeliveryData {
  deliveries: any[];
  services: any[];
  packagings: any[];
  statuses: any[];
  techStates: any[];
  transportModels: any[];
}

interface DeliveryDataContextType {
  data: DeliveryData;
  setData: (data: DeliveryData) => void;
  updateDeliveryInCache: (updatedDelivery: any) => void;
  getDeliveryById: (id: number) => any;
  getCachedData: () => DeliveryData;
  refreshData: () => Promise<void>;
}

const DeliveryDataContext = createContext<DeliveryDataContextType | null>(null);

export const useDeliveryData = () => {
  const context = useContext(DeliveryDataContext);
  if (!context) {
    throw new Error('useDeliveryData must be used within a DeliveryDataProvider');
  }
  return context;
};

interface DeliveryDataProviderProps {
  children: ReactNode;
}

export const DeliveryDataProvider: React.FC<DeliveryDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<DeliveryData>({
    deliveries: [],
    services: [],
    packagings: [],
    statuses: [],
    techStates: [],
    transportModels: [],
  });

  const updateDeliveryInCache = (updatedDelivery: any) => {
    setData(prevData => ({
      ...prevData,
      deliveries: prevData.deliveries.map(delivery =>
        delivery.id === updatedDelivery.id ? updatedDelivery : delivery
      )
    }));
  };

  const getDeliveryById = (id: number) => {
    return data.deliveries.find(delivery => delivery.id === id);
  };

  const getCachedData = () => data;

  const refreshData = async () => {
    try {
      const token = await AsyncStorage.getItem('access');
      if (token) {
        const response = await getDeliveries();
        const deliveries = response.data || response;
        setData(prevData => ({
          ...prevData,
          deliveries
        }));
      }
    } catch (error) {
      console.error('[DeliveryDataContext] Error refreshing data:', error);
    }
  };

  return (
    <DeliveryDataContext.Provider value={{
      data,
      setData,
      updateDeliveryInCache,
      getDeliveryById,
      getCachedData,
      refreshData,
    }}>
      {children}
    </DeliveryDataContext.Provider>
  );
};
