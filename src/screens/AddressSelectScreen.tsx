


import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AddressSelectScreen({ navigation, route }: any) {
  const [fromAddress, setFromAddress] = useState(route.params?.from_address || route.params?.from || '');
  const [toAddress, setToAddress] = useState(route.params?.to_address || route.params?.to || '');
  const [fromCoord, setFromCoord] = useState<{ latitude: number; longitude: number } | null>(route.params?.fromCoord || null);
  const [toCoord, setToCoord] = useState<{ latitude: number; longitude: number } | null>(route.params?.toCoord || null);
  const [distance, setDistance] = useState(route.params?.distance_km?.toString() || route.params?.distance || '');

  // Haversine formula for distance in km
  function getDistanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const aVal = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return (R * c).toFixed(2);
  }

  // При возврате с карты, обновлять координаты без сброса других значений
  useEffect(() => {
    if (route.params?.selectedCoord && route.params?.coordLabel) {
      const { selectedCoord, coordLabel } = route.params;
      
      if (coordLabel === 'from') {
        setFromCoord(selectedCoord);
        setFromAddress(`${selectedCoord.latitude?.toFixed(5)}, ${selectedCoord.longitude?.toFixed(5)}`);
      } else if (coordLabel === 'to') {
        setToCoord(selectedCoord);
        setToAddress(`${selectedCoord.latitude?.toFixed(5)}, ${selectedCoord.longitude?.toFixed(5)}`);
      }
    }
  }, [route.params?.selectedCoord, route.params?.coordLabel]);

  // Автоматически считать дистанцию, если обе точки выбраны
  useEffect(() => {
    if (fromCoord && toCoord) {
      setDistance(getDistanceKm(fromCoord, toCoord));
    }
  }, [fromCoord, toCoord]);

  const handleSelectCoord = (label: 'from' | 'to') => {
    navigation.navigate('MapSelectScreen', {
      ...route.params, // Передаем все существующие параметры
      initialCoord: label === 'from' ? fromCoord : toCoord,
      label,
      returnScreen: 'AddressSelect',
      // Также передаем текущие значения для сохранения состояния
      from_address: fromAddress,
      to_address: toAddress,
      distance_km: distance,
      fromCoord,
      toCoord,
    });
  };

  const handleSave = () => {
    navigation.navigate('DeliveryForm', {
      ...route.params,
      from: fromAddress,
      to: toAddress,
      distance: distance,
      fromCoord,
      toCoord,
      from_address: fromAddress,
      to_address: toAddress,
      distance_km: distance,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#18181a' }}>
      {/* Заголовок */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#90A4FF" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={{ color: '#fff', fontWeight: 'bold', marginLeft: 16 }}>
          Адреса и координаты
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Поля ввода адресов и координат */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TextInput
            label=""
            value={fromAddress}
            onChangeText={setFromAddress}
            placeholder="Откуда (адрес или координаты)"
            style={{ flex: 1, backgroundColor: '#232326', marginRight: 8 }}
            mode="outlined"
            outlineColor="#333"
            activeOutlineColor="#90A4FF"
            textColor="#fff"
            placeholderTextColor="#666"
          />
          <Button
            mode="outlined"
            onPress={() => handleSelectCoord('from')}
            icon="map-marker"
            style={{ borderColor: fromCoord ? '#4CAF50' : '#90A4FF', minWidth: 48 }}
          >
            {'Выбрать'}
          </Button>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TextInput
            label=""
            value={toAddress}
            onChangeText={setToAddress}
            placeholder="Куда (адрес или координаты)"
            style={{ flex: 1, backgroundColor: '#232326', marginRight: 8 }}
            mode="outlined"
            outlineColor="#333"
            activeOutlineColor="#90A4FF"
            textColor="#fff"
            placeholderTextColor="#666"
          />
          <Button
            mode="outlined"
            onPress={() => handleSelectCoord('to')}
            icon="map-marker"
            style={{ borderColor: toCoord ? '#4CAF50' : '#90A4FF', minWidth: 48 }}
          >
            {'Выбрать'}
          </Button>
        </View>

        <TextInput
          label=""
          value={distance}
          onChangeText={setDistance}
          placeholder="Дистанция (км)"
          keyboardType="numeric"
          style={{
            backgroundColor: '#232326',
            marginBottom: 24,
          }}
          mode="outlined"
          outlineColor="#333"
          activeOutlineColor="#90A4FF"
          textColor="#fff"
          placeholderTextColor="#666"
          editable={true}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={{
            backgroundColor: fromAddress && toAddress && distance ? '#4CAF50' : '#666',
            borderRadius: 8,
          }}
          labelStyle={{ color: '#fff' }}
          disabled={!(fromAddress && toAddress && distance)}
        >
          Применить
        </Button>
      </ScrollView>
    </View>
  );
}