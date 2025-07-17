import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DeliveriesStack from './DeliveriesStack';
import MapScreen from '../screens/MapScreen';
import MoreScreen from '../screens/MoreScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: '#90A4FF',
        tabBarInactiveTintColor: '#fff',
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Доставки') iconName = 'truck-delivery-outline';
          if (route.name === 'Карта') iconName = 'map-outline';
          if (route.name === 'Ещё') iconName = 'menu';
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Доставки" component={DeliveriesStack} />
      <Tab.Screen name="Карта" component={MapScreen} />
      <Tab.Screen name="Ещё" component={MoreScreen} />
    </Tab.Navigator>
  );
}