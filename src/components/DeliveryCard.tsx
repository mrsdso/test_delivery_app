import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useDeliveryData } from '../context/DeliveryDataContext';

type RootStackParamList = {
  DeliveryForm: { delivery?: any; onDelete?: () => void } | undefined;
};

type Props = {
  delivery: any;
  onDelete?: () => void;
};

export default function DeliveryCard({ delivery, onDelete }: Props) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { getCachedData } = useDeliveryData();
  
  // Получаем данные из кеша
  const { services, packagings, statuses, techStates, transportModels } = getCachedData();

  // Найти объекты по id
  const modelObj = transportModels.find(m => m.id === (delivery.transport_model?.id || delivery.transport_model));
  const serviceObj = services.find(s => s.id === (delivery.service?.id || delivery.service));
  const packagingObj = packagings.find(p => p.id === (delivery.packaging?.id || delivery.packaging));
  const statusObj = statuses.find(s => s.id === (delivery.status?.id || delivery.status));
  const techStateObj = techStates.find(t => t.id === (delivery.tech_state?.id || delivery.tech_state));

  // Гарантировать наличие created_by_name и comment
  const createdByName = delivery.created_by_name || '';
  const comment = delivery.comment || '';

  // Определяем цвета для статусов
  const getStatusColor = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'в ожидании':
      case 'ожидание':
        return '#ff9800';
      case 'проведено':
      case 'завершено':
        return '#4caf50';
      case 'отменено':
      case 'отмена':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getTechStateColor = (techStateName: string) => {
    switch (techStateName?.toLowerCase()) {
      case 'исправно':
      case 'рабочее':
        return '#4caf50';
      case 'неисправно':
      case 'сломано':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const handlePress = () => {
    navigation.navigate('DeliveryForm', { delivery, onDelete });
  };

  const isDeliveryConducted = statusObj?.name === 'Проведено' || statusObj?.name === 'Завершено';

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.surface }]} 
      onPress={handlePress} 
      activeOpacity={0.7}
    >
      {/* Заголовок с номером */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          №{delivery.id}
        </Text>
        <View style={styles.badgesContainer}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(statusObj?.name) }]}
            textStyle={styles.chipText}
            compact
          >
            {statusObj?.name || 'Неизвестно'}
          </Chip>
          <Chip
            style={[styles.techStateChip, { backgroundColor: getTechStateColor(techStateObj?.name) }]}
            textStyle={styles.chipText}
            compact
          >
            {techStateObj?.name || 'Исправно'}
          </Chip>
          {isDeliveryConducted && (
            <Chip
              style={[styles.conductedChip]}
              textStyle={styles.chipText}
              compact
              icon="lock"
            >
              Проведено
            </Chip>
          )}
        </View>
      </View>

      {/* Информация о транспорте */}
      <View style={styles.row}>
        <Icon name="car" color={theme.colors.onSurfaceVariant} size={16} />
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
          {modelObj ? modelObj.name : '—'}
          {delivery.vehicle_number ? `, ${delivery.vehicle_number}` : (delivery.number ? `, ${delivery.number}` : '')}
        </Text>
      </View>

      {/* Время и дистанция */}
      <View style={styles.row}>
        <Icon name="clock-outline" color={theme.colors.onSurfaceVariant} size={16} />
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
          {delivery.travel_time ?? '—'}
        </Text>
        <Icon name="truck-outline" color={theme.colors.onSurfaceVariant} size={16} style={{ marginLeft: 12 }} />
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
          {delivery.distance_km ? `${delivery.distance_km} км` : '—'}
        </Text>
      </View>

      {/* Услуга */}
      <View style={styles.row}>
        <Icon name="information-outline" color={theme.colors.onSurfaceVariant} size={16} />
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
          {serviceObj ? serviceObj.name : (delivery.service_name || '—')}
        </Text>
      </View>

      {/* Упаковка */}
      <View style={styles.row}>
        <Icon name="package-variant" color={theme.colors.onSurfaceVariant} size={16} />
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
          {packagingObj ? packagingObj.name : (delivery.packaging_name || '—')}
        </Text>
      </View>

      {/* Адрес доставки */}
      <View style={styles.row}>
        <Icon name="map-marker-outline" color={theme.colors.onSurfaceVariant} size={16} />
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
          {delivery.to_address || '—'}
        </Text>
      </View>

      {/* ФИО сборщика */}
      {createdByName ? (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Сборщик: {createdByName}
          </Text>
        </View>
      ) : null}

      {/* Комментарий */}
      {comment ? (
        <View style={{ marginTop: 4 }}>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            Комментарий: {comment}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    maxWidth: '65%',
  },
  statusChip: {
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  techStateChip: {
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conductedChip: {
    height: 28,
    borderRadius: 14,
    backgroundColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  info: {
    marginLeft: 6,
    marginRight: 8,
    fontSize: 14,
    flex: 1,
  },
  chip: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});