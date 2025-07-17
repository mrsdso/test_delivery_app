import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function CommentSelectScreen({ navigation, route }: any) {
  const [comment, setComment] = useState(route.params?.comment || '');

  const handleApply = () => {
    navigation.navigate('DeliveryForm', {
      ...route.params,
      comment,
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
          Комментарий
        </Text>
      </View>

      {/* Поле ввода */}
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>
          Добавьте комментарий к доставке
        </Text>
        
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Введите комментарий..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={6}
          style={{
            backgroundColor: '#2a2a2a',
            color: '#fff',
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            textAlignVertical: 'top',
            minHeight: 120,
          }}
        />
      </View>

      {/* Кнопка применить */}
      <View style={{ padding: 16 }}>
        <Button
          mode="contained"
          onPress={handleApply}
          style={{ 
            borderRadius: 24, 
            backgroundColor: '#90A4FF' 
          }}
        >
          Применить
        </Button>
      </View>
    </View>
  );
}