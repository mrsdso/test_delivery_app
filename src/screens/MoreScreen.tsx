import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, List, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MoreScreen() {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Заголовок экрана */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          Еще
        </Text>
      </View>

      {/* Список опций */}
      <View style={styles.content}>
        <List.Section>
          <List.Item
            title="Настройки"
            description="Настройки приложения"
            left={props => <List.Icon {...props} icon="cog" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Здесь можно добавить навигацию к настройкам
            }}
            style={styles.listItem}
          />
          
          <List.Item
            title="О приложении"
            description="Информация о приложении"
            left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Здесь можно добавить навигацию к информации о приложении
            }}
            style={styles.listItem}
          />

          <List.Item
            title="Помощь"
            description="Справка и поддержка"
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Здесь можно добавить навигацию к помощи
            }}
            style={styles.listItem}
          />
        </List.Section>
      </View>

      {/* Кнопка выхода */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
          icon="logout"
          loading={loading}
          disabled={loading}
        >
          Выйти из аккаунта
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
  listItem: {
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  logoutButton: {
    paddingVertical: 8,
  },
});