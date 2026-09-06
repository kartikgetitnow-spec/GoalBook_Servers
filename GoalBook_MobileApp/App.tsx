import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { ToastProvider } from './src/components/common/Toast';
import { darkPaperTheme } from './src/constants/theme';
import { RootStackParamList } from './src/types/navigation';
import { sentry } from './src/services/monitoring/sentry';
import { vercelAnalytics } from './src/services/analytics/vercelAnalytics';

// Initialize monitoring and telemetry
sentry.init();
vercelAnalytics.init();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['goalbook://', 'https://goalbook.app'],
  config: {
    screens: {
      Auth: {
        path: 'auth',
        screens: {
          Welcome: 'welcome',
          Features: 'features',
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        path: 'main',
        screens: {
          Home: 'home',
          Library: 'library',
          AIChat: 'ai',
          Analytics: 'analytics',
          Settings: 'settings',
        },
      },
      Reader: {
        path: 'reader',
        screens: {
          ReaderMain: ':bookId',
          FontSettingsModal: 'font-settings',
          BookmarksModal: 'bookmarks/:bookId',
          AIChatModal: 'ai-modal/:bookId',
        },
      },
      AIHistory: 'history',
    },
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={darkPaperTheme}>
            <ErrorBoundary>
              <ToastProvider>
                <NavigationContainer linking={linking}>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NavigationContainer>
              </ToastProvider>
            </ErrorBoundary>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
