import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';

export default function CollectorSelectScreen({ navigation, route }: any) {
  const [name, setName] = useState(route.params?.collector?.name ?? '');

  const handleSave = () => {
    // Если редактируем существующую доставку - возвращаемся к её редактированию
    // Иначе - переходим к созданию новой доставки
    const targetScreen = route.params?.isEditing ? 'DeliveryForm' : 'DeliveryForm';
    
    navigation.navigate(targetScreen, {
      ...route.params,
      collector: { name },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181a', padding: 16 }}>
      <Text variant="titleLarge" style={{ color: '#fff', marginBottom: 16 }}>
        ФИО сборщика
      </Text>
      <TextInput
        label="ФИО"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 16, backgroundColor: '#232326' }}
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!name}
      >
        Сохранить
      </Button>
    </ScrollView>
  );
}