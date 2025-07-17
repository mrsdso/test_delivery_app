import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.50.116:8000/api/statuses/';

export default function StatusSelectScreen({ navigation, route }: any) {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      const token = await AsyncStorage.getItem('access');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(API_URL, { headers });
      setStatuses(res.data);
      setLoading(false);
    };
    fetchStatuses();
  }, []);

  const handleSelect = (status: any) => {
    navigation.navigate('DeliveryForm', {
      ...route.params,
      status, // <--- имя должно совпадать с useState в DeliveryFormScreen
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181a', padding: 16 }}>
      <Text variant="titleLarge" style={{ color: '#fff', marginBottom: 16 }}>Выберите статус</Text>
      {loading ? <ActivityIndicator /> : statuses.map(status => (
        <TouchableOpacity
          key={status.id}
          onPress={() => handleSelect(status)}
          style={{
            backgroundColor: '#232326',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>{status.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
