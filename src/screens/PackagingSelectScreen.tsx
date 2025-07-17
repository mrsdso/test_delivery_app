import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://192.168.50.116:8000/api/packaging-types/';


export default function PackagingSelectScreen({ navigation, route }: any) {
  const [packagings, setPackagings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackaging, setSelectedPackaging] = useState<any>(null);

  useEffect(() => {
    const fetchPackagings = async () => {
      try {
        const token = await AsyncStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(API_URL, { headers });
        setPackagings(res.data);
      } catch (error) {
        setPackagings([]);
      }
      setLoading(false);
    };
    fetchPackagings();
  }, []);

  const handleSelect = (packaging: any) => {
    setSelectedPackaging(packaging);
    // Автоматически переходим назад после выбора
    setTimeout(() => {
      navigation.navigate('DeliveryForm', {
        ...route.params,
        packaging,
      });
    }, 200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#18181a' }}>
      {/* Заголовок */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={{ color: '#fff', fontWeight: 'bold', marginLeft: 16 }}>
          Упаковка
        </Text>
        <TouchableOpacity style={{ marginLeft: 'auto' }}>
          <Icon name="magnify" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {packagings.map(packaging => (
              <TouchableOpacity
                key={packaging.id}
                onPress={() => handleSelect(packaging)}
                style={{
                  width: '45%',
                  backgroundColor: selectedPackaging?.id === packaging.id ? '#90A4FF' : '#404046',
                  borderRadius: 12,
                  padding: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 100,
                }}
              >
                <Text 
                  style={{ 
                    color: selectedPackaging?.id === packaging.id ? '#000' : '#fff', 
                    fontSize: 16, 
                    textAlign: 'center',
                    fontWeight: selectedPackaging?.id === packaging.id ? 'bold' : 'normal',
                  }}
                >
                  {packaging.name}
                </Text>
                <Button 
                  mode="contained" 
                  compact
                  style={{ 
                    marginTop: 8, 
                    backgroundColor: selectedPackaging?.id === packaging.id ? '#000' : '#90A4FF' 
                  }}
                  labelStyle={{ 
                    color: selectedPackaging?.id === packaging.id ? '#90A4FF' : '#000',
                    fontSize: 12
                  }}
                >
                  Добавить
                </Button>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}