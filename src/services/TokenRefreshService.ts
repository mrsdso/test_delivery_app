import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class TokenRefreshService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 60 * 1000; // 1 минута

  start() {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(async () => {
      await this.refreshToken();
    }, this.REFRESH_INTERVAL);

    console.log('[TokenRefreshService] Auto-refresh started (every 1 minute)');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[TokenRefreshService] Auto-refresh stopped');
    }
  }

  private async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh');
      if (!refreshToken) {
        console.log('[TokenRefreshService] No refresh token found, skipping refresh');
        return;
      }

      console.log('[TokenRefreshService] Refreshing access token...');
      const response = await axios.post('http://192.168.50.116:8000/api/token/refresh/', {
        refresh: refreshToken
      });

      const newAccessToken = response.data.access;
      await AsyncStorage.setItem('access', newAccessToken);
      
      console.log('[TokenRefreshService] Access token refreshed successfully');
    } catch (error: any) {
      console.error('[TokenRefreshService] Token refresh failed:', error.response?.data || error.message);
      
      // Если refresh token истек или невалиден, очищаем токены
      if (error.response?.status === 401) {
        console.log('[TokenRefreshService] Refresh token invalid, clearing tokens');
        await AsyncStorage.removeItem('access');
        await AsyncStorage.removeItem('refresh');
        this.stop(); // Останавливаем автообновление
      }
    }
  }

  async manualRefresh() {
    await this.refreshToken();
  }
}

export default new TokenRefreshService();
