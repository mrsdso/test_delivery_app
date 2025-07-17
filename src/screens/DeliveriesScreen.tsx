import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { FAB, Text, Button, Portal, Modal, List, Chip, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeliveries } from '../api/deliveries';
import axios from 'axios';
import DeliveryCard from '../components/DeliveryCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDeliveryData } from '../context/DeliveryDataContext';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  DeliveriesScreen: undefined;
  DeliveryForm: { delivery?: any; onDelete?: () => Promise<void> } | undefined;
};

export default function DeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [packagings, setPackagings] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [techStates, setTechStates] = useState<any[]>([]);
  const [transportModels, setTransportModels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { setData } = useDeliveryData();
  const { checkTokenValidity } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('access');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [deliveriesRes, servicesRes, packagingsRes, statusesRes, techStatesRes, transportModelsRes] = await Promise.all([
        getDeliveries(),
        axios.get('http://192.168.50.116:8000/api/service-types/', { headers, timeout: 10000 }),
        axios.get('http://192.168.50.116:8000/api/packaging-types/', { headers, timeout: 10000 }),
        axios.get('http://192.168.50.116:8000/api/statuses/', { headers, timeout: 10000 }),
        axios.get('http://192.168.50.116:8000/api/tech-states/', { headers, timeout: 10000 }),
        axios.get('http://192.168.50.116:8000/api/transport-models/', { headers, timeout: 10000 }),
      ]);
      
      setDeliveries(deliveriesRes.data || []);
      setFilteredDeliveries(deliveriesRes.data || []);
      setServices(servicesRes.data || []);
      setPackagings(packagingsRes.data || []);
      setStatuses(statusesRes.data || []);
      setTechStates(techStatesRes.data || []);
      setTransportModels(transportModelsRes.data || []);
      
      // Обновляем кеш данных
      setData({
        deliveries: deliveriesRes.data || [],
        services: servicesRes.data || [],
        packagings: packagingsRes.data || [],
        statuses: statusesRes.data || [],
        techStates: techStatesRes.data || [],
        transportModels: transportModelsRes.data || [],
      });
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Превышено время ожидания. Проверьте подключение к интернету.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Ошибка сети. Проверьте подключение к интернету.');
      } else {
        setError('Ошибка загрузки данных. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Обновление списка при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      checkTokenValidity();
      fetchData();
    }, [fetchData, checkTokenValidity])
  );

  useEffect(() => {
    applyFilters();
  }, [deliveries, timeFilter, distanceFilter]);

  const applyFilters = () => {
    let filtered = [...deliveries];

    // Фильтр по времени в пути
    if (timeFilter !== 'all') {
      filtered = filtered.filter(delivery => {
        if (!delivery.travel_time) return false;
        
        // Парсим время в формате "HH:MM:SS"
        const timeParts = delivery.travel_time.split(':');
        const hours = parseInt(timeParts[0]) || 0;
        const minutes = parseInt(timeParts[1]) || 0;
        const totalMinutes = hours * 60 + minutes;
        
        switch (timeFilter) {
          case '1h': return totalMinutes <= 60;
          case '2h': return totalMinutes <= 120;
          case '4h': return totalMinutes <= 240;
          default: return true;
        }
      });
    }

    // Фильтр по дистанции
    if (distanceFilter !== 'all') {
      filtered = filtered.filter(delivery => {
        if (!delivery.distance_km) return false;
        const distance = parseFloat(delivery.distance_km);
        switch (distanceFilter) {
          case '100km': return distance <= 100;
          case '500km': return distance <= 500;
          case '1000km': return distance <= 1000;
          default: return true;
        }
      });
    }

    setFilteredDeliveries(filtered);
  };

  const refreshDeliveries = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    await refreshDeliveries();
  }, [refreshDeliveries]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Загрузка доставок...
        </Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="wifi-off" size={64} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <Button 
          mode="contained" 
          onPress={fetchData}
          style={styles.retryButton}
        >
          Повторить
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Заголовок экрана */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Доставки
        </Text>
        <Icon name="magnify" size={24} color={theme.colors.onSurface} />
      </View>

      {/* Фильтры */}
      <View style={styles.filtersContainer}>
        <Button
          mode="outlined"
          onPress={() => setShowTimeFilter(true)}
          style={[styles.filterButton, { borderColor: theme.colors.outline }]}
          textColor={theme.colors.onSurface}
          icon="clock-outline"
          compact
        >
          {timeFilter === 'all' ? 'Время' : 
           timeFilter === '1h' ? '≤1ч' :
           timeFilter === '2h' ? '≤2ч' : '≤4ч'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setShowDistanceFilter(true)}
          style={[styles.filterButton, { borderColor: theme.colors.outline }]}
          textColor={theme.colors.onSurface}
          icon="truck-outline"
          compact
        >
          {distanceFilter === 'all' ? 'Дистанция' :
           distanceFilter === '100km' ? '≤100км' :
           distanceFilter === '500km' ? '≤500км' : '≤1000км'}
        </Button>
      </View>

      {/* Список доставок */}
      {filteredDeliveries.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Icon name="truck-delivery-outline" size={64} color={theme.colors.outline} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
            {deliveries.length === 0 ? 'Нет доставок' : 'Нет доставок по выбранным фильтрам'}
          </Text>
          {deliveries.length === 0 && (
            <Text style={[styles.emptySubtext, { color: theme.colors.outline }]}>
              Создайте первую доставку, нажав кнопку +
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDeliveries}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <DeliveryCard 
              delivery={item}
              onDelete={refreshDeliveries}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB для создания новой доставки */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('DeliveryForm', { onDelete: refreshDeliveries })}
      />

      {/* Модальные окна фильтров */}
      <Portal>
        <Modal 
          visible={showTimeFilter} 
          onDismiss={() => setShowTimeFilter(false)} 
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Фильтр по времени в пути
          </Text>
          <List.Item 
            title="Все время пути" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setTimeFilter('all'); setShowTimeFilter(false); }}
            left={props => timeFilter === 'all' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
          <List.Item 
            title="До 1 часа" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setTimeFilter('1h'); setShowTimeFilter(false); }}
            left={props => timeFilter === '1h' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
          <List.Item 
            title="До 2 часов" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setTimeFilter('2h'); setShowTimeFilter(false); }}
            left={props => timeFilter === '2h' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
          <List.Item 
            title="До 4 часов" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setTimeFilter('4h'); setShowTimeFilter(false); }}
            left={props => timeFilter === '4h' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
        </Modal>

        <Modal 
          visible={showDistanceFilter} 
          onDismiss={() => setShowDistanceFilter(false)} 
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Фильтр по дистанции
          </Text>
          <List.Item 
            title="Все дистанции" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setDistanceFilter('all'); setShowDistanceFilter(false); }}
            left={props => distanceFilter === 'all' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
          <List.Item 
            title="До 100 км" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setDistanceFilter('100km'); setShowDistanceFilter(false); }}
            left={props => distanceFilter === '100km' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
          <List.Item 
            title="До 500 км" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setDistanceFilter('500km'); setShowDistanceFilter(false); }}
            left={props => distanceFilter === '500km' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
          <List.Item 
            title="До 1000 км" 
            titleStyle={{ color: theme.colors.onSurface }} 
            onPress={() => { setDistanceFilter('1000km'); setShowDistanceFilter(false); }}
            left={props => distanceFilter === '1000km' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    borderRadius: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100, // Место для FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 16,
  },
});