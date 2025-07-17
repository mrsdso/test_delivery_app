import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Keyboard } from 'react-native';
import { Text, ActivityIndicator, TextInput, Button, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.50.116:8000/api/transport-models/';

// Предустановленные модели для демонстрации

export default function ModelSelectScreen({ navigation, route }: any) {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [number, setNumber] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = await AsyncStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(API_URL, { headers });
        setModels(res.data);
      } catch (error) {
        // В случае ошибки используем только предустановленные модели
        setModels([]);
      }
      setLoading(false);
    };
    fetchModels();
  }, []);

  const handleSave = () => {
    if (selectedModel && number) {
      navigation.navigate('DeliveryForm', {
        ...route.params,
        model: selectedModel,
        number,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#18181a' }}>
      {/* Заголовок */}
      <View style={{ paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 }}>
        <Text variant="titleLarge" style={{ color: '#fff', fontWeight: 'bold' }}>
          Модель и номер
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Секция моделей */}
        <Text style={{ color: '#aaa', marginBottom: 16, fontSize: 16 }}>МОДЕЛЬ</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            models.map(model => (
              <Chip
                key={model.id}
                selected={selectedModel?.id === model.id}
                onPress={() => setSelectedModel(model)}
                style={{
                  backgroundColor: selectedModel?.id === model.id ? '#90A4FF' : '#404046',
                  borderRadius: 8,
                }}
                textStyle={{
                  color: selectedModel?.id === model.id ? '#000' : '#fff',
                  fontWeight: selectedModel?.id === model.id ? 'bold' : 'normal',
                }}
              >
                {model.name}
              </Chip>
            ))
          )}
        </View>

        {/* Секция номера */}
        <Text style={{ color: '#aaa', marginBottom: 8, fontSize: 16 }}>— Номер —</Text>
        <TextInput
          value={number}
          onChangeText={setNumber}
          placeholder="V01"
          style={{
            backgroundColor: '#232326',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 24,
            textAlign: 'center',
          }}
          mode="outlined"
          outlineColor="transparent"
          activeOutlineColor="transparent"
          textColor="#fff"
          placeholderTextColor="#666"
          contentStyle={{
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        />
      </ScrollView>
      {/* Кнопка сохранить */}
      <View style={{ padding: 16 }}>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!selectedModel || !number}
          style={{ borderRadius: 24, backgroundColor: (!selectedModel || !number) ? '#555' : '#90A4FF' }}
        >
          Сохранить
        </Button>
      </View>
    </View>
  );
}