import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import DeliveryFormScreen from '../screens/DeliveryFormScreen';
import ServiceSelectScreen from '../screens/ServiceSelectScreen';
import PackagingSelectScreen from '../screens/PackagingSelectScreen';
import ModelSelectScreen from '../screens/ModelSelectScreen';
import DeliveryMapScreen from '../screens/MapScreen';
import MapSelectScreen from '../screens/MapSelectScreen';
import AddressSelectScreen from '../screens/AddressSelectScreen';
import TimeSelectScreen from '../screens/TimeSelectScreen';
import MediaFileSelectScreen from '../screens/MediaFileSelectScreen';
import LogFileSelectScreen from '../screens/LogFileSelectScreen';
import CommentSelectScreen from '../screens/CommentSelectScreen';
import StatusSelectScreen from '../screens/StatusSelectScreen';
import TechStateSelectScreen from '../screens/TechStateSelectScreen';
import CollectorSelectScreen from '../screens/CollectorSelectScreen';

const Stack = createStackNavigator();

export default function DeliveriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeliveriesList" component={DeliveriesScreen} />
      <Stack.Screen name="DeliveryForm" component={DeliveryFormScreen} />
      <Stack.Screen name="ServiceSelect" component={ServiceSelectScreen} />
      <Stack.Screen name="PackagingSelect" component={PackagingSelectScreen} />
      <Stack.Screen name="ModelSelect" component={ModelSelectScreen} />
      <Stack.Screen name="DeliveryMap" component={DeliveryMapScreen} />
      <Stack.Screen name="AddressSelect" component={AddressSelectScreen} />
      <Stack.Screen name="MapSelectScreen" component={MapSelectScreen} />
      <Stack.Screen name="TimeSelect" component={TimeSelectScreen} />
      <Stack.Screen name="MediaFileSelect" component={MediaFileSelectScreen} />
      <Stack.Screen name="LogFileSelect" component={LogFileSelectScreen} />
      <Stack.Screen name="CommentSelect" component={CommentSelectScreen} />
      <Stack.Screen name="StatusSelect" component={StatusSelectScreen} />
      <Stack.Screen name="TechStateSelect" component={TechStateSelectScreen} />
      <Stack.Screen name="CollectorSelect" component={CollectorSelectScreen} />
    </Stack.Navigator>
  );
}