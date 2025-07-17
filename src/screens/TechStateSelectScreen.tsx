import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://192.168.50.116:8000/api/tech-states/';

// Предустановленные технические состояния

export default function TechStateSelectScreen({ navigation, route }: any) {
  const [techStates, setTechStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechState, setSelectedTechState] = useState<any>(route.params?.techState || null);

  useEffect(() => {
    // Получаем только с сервера
    const fetchTechStates = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(API_URL, { headers });
        setTechStates(res.data);
      } catch {
        setTechStates([]);
      }
      setLoading(false);
    };
    fetchTechStates();
  }, []);

  const handleSelect = (techState: any) => {
    setSelectedTechState(techState);
  };

  const handleApply = () => {
    navigation.navigate('DeliveryForm', {
      ...route.params,
      techState: selectedTechState,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#18181a' }}>
      {/* Заголовок */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        backgroundColor: '#1a1a1a',
        paddingTop: 50,
      }}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          textColor="#90A4FF"
        >
          <Text style={{ color: '#90A4FF', fontSize: 16 }}>←</Text>
        </Button>
        <Text variant="titleLarge" style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>
          Техническое состояние
        </Text>
      </View>

      {/* Описание */}
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#888', fontSize: 14 }}>
          Выберите техническое состояние транспорта
        </Text>
      </View>

      {/* Варианты выбора */}
      <View style={{ padding: 16, gap: 12 }}>
        {techStates.map((state) => (
          <TouchableOpacity
            key={state.id}
            onPress={() => handleSelect(state)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: selectedTechState?.id === state.id ? '#90A4FF20' : '#2a2a2a',
              borderRadius: 12,
              borderWidth: selectedTechState?.id === state.id ? 2 : 0,
              borderColor: '#90A4FF',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: state.id === 'working' ? '#4CAF50' : '#f44336',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Icon 
                name={state.icon} 
                size={24} 
                color="#fff" 
              />
            </View>
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontWeight: selectedTechState?.id === state.id ? 'bold' : 'normal' 
            }}>
              {state.name}
            </Text>
            {selectedTechState?.id === state.id && (
              <Icon 
                name="check" 
                size={20} 
                color="#90A4FF" 
                style={{ marginLeft: 'auto' }}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Кнопка применить */}
      <View style={{ padding: 16, marginTop: 'auto' }}>
        <Button
          mode="contained"
          onPress={handleApply}
          disabled={!selectedTechState}
          style={{ 
            borderRadius: 24, 
            backgroundColor: selectedTechState ? '#90A4FF' : '#555' 
          }}
        >
          Применить
        </Button>
      </View>
    </View>
  );
}
