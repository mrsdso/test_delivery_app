import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

export default function MediaFileSelectScreen({ navigation, route }: any) {
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    setLoading(true);
    const result = await DocumentPicker.getDocumentAsync({});
    setLoading(false);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      navigation.navigate('DeliveryForm', {
        ...route.params,
        mediaFile: result.assets[0], // <--- имя должно совпадать с useState
      });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181a', padding: 16 }}>
      <Text variant="titleLarge" style={{ color: '#fff', marginBottom: 16 }}>Выберите медиафайл</Text>
      <TouchableOpacity
        onPress={pickFile}
        style={{
          backgroundColor: '#232326',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Открыть файловый менеджер</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator />}
    </ScrollView>
  );
}