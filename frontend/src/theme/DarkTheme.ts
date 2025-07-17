import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4f378b' }, // Цвета под Material 3
    secondary: { main: '#03dac6' },
    background: {
      default: '#1a1a1a',
      paper: '#232323',
    },
  },
  // Material 3 типографика и закругления
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default darkTheme;