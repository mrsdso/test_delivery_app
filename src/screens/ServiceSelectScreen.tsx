import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://192.168.50.116:8000/api/service-types/';

// Предустановленные услуги

export default function ServiceSelectScreen({ navigation, route }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = await AsyncStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(API_URL, { headers });
        setServices(res.data);
      } catch (error) {
        setServices([]);
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  const handleSelectService = (service: any) => {
    if (selectedService && selectedService.id === service.id) {
      setSelectedService(null);
    } else {
      setSelectedService(service);
    }
  };

  const handleSave = () => {
    if (selectedService) {
      navigation.navigate('DeliveryForm', {
        ...route.params,
        service: selectedService,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#18181a' }}>
      {/* Заголовок */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={{ color: '#fff', fontWeight: 'bold', marginLeft: 16 }}>
          Услуга
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
            {services.map(service => {
              const isSelected = selectedService && selectedService.id === service.id;
              const isSpecial = service.special;
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => handleSelectService(service)}
                  style={{
                    width: isSpecial ? '100%' : '45%',
                    backgroundColor: isSelected ? '#90A4FF' : '#404046',
                    borderRadius: 12,
                    padding: 20,
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    minHeight: 100,
                  }}
                >
                  <Text 
                    style={{ 
                      color: isSelected ? '#000' : '#fff', 
                      fontSize: 16, 
                      fontWeight: isSelected ? 'bold' : 'normal',
                      marginBottom: 8,
                    }}
                  >
                    {service.name}
                  </Text>
                  {service.positions && (
                    <Text style={{ color: isSelected ? '#333' : '#aaa', fontSize: 12 }}>
                      {service.positions} позиций
                    </Text>
                  )}
                  {isSpecial && (
                    <Button 
                      mode="contained" 
                      compact
                      style={{ 
                        marginTop: 8, 
                        backgroundColor: isSelected ? '#000' : '#90A4FF' 
                      }}
                      labelStyle={{ 
                        color: isSelected ? '#90A4FF' : '#000',
                        fontSize: 12
                      }}
                    >
                      Добавить
                    </Button>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      
      {selectedService && (
        <View style={{ padding: 16 }}>
          <Button 
            mode="contained" 
            onPress={handleSave}
            style={{ backgroundColor: '#90A4FF' }}
            labelStyle={{ color: '#000' }}
          >
            Выбрать
          </Button>
        </View>
      )}
    </View>
  );
}