import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://185.23.236.113:8000/api/token/', {
        username,
        password,
      });
      // Для SimpleJWT: response.data.access, response.data.refresh
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      // Перенаправление на главную после входа
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError('Неверный логин или пароль');
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>Вход в систему</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}