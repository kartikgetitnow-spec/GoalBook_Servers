import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ReaderStackNavigator } from './ReaderStackNavigator';
import { AIHistoryScreen } from '../screens/ai/AIHistoryScreen';
import { ContactScreen } from '../screens/marketing/ContactScreen';
import { AboutScreen } from '../screens/marketing/AboutScreen';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator acts as the primary Route Protection Middleware:
 * - Automatically checks persisted session validity on application launch
 * - Prevents unauthenticated access to Main, Reader, and AI modals
 * - Reacts immediately to auto-logout on token expiration or 401 Unauthorized
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, checkAuthSession } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        await checkAuthSession();
      } catch (e) {
        console.warn('[RootNavigator] Auth session check error:', e);
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [checkAuthSession]);

  if (initializing) {
    return <LoadingSpinner message="Starting GoalBook..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isAuthenticated ? (
        // Unauthenticated Stack
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Protected Authenticated Stack
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Reader"
            component={ReaderStackNavigator}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="AIHistory"
            component={AIHistoryScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Contact"
            component={ContactScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ presentation: 'card' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
