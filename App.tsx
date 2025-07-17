import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/theme';
import RootStack from './src/navigation/RootStack';
import { AuthProvider } from './src/context/AuthContext';
import { DeliveryDataProvider } from './src/context/DeliveryDataContext';
import TokenRefreshService from './src/services/TokenRefreshService';
import './src/api/axios.ts';

export default function App() {
  React.useEffect(() => {
    // Запускаем автоматическое обновление токенов
    TokenRefreshService.start();

    return () => {
      // Останавливаем при размонтировании приложения
      TokenRefreshService.stop();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <DeliveryDataProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </DeliveryDataProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
