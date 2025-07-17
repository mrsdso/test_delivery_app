import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const response = await apiLogin(username.trim(), password);
      await login(response.data.access, response.data.refresh);
    } catch (e: any) {
      console.error('Login error:', e);
      if (e.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else if (e.response?.status >= 500) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else {
        setError('Ошибка подключения. Проверьте интернет.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Text variant="headlineLarge" style={[styles.logo, { color: theme.colors.primary }]}>
          DeliveryApp
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Управление доставками
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Логин"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          mode="outlined"
          disabled={loading}
        />
        <TextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          disabled={loading}
        />
        
        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        ) : null}

        <Button 
          mode="contained" 
          onPress={handleLogin}
          style={styles.loginButton}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});