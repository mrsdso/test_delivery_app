import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, List, Divider, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteDelivery, updateDelivery, createDelivery } from '../api/deliveries';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useDeliveryData } from '../context/DeliveryDataContext';

const API_URL = 'http://192.168.50.116:8000/api';

export default function DeliveryFormScreen({ navigation, route }: any) {
  // Добавляем защиту от undefined route
  if (!route || !navigation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181a' }}>
        <Text style={{ color: '#fff' }}>Ошибка навигации</Text>
      </View>
    );
  }

  const delivery = route.params?.delivery;
  const { getCachedData, getDeliveryById, updateDeliveryInCache } = useDeliveryData();

  // Получаем данные из кеша
  const cachedData = getCachedData();
  const [models, setModels] = useState<any[]>(cachedData.transportModels);
  const [services, setServices] = useState<any[]>(cachedData.services);
  const [packagings, setPackagings] = useState<any[]>(cachedData.packagings);
  const [statuses, setStatuses] = useState<any[]>(cachedData.statuses);
  const [techStates, setTechStates] = useState<any[]>(cachedData.techStates);

  // Поля формы
  const [model, setModel] = useState(route.params?.model ?? null);
  const [number, setNumber] = useState(route.params?.number ?? '');
  const [service, setService] = useState(route.params?.service ?? null);
  const [packaging, setPackaging] = useState(route.params?.packaging ?? null);
  const [status, setStatus] = useState(route.params?.status ?? null);
  const [techState, setTechState] = useState(route.params?.techState ?? null);
  const [collector, setCollector] = useState(route.params?.collector ?? null);
  const [mediaFile, setMediaFile] = useState(route.params?.mediaFile ?? null);
  const [logFile, setLogFile] = useState(route.params?.logFile ?? null);
  const [comment, setComment] = useState(route.params?.comment ?? '');
  const [distance, setDistance] = useState('');
  const [from, setFrom] = useState(route.params?.from ?? null);
  const [to, setTo] = useState(route.params?.to ?? null);
  const [sendingTime, setSendingTime] = useState(route.params?.sendingTime ?? '');
  const [deliveryTime, setDeliveryTime] = useState(route.params?.deliveryTime ?? '');
  const [duration, setDuration] = useState(route.params?.duration ?? '');
  const [travelTime, setTravelTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Состояния ошибок для обязательных полей
  const [errors, setErrors] = useState<any>({});

  // Получаем актуальные данные о доставке из кеша, если это редактирование
  const currentDelivery = delivery ? getDeliveryById(delivery.id) || delivery : null;

  // Получение справочников
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const token = await AsyncStorage.getItem('access');
        if (!token) {
          setServerError('Токен авторизации не найден');
          return;
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        const [modelsRes, servicesRes, packagingsRes, statusesRes, techStatesRes] = await Promise.all([
          axios.get(`${API_URL}/transportmodels/`, { headers }),
          axios.get(`${API_URL}/services/`, { headers }),
          axios.get(`${API_URL}/packagings/`, { headers }),
          axios.get(`${API_URL}/statuses/`, { headers }),
          axios.get(`${API_URL}/techstates/`, { headers }),
        ]);
        setModels(modelsRes.data);
        setServices(servicesRes.data);
        setPackagings(packagingsRes.data);
        setStatuses(statusesRes.data);
        setTechStates(techStatesRes.data);
      } catch (error: any) {
        console.error('[DeliveryForm] Error fetching references:', error);
        setServerError('Ошибка загрузки справочников: ' + (error.message || error.toString()));
      }
    };
    fetchRefs();
  }, []);

  // Инициализация стейтов для редактирования
  useEffect(() => {
    // Проверяем, что это не возврат с экрана выбора (когда есть route.params)
    if (route?.params && Object.keys(route.params).some(key => key !== 'delivery')) {
      // Если есть параметры навигации (кроме delivery), не переинициализируем поля
      return;
    }

    if (currentDelivery && models.length && services.length && packagings.length && statuses.length && techStates.length) {
      console.log('[DeliveryForm] Initializing form with delivery data:', currentDelivery.id);
      setModel(models.find(m => m.id === currentDelivery.transport_model) || null);
      setNumber(currentDelivery.vehicle_number || currentDelivery.number || '');
      setService(services.find(s => s.id === currentDelivery.service) || null);
      setPackaging(packagings.find(p => p.id === currentDelivery.packaging) || null);
      setStatus(statuses.find(s => s.id === currentDelivery.status) || null);
      setTechState(techStates.find(t => t.id === currentDelivery.tech_state) || null);
      setDistance(String(currentDelivery.distance_km || ''));
      setFrom(currentDelivery.from_address || '');
      setTo(currentDelivery.to_address || '');
      setSendingTime(currentDelivery.send_time || '');
      setDeliveryTime(currentDelivery.delivery_time || '');
      setComment(currentDelivery.comment || '');
      
      // Парсим travel_time из формата "HH:MM:SS" в минуты
      if (currentDelivery.travel_time) {
        const timeParts = currentDelivery.travel_time.split(':');
        const hours = parseInt(timeParts[0]) || 0;
        const minutes = parseInt(timeParts[1]) || 0;
        const totalMinutes = hours * 60 + minutes;
        setTravelTime(String(totalMinutes));
      }
    } else if (!currentDelivery && (!route?.params || Object.keys(route.params).length === 0)) {
      // Сброс полей только для новой доставки БЕЗ параметров
      console.log('[DeliveryForm] Resetting form for new delivery');
      setModel(null);
      setNumber('');
      setService(null);
      setPackaging(null);
      setStatus(null);
      setTechState(null);
      setDistance('');
      setFrom('');
      setTo('');
      setSendingTime('');
      setDeliveryTime('');
      setComment('');
      setTravelTime('');
    }
  }, [currentDelivery?.id, models, services, packagings, statuses, techStates]);

  // Обработка выбора справочников через параметры навигации
  useFocusEffect(
    React.useCallback(() => {
      if (!route?.params) return;

      console.log('[DeliveryForm] Processing route params:', route.params);

      // Обрабатываем параметры без немедленной очистки
      let hasUpdates = false;

      if (route.params.model !== undefined) {
        console.log('[DeliveryForm] Updating model:', route.params.model);
        setModel(route.params.model);
        hasUpdates = true;
      }
      if (route.params.number !== undefined) {
        console.log('[DeliveryForm] Updating number:', route.params.number);
        setNumber(route.params.number);
        hasUpdates = true;
      }
      if (route.params.service !== undefined) {
        console.log('[DeliveryForm] Updating service:', route.params.service);
        setService(route.params.service);
        hasUpdates = true;
      }
      if (route.params.packaging !== undefined) {
        console.log('[DeliveryForm] Updating packaging:', route.params.packaging);
        setPackaging(route.params.packaging);
        hasUpdates = true;
      }
      if (route.params.status !== undefined) {
        console.log('[DeliveryForm] Updating status:', route.params.status);
        setStatus(route.params.status);
        hasUpdates = true;
      }
      if (route.params.techState !== undefined) {
        console.log('[DeliveryForm] Updating techState:', route.params.techState);
        setTechState(route.params.techState);
        hasUpdates = true;
      }
      if (route.params.collector !== undefined) {
        console.log('[DeliveryForm] Updating collector:', route.params.collector);
        setCollector(route.params.collector);
        hasUpdates = true;
      }
      if (route.params.mediaFile !== undefined) {
        console.log('[DeliveryForm] Updating mediaFile:', route.params.mediaFile);
        setMediaFile(route.params.mediaFile);
        hasUpdates = true;
      }
      if (route.params.logFile !== undefined) {
        console.log('[DeliveryForm] Updating logFile:', route.params.logFile);
        setLogFile(route.params.logFile);
        hasUpdates = true;
      }
      if (route.params.comment !== undefined) {
        console.log('[DeliveryForm] Updating comment:', route.params.comment);
        setComment(route.params.comment);
        hasUpdates = true;
      }
      if (route.params.from !== undefined || route.params.from_address !== undefined) {
        const fromValue = route.params.from || route.params.from_address;
        console.log('[DeliveryForm] Updating from:', fromValue);
        setFrom(fromValue);
        hasUpdates = true;
      }
      if (route.params.to !== undefined || route.params.to_address !== undefined) {
        const toValue = route.params.to || route.params.to_address;
        console.log('[DeliveryForm] Updating to:', toValue);
        setTo(toValue);
        hasUpdates = true;
      }
      if (route.params.sendingTime !== undefined) {
        console.log('[DeliveryForm] Updating sendingTime:', route.params.sendingTime);
        setSendingTime(route.params.sendingTime);
        hasUpdates = true;
      }
      if (route.params.deliveryTime !== undefined) {
        console.log('[DeliveryForm] Updating deliveryTime:', route.params.deliveryTime);
        setDeliveryTime(route.params.deliveryTime);
        hasUpdates = true;
      }
      if (route.params.duration !== undefined) {
        console.log('[DeliveryForm] Updating duration:', route.params.duration);
        setDuration(route.params.duration);
        hasUpdates = true;
      }
      if (route.params.distance !== undefined || route.params.distance_km !== undefined) {
        const distanceValue = String(route.params.distance || route.params.distance_km || '');
        console.log('[DeliveryForm] Updating distance:', distanceValue);
        setDistance(distanceValue);
        hasUpdates = true;
      }
      if (route.params.travelTime !== undefined) {
        console.log('[DeliveryForm] Updating travelTime:', route.params.travelTime);
        setTravelTime(String(route.params.travelTime || ''));
        hasUpdates = true;
      }

      // Очищаем только те параметры, которые были обработаны
      if (hasUpdates) {
        console.log('[DeliveryForm] Clearing processed route params');
        // Создаем объект только с теми параметрами, которые нужно очистить
        const paramsToReset: any = {};
        
        if (route.params.model !== undefined) paramsToReset.model = undefined;
        if (route.params.number !== undefined) paramsToReset.number = undefined;
        if (route.params.service !== undefined) paramsToReset.service = undefined;
        if (route.params.packaging !== undefined) paramsToReset.packaging = undefined;
        if (route.params.status !== undefined) paramsToReset.status = undefined;
        if (route.params.techState !== undefined) paramsToReset.techState = undefined;
        if (route.params.collector !== undefined) paramsToReset.collector = undefined;
        if (route.params.mediaFile !== undefined) paramsToReset.mediaFile = undefined;
        if (route.params.logFile !== undefined) paramsToReset.logFile = undefined;
        if (route.params.comment !== undefined) paramsToReset.comment = undefined;
        if (route.params.from !== undefined) paramsToReset.from = undefined;
        if (route.params.from_address !== undefined) paramsToReset.from_address = undefined;
        if (route.params.to !== undefined) paramsToReset.to = undefined;
        if (route.params.to_address !== undefined) paramsToReset.to_address = undefined;
        if (route.params.sendingTime !== undefined) paramsToReset.sendingTime = undefined;
        if (route.params.deliveryTime !== undefined) paramsToReset.deliveryTime = undefined;
        if (route.params.duration !== undefined) paramsToReset.duration = undefined;
        if (route.params.distance !== undefined) paramsToReset.distance = undefined;
        if (route.params.distance_km !== undefined) paramsToReset.distance_km = undefined;
        if (route.params.travelTime !== undefined) paramsToReset.travelTime = undefined;
        
        // Используем timeout чтобы состояние успело обновиться
        setTimeout(() => {
          navigation.setParams(paramsToReset);
        }, 50);
      }
    }, [route?.params, navigation])
  );

  // Функция для создания объекта со всеми данными формы
  const getFormData = () => ({
    model,
    number,
    service,
    packaging,
    status,
    techState,
    collector,
    mediaFile,
    logFile,
    comment,
    from,
    to,
    sendingTime,
    deliveryTime,
    duration,
    distance,
    travelTime,
    from_address: from,
    to_address: to,
    distance_km: distance,
    // Важно! Передаем информацию об изначальной доставке для редактирования
    delivery: currentDelivery,
    isEditing: !!currentDelivery,
  });

  // Сохранение доставки
  const handleSave = async () => {
    console.log('[DeliveryForm] handleSave called');
    console.log('[DeliveryForm] Current form state:', {
      model: model?.name,
      number,
      service: service?.name,
      packaging: packaging?.name,
      status: status?.name,
      techState: techState?.name,
      collector: collector?.name,
      from,
      to,
      sendingTime,
      deliveryTime,
    });
    
    // Проверка обязательных полей
    const newErrors: any = {};
    
    // Для модели проверяем либо состояние, либо данные из currentDelivery
    const hasModel = model || (currentDelivery && currentDelivery.transport_model);
    const hasNumber = number || (currentDelivery && currentDelivery.vehicle_number);
    const hasService = service || (currentDelivery && currentDelivery.service);
    const hasPackaging = packaging || (currentDelivery && currentDelivery.packaging);
    const hasStatus = status || (currentDelivery && currentDelivery.status);
    const hasTechState = techState || (currentDelivery && currentDelivery.tech_state);
    const hasFrom = from || (currentDelivery && currentDelivery.from_address);
    const hasTo = to || (currentDelivery && currentDelivery.to_address);
    const hasSendingTime = sendingTime || (currentDelivery && currentDelivery.send_time);
    const hasDeliveryTime = deliveryTime || (currentDelivery && currentDelivery.delivery_time);
    const hasCollector = collector || (currentDelivery && currentDelivery.created_by);
    
    if (!hasModel) newErrors.model = true;
    if (!hasNumber) newErrors.number = true;
    if (!hasService) newErrors.service = true;
    if (!hasPackaging) newErrors.packaging = true;
    if (!hasStatus) newErrors.status = true;
    if (!hasTechState) newErrors.techState = true;
    if (!hasFrom) newErrors.from = true;
    if (!hasTo) newErrors.to = true;
    if (!hasSendingTime) newErrors.sendingTime = true;
    if (!hasDeliveryTime) newErrors.deliveryTime = true;
    // Для новых доставок обязательно нужен сборщик
    if (!currentDelivery && !hasCollector) newErrors.collector = true;
    
    console.log('[DeliveryForm] Validation errors:', newErrors);
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log('[DeliveryForm] Validation failed, not saving');
      setServerError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Приведение distance_km к строке с числом
    let safeDistance = distance;
    if (!safeDistance || isNaN(Number(safeDistance))) safeDistance = '0';
    else safeDistance = String(Number(safeDistance));

    // Приведение дат к ISO-строке без миллисекунд
    function toIsoStringNoMs(val: any) {
      if (!val) return '';
      if (typeof val === 'string' && val.includes('T')) return val.split('.')[0];
      try {
        const d = new Date(val);
        return d.toISOString().split('.')[0];
      } catch {
        return val;
      }
    }

    // Конвертация travel_time из минут в формат "HH:MM:SS"
    let safeTravelTime = '';
    if (travelTime && !isNaN(Number(travelTime))) {
      const totalMinutes = parseInt(travelTime);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      safeTravelTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }

    // Все id только числа, если нет — не добавлять поле
    const safeModelId = model?.id || (currentDelivery?.transport_model ? Number(currentDelivery.transport_model) : undefined);
    const safeServiceId = service?.id || (currentDelivery?.service ? Number(currentDelivery.service) : undefined);
    const safePackagingId = packaging?.id || (currentDelivery?.packaging ? Number(currentDelivery.packaging) : undefined);
    const safeStatusId = status?.id || (currentDelivery?.status ? Number(currentDelivery.status) : undefined);
    const safeTechStateId = techState?.id || (currentDelivery?.tech_state ? Number(currentDelivery.tech_state) : undefined);
    const safeCollectorId = collector?.id || (currentDelivery?.created_by ? Number(currentDelivery.created_by) : undefined);
    
    // Безопасные значения с fallback
    const safeNumber = number || currentDelivery?.vehicle_number || '';
    const safeFrom = from || currentDelivery?.from_address || '';
    const safeTo = to || currentDelivery?.to_address || '';
    const safeSendTime = toIsoStringNoMs(sendingTime || currentDelivery?.send_time);
    const safeDeliveryTime = toIsoStringNoMs(deliveryTime || currentDelivery?.delivery_time);
    const safeComment = comment || currentDelivery?.comment || '';

    setLoading(true);
    const token = await AsyncStorage.getItem('access');
    const headers = { Authorization: `Bearer ${token}` };
    let payload: any;
    // Use FormData if files are present
    const hasFiles = !!mediaFile || !!logFile;
    if (hasFiles) {
      payload = new FormData();
      if (safeModelId !== undefined) payload.append('transport_model', safeModelId);
      payload.append('vehicle_number', safeNumber);
      if (safeServiceId !== undefined) payload.append('service', safeServiceId);
      if (safePackagingId !== undefined) payload.append('packaging', safePackagingId);
      if (safeStatusId !== undefined) payload.append('status', safeStatusId);
      if (safeTechStateId !== undefined) payload.append('tech_state', safeTechStateId);
      payload.append('distance_km', safeDistance);
      payload.append('from_address', safeFrom);
      payload.append('to_address', safeTo);
      payload.append('send_time', safeSendTime);
      payload.append('delivery_time', safeDeliveryTime);
      payload.append('comment', safeComment);
      if (safeTravelTime) payload.append('travel_time', safeTravelTime);
      // created_by только для новых доставок
      if (!currentDelivery && safeCollectorId !== undefined) {
        payload.append('created_by', safeCollectorId);
      }
      if (mediaFile) {
        payload.append('media_file', {
          uri: mediaFile.uri || mediaFile.path || mediaFile,
          name: mediaFile.name || 'media.pdf',
          type: mediaFile.type || 'application/pdf',
        });
      }
      if (logFile) {
        payload.append('log_file', {
          uri: logFile.uri || logFile.path || logFile,
          name: logFile.name || 'log.csv',
          type: logFile.type || 'text/csv',
        });
      }
    } else {
      payload = {
        ...(safeModelId !== undefined && { transport_model: safeModelId }),
        vehicle_number: safeNumber,
        ...(safeServiceId !== undefined && { service: safeServiceId }),
        ...(safePackagingId !== undefined && { packaging: safePackagingId }),
        ...(safeStatusId !== undefined && { status: safeStatusId }),
        ...(safeTechStateId !== undefined && { tech_state: safeTechStateId }),
        distance_km: safeDistance,
        from_address: safeFrom,
        to_address: safeTo,
        send_time: safeSendTime,
        delivery_time: safeDeliveryTime,
        comment: safeComment,
        ...(safeTravelTime && { travel_time: safeTravelTime }),
        // created_by только для новых доставок
        ...(!currentDelivery && safeCollectorId !== undefined && { created_by: safeCollectorId }),
      };
    }
    try {
      setServerError(null);
      console.log(`[DeliveryForm] Saving delivery. Current delivery:`, currentDelivery?.id);
      console.log(`[DeliveryForm] Payload:`, payload);
      
      let result;
      if (currentDelivery) {
        console.log(`[DeliveryForm] Updating delivery ${currentDelivery.id}`);
        result = await updateDelivery(currentDelivery.id, payload);
        
        // Обновляем кеш с новыми данными
        if (result?.data) {
          updateDeliveryInCache(result.data);
          console.log(`[DeliveryForm] Cache updated after edit`);
        }
        console.log(`[DeliveryForm] Update successful`);
      } else {
        console.log(`[DeliveryForm] Creating new delivery`);
        result = await createDelivery(payload, hasFiles);
        console.log(`[DeliveryForm] Create successful`);
      }
      
      // Возвращаемся к списку доставок всегда после сохранения
      if (route.params?.onSave) {
        route.params.onSave(result?.data);
      }
      
      // Всегда возвращаемся к списку доставок
      navigation.navigate('DeliveriesList');
    } catch (e: any) {
      console.error('[DeliveryForm] Save error:', e);
      
      let msg = 'Ошибка сохранения.';
      if (e.response && e.response.data) {
        if (typeof e.response.data === 'string') {
          msg = e.response.data;
        } else if (typeof e.response.data === 'object') {
          // Обрабатываем объект ошибок от Django
          const errors = e.response.data;
          if (errors.error) {
            msg = errors.error;
          } else {
            // Формируем сообщение из полей с ошибками
            const errorMessages = [];
            for (const [field, messages] of Object.entries(errors)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
              } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            }
            msg = errorMessages.length > 0 ? errorMessages.join('\n') : JSON.stringify(errors);
          }
        }
      } else if (e.message) {
        msg = e.message;
      }
      setServerError(msg);
    }
    setLoading(false);
  };

  // Удаление доставки
  const handleDelete = async () => {
    if (!currentDelivery) return;
    setLoading(true);
    try {
      await deleteDelivery(currentDelivery.id);
      // Если есть callback для обновления, вызвать его
      if (route.params?.onDelete) {
        route.params.onDelete(currentDelivery.id);
      }
      navigation.goBack();
    } catch (e: any) {
      console.error('[DeliveryForm] Delete error:', e);
      let msg = 'Ошибка удаления доставки.';
      if (e.response?.data) {
        if (typeof e.response.data === 'string') {
          msg = e.response.data;
        } else if (typeof e.response.data === 'object') {
          msg = JSON.stringify(e.response.data);
        }
      } else if (e.message) {
        msg = e.message;
      }
      setServerError(msg);
    }
    setLoading(false);
  };

  // Проведение доставки (изменение статуса на "Проведено")
  const handleConduct = async () => {
    if (!currentDelivery) return;
    setLoading(true);
    
    // Найдем статус "Проведено" в справочнике
    const conductedStatus = statuses.find(s => s.name === 'Проведено' || s.name === 'Завершено');
    if (!conductedStatus) {
      setServerError('Не найден статус "Проведено" в справочнике');
      setLoading(false);
      return;
    }
    
    // Конвертация travel_time из минут в формат "HH:MM:SS"
    let safeTravelTime = currentDelivery.travel_time;
    if (travelTime && !isNaN(Number(travelTime))) {
      const totalMinutes = parseInt(travelTime);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      safeTravelTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
    
    const payload = {
      transport_model: model?.id || currentDelivery.transport_model,
      vehicle_number: number || currentDelivery.vehicle_number,
      service: service?.id || currentDelivery.service,
      packaging: packaging?.id || currentDelivery.packaging,
      status: conductedStatus.id,
      tech_state: techState?.id || currentDelivery.tech_state,
      distance_km: distance || currentDelivery.distance_km,
      from_address: from || currentDelivery.from_address,
      to_address: to || currentDelivery.to_address,
      send_time: sendingTime || currentDelivery.send_time,
      delivery_time: deliveryTime || currentDelivery.delivery_time,
      comment: comment || currentDelivery.comment,
      ...(safeTravelTime && { travel_time: safeTravelTime }),
    };
    
    try {
      setServerError(null);
      const result = await updateDelivery(currentDelivery.id, payload);
      
      // Обновляем кеш
      if (result?.data) {
        updateDeliveryInCache(result.data);
      }
      
      // Обновляем локальные данные
      setStatus(conductedStatus);
      
      if (route.params?.onSave) {
        route.params.onSave(result?.data);
      }
      
      navigation.goBack();
    } catch (e: any) {
      console.error('[DeliveryForm] Conduct error:', e);
      let msg = 'Ошибка проведения доставки.';
      if (e.response?.data) {
        if (typeof e.response.data === 'string') {
          msg = e.response.data;
        } else if (typeof e.response.data === 'object') {
          msg = JSON.stringify(e.response.data);
        }
      } else if (e.message) {
        msg = e.message;
      }
      setServerError(msg);
    }
    setLoading(false);
  };

  // Распроведение доставки (изменение статуса обратно на "В ожидании")
  const handleUnconduct = async () => {
    if (!currentDelivery) return;
    setLoading(true);
    
    // Найдем статус "В ожидании" в справочнике
    const pendingStatus = statuses.find(s => s.name === 'В ожидании' || s.name === 'Ожидание');
    if (!pendingStatus) {
      setServerError('Не найден статус "В ожидании" в справочнике');
      setLoading(false);
      return;
    }
    
    // Конвертация travel_time из минут в формат "HH:MM:SS"
    let safeTravelTime = currentDelivery.travel_time;
    if (travelTime && !isNaN(Number(travelTime))) {
      const totalMinutes = parseInt(travelTime);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      safeTravelTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
    
    const payload = {
      transport_model: model?.id || currentDelivery.transport_model,
      vehicle_number: number || currentDelivery.vehicle_number,
      service: service?.id || currentDelivery.service,
      packaging: packaging?.id || currentDelivery.packaging,
      status: pendingStatus.id,
      tech_state: techState?.id || currentDelivery.tech_state,
      distance_km: distance || currentDelivery.distance_km,
      from_address: from || currentDelivery.from_address,
      to_address: to || currentDelivery.to_address,
      send_time: sendingTime || currentDelivery.send_time,
      delivery_time: deliveryTime || currentDelivery.delivery_time,
      comment: comment || currentDelivery.comment,
      ...(safeTravelTime && { travel_time: safeTravelTime }),
    };
    
    try {
      setServerError(null);
      const result = await updateDelivery(currentDelivery.id, payload);
      
      // Обновляем кеш
      if (result?.data) {
        updateDeliveryInCache(result.data);
      }
      
      // Обновляем локальные данные
      setStatus(pendingStatus);
      
      if (route.params?.onSave) {
        route.params.onSave(result?.data);
      }
      
      navigation.goBack();
    } catch (e: any) {
      console.error('[DeliveryForm] Unconduct error:', e);
      let msg = 'Ошибка распроведения доставки.';
      if (e.response?.data) {
        if (typeof e.response.data === 'string') {
          msg = e.response.data;
        } else if (typeof e.response.data === 'object') {
          msg = JSON.stringify(e.response.data);
        }
      } else if (e.message) {
        msg = e.message;
      }
      setServerError(msg);
    }
    setLoading(false);
  };

  // Функции для получения отображаемых значений
  const getDisplayValue = (currentValue: any, fallbackValue: any, defaultText: string) => {
    if (currentValue) return currentValue;
    if (fallbackValue) return fallbackValue;
    return defaultText;
  };

  const getModelDisplay = () => {
    if (model) return `${model.name}, ${number}`;
    if (currentDelivery && models.length) {
      const foundModel = models.find(m => m.id === currentDelivery.transport_model);
      return `${foundModel?.name || ''}, ${currentDelivery.vehicle_number || ''}`;
    }
    return 'Выберите модель';
  };

  const getTimeDisplay = () => {
    if (sendingTime && deliveryTime) return `${sendingTime} — ${deliveryTime}`;
    if (currentDelivery?.send_time && currentDelivery?.delivery_time) {
      return `${currentDelivery.send_time} — ${currentDelivery.delivery_time}`;
    }
    return 'Выберите время';
  };

  const getDistanceDisplay = () => {
    if (from && to) return `${from} → ${to}${distance ? `, ${distance} км` : ''}`;
    if (currentDelivery?.from_address && currentDelivery?.to_address) {
      return `${currentDelivery.from_address} → ${currentDelivery.to_address}`;
    }
    return 'Выберите адреса';
  };

  const getServiceDisplay = () => {
    if (service) return service.name;
    if (currentDelivery && services.length) {
      const foundService = services.find(s => s.id === currentDelivery.service);
      return foundService?.name || currentDelivery.service_name || '—';
    }
    return 'Выберите услугу';
  };

  const getStatusDisplay = () => {
    if (status) return status.name;
    if (currentDelivery && statuses.length) {
      const foundStatus = statuses.find(s => s.id === currentDelivery.status);
      return foundStatus?.name || currentDelivery.status_name || '—';
    }
    return 'Выберите статус';
  };

  const getPackagingDisplay = () => {
    if (packaging) return packaging.name;
    if (currentDelivery && packagings.length) {
      const foundPackaging = packagings.find(p => p.id === currentDelivery.packaging);
      return foundPackaging?.name || currentDelivery.packaging_name || '—';
    }
    return 'Выберите упаковку';
  };

  const getTechStateDisplay = () => {
    if (techState) return techState.name;
    if (currentDelivery && techStates.length) {
      const foundTechState = techStates.find(t => t.id === currentDelivery.tech_state);
      return foundTechState?.name || currentDelivery.tech_state_name || '—';
    }
    return 'Выберите состояние';
  };

  const getCollectorDisplay = () => {
    if (collector) return `${collector.name}${collector.role ? ', ' + collector.role : ''}`;
    if (currentDelivery?.created_by_name) return currentDelivery.created_by_name;
    return 'Выберите сборщика';
  };

  const getCommentDisplay = () => {
    if (comment) return comment;
    if (currentDelivery?.comment) return currentDelivery.comment;
    return 'Добавьте комментарий';
  };

  const getMediaFileDisplay = () => {
    if (mediaFile) return mediaFile.name || 'PDF-файл';
    if (currentDelivery?.media_file) return currentDelivery.media_file.split('/').pop() || 'PDF-файл';
    return 'Выберите файл';
  };

  const getLogFileDisplay = () => {
    if (logFile) return logFile.name || 'CSV-файл';
    if (currentDelivery?.log_file) return currentDelivery.log_file.split('/').pop() || 'CSV-файл';
    return 'Выберите файл';
  };

  // Проверяем, проведена ли доставка
  const isDeliveryConducted = () => {
    const currentStatus = status || statuses.find(s => s.id === currentDelivery?.status);
    return currentStatus?.name === 'Проведено' || currentStatus?.name === 'Завершено';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181a' }}>
      {serverError && (
        <View style={{ backgroundColor: '#ffdddd', padding: 12, margin: 12, borderRadius: 8 }}>
          <Text style={{ color: '#b71c1c' }}>{serverError}</Text>
        </View>
      )}
      {/* Заголовок экрана */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 }}>
        <Button onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#90A4FF', fontSize: 16 }}>←</Text>
        </Button>
        <Text variant="titleLarge" style={{ color: '#fff', fontWeight: 'bold' }}>
          {delivery ? `№${delivery.id}` : 'Новая доставка'}
        </Text>
        {currentDelivery && (
          <Button
            mode="text"
            onPress={handleSave} 
            style={{ marginLeft: 'auto' }}
            textColor="#90A4FF"
            disabled={loading}
          >
            Сохранить
          </Button>
        )}
      </View>

      <List.Subheader style={{ color: '#fff', marginTop: 16 }}>КУРЬЕР</List.Subheader>
      <List.Item
        title="Модель и номер"
        description={getModelDisplay()}
        descriptionStyle={errors.model || errors.number ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="car" color={errors.model || errors.number ? '#ff6b6b' : undefined} />}
        onPress={() => navigation.navigate('ModelSelect', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Время в пути"
        description={getTimeDisplay()}
        descriptionStyle={errors.sendingTime || errors.deliveryTime ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="clock-outline" color={errors.sendingTime || errors.deliveryTime ? '#ff6b6b' : undefined} />}
        onPress={() => navigation.navigate('TimeSelect', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Дистанция"
        description={getDistanceDisplay()}
        descriptionStyle={errors.from || errors.to ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="map-marker" color={errors.from || errors.to ? '#ff6b6b' : undefined} />}
        onPress={() => navigation.navigate('AddressSelect', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Медиафайл"
        description={getMediaFileDisplay()}
        left={props => <List.Icon {...props} icon="download" />}
        onPress={() => navigation.navigate('MediaFileSelect', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <Divider style={{ marginVertical: 8 }} />

      <List.Subheader style={{ color: '#fff' }}>СТАТУС</List.Subheader>
      <List.Item
        title="Услуга"
        description={getServiceDisplay()}
        descriptionStyle={errors.service ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="information-outline" color={errors.service ? '#ff6b6b' : '#fff'} />}
        onPress={() => navigation.navigate('ServiceSelect', { selected: service, ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Статус доставки"
        description={getStatusDisplay()}
        descriptionStyle={errors.status ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="progress-clock" color={errors.status ? '#ff6b6b' : '#fff'} />}
        onPress={() => navigation.navigate('StatusSelect', { selected: status, ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Упаковка"
        description={getPackagingDisplay()}
        descriptionStyle={errors.packaging ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="cube-outline" color={errors.packaging ? '#ff6b6b' : '#fff'} />}
        onPress={() => navigation.navigate('PackagingSelect', { selected: packaging, ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Тех. исправность"
        description={getTechStateDisplay()}
        descriptionStyle={errors.techState ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="cog-outline" color={errors.techState ? '#ff6b6b' : '#fff'} />}
        onPress={() => navigation.navigate('TechStateSelect', { selected: techState, ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Файл логирования"
        description={getLogFileDisplay()}
        left={props => <List.Icon {...props} icon="download" color="#fff" />}
        onPress={() => navigation.navigate('SelectLogFile', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <Divider style={{ marginVertical: 8 }} />

      <List.Subheader style={{ color: '#fff' }}>СБОРЩИК</List.Subheader>
      <List.Item
        title="ФИО"
        description={getCollectorDisplay()}
        descriptionStyle={errors.collector ? { color: '#ff6b6b' } : {}}
        left={props => <List.Icon {...props} icon="account" color={errors.collector ? '#ff6b6b' : undefined} />}
        onPress={() => navigation.navigate('CollectorSelect', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <List.Item
        title="Комментарий"
        description={getCommentDisplay()}
        left={props => <List.Icon {...props} icon="message-outline" />}
        onPress={() => navigation.navigate('CommentSelect', { ...getFormData() })}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />

      {/* Кнопки действий */}
      {currentDelivery ? (
        <View style={{ flexDirection: 'column', gap: 16, margin: 24 }}>
          {/* Проведение/Распроведение */}
          {isDeliveryConducted() ? (
            <Button
              mode="outlined"
              style={{ borderRadius: 24, borderColor: '#ff9800' }}
              textColor="#ff9800"
              onPress={handleUnconduct}
              disabled={loading}
              icon="undo"
            >
              Распровести
            </Button>
          ) : (
            <Button
              mode="contained"
              style={{ borderRadius: 24, backgroundColor: '#4caf50' }}
              onPress={handleConduct}
              disabled={loading}
              icon="check"
            >
              Провести
            </Button>
          )}
          
          {/* Удаление доставки - только если не проведена */}
          {!isDeliveryConducted() && (
            <Button
              mode="outlined"
              style={{ borderRadius: 24, borderColor: '#ff6b6b' }}
              textColor="#ff6b6b"
              onPress={handleDelete}
              disabled={loading}
              icon="delete"
            >
              Удалить
            </Button>
          )}
        </View>
      ) : (
        <Button
          mode="contained"
          style={{ margin: 24, borderRadius: 24, backgroundColor: '#90A4FF' }}
          onPress={() => {
            console.log('[DeliveryForm] Create button pressed!');
            handleSave();
          }}
          disabled={loading}
          icon="plus"
        >
          Создать
        </Button>
      )}
    </ScrollView>
  );
}