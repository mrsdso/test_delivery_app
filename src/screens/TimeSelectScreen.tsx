import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, List } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function formatDateTime(date: Date) {
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnly(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimeOnly(date: Date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDurationString(ms: number) {
  if (isNaN(ms) || ms < 0) return '';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ч ${minutes} мин`;
}

export default function TimeSelectScreen({ navigation, route }: any) {
  const [sendingDate, setSendingDate] = useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  const [showSendingDatePicker, setShowSendingDatePicker] = useState(false);
  const [showSendingTimePicker, setShowSendingTimePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [manualDuration, setManualDuration] = useState('');

  const durationMs = deliveryDate.getTime() - sendingDate.getTime();
  const autoDuration = getDurationString(durationMs);

  // Если пользователь не вводил вручную, показываем авто-расчет
  const displayDuration = manualDuration !== '' ? manualDuration : autoDuration;

  const handleSave = () => {
    navigation.navigate('DeliveryForm', {
      ...route.params,
      sendingTime: sendingDate.toISOString(),
      deliveryTime: deliveryDate.toISOString(),
      duration: displayDuration,
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
          Отправка и дос...
        </Text>
        <TouchableOpacity onPress={handleSave} style={{ marginLeft: 'auto' }}>
          <Text style={{ color: '#90A4FF', fontSize: 16 }}>Сохранить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Отправка */}
        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>ОТПРАВКА</Text>
        <View style={{ backgroundColor: '#232326', borderRadius: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowSendingDatePicker(true)}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 16, 
              borderBottomWidth: 1, 
              borderBottomColor: '#333' 
            }}
          >
            <View>
              <Text style={{ color: '#aaa', fontSize: 12 }}>ВЫБРАТЬ</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>Дата</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#90A4FF', fontSize: 16 }}>{formatDateOnly(sendingDate)}</Text>
              <Icon name="chevron-right" size={20} color="#90A4FF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowSendingTimePicker(true)}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 16 
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Время</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#90A4FF', fontSize: 16 }}>{formatTimeOnly(sendingDate)}</Text>
              <Icon name="chevron-right" size={20} color="#90A4FF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Доставка */}
        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>ДОСТАВКА</Text>
        <View style={{ backgroundColor: '#232326', borderRadius: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowDeliveryDatePicker(true)}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 16, 
              borderBottomWidth: 1, 
              borderBottomColor: '#333' 
            }}
          >
            <View>
              <Text style={{ color: '#aaa', fontSize: 12 }}>ВЫБРАТЬ</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>Дата</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#90A4FF', fontSize: 16 }}>{formatDateOnly(deliveryDate)}</Text>
              <Icon name="chevron-right" size={20} color="#90A4FF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowDeliveryTimePicker(true)}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 16 
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Время</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#90A4FF', fontSize: 16 }}>{formatTimeOnly(deliveryDate)}</Text>
              <Icon name="chevron-right" size={20} color="#90A4FF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Время в пути */}
        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>ВРЕМЯ В ПУТИ</Text>
        <View style={{ backgroundColor: '#232326', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>Время в пути рассчитывается автоматически, но вы можете ввести вручную</Text>
          <TextInput
            value={manualDuration}
            onChangeText={setManualDuration}
            placeholder={autoDuration}
            style={{ backgroundColor: 'transparent', textAlign: 'center', fontSize: 32 }}
            mode="flat"
            textColor="#fff"
            placeholderTextColor="#666"
            contentStyle={{ textAlign: 'center', fontSize: 32, fontWeight: 'bold' }}
          />
          {manualDuration === '' && (
            <Text style={{ color: '#90A4FF', textAlign: 'center', marginTop: 8, fontSize: 18 }}>{autoDuration}</Text>
          )}
        </View>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showSendingDatePicker && (
        <DateTimePicker
          value={sendingDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowSendingDatePicker(false);
            if (date) setSendingDate(date);
          }}
        />
      )}
      
      {showSendingTimePicker && (
        <DateTimePicker
          value={sendingDate}
          mode="time"
          display="default"
          onChange={(_, date) => {
            setShowSendingTimePicker(false);
            if (date) setSendingDate(date);
          }}
        />
      )}

      {showDeliveryDatePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDeliveryDatePicker(false);
            if (date) setDeliveryDate(date);
          }}
        />
      )}
      
      {showDeliveryTimePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="time"
          display="default"
          onChange={(_, date) => {
            setShowDeliveryTimePicker(false);
            if (date) setDeliveryDate(date);
          }}
        />
      )}
    </View>
  );
}