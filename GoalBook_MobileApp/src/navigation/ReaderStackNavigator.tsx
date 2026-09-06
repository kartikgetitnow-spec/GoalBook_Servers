import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReaderStackParamList } from './types';
import { ReaderScreen } from '../screens/dashboard/ReaderScreen';

const Stack = createNativeStackNavigator<ReaderStackParamList>();

export const ReaderStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ReaderMain"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="ReaderMain" component={ReaderScreen} />
    </Stack.Navigator>
  );
};
