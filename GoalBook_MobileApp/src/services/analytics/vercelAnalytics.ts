import { Platform } from 'react-native';
import { inject } from '@vercel/analytics';
import { APP_CONFIG } from '../../constants/config';
import { sentry } from '../monitoring/sentry';

class VercelAnalyticsService {
  private isInitialized = false;

  init(): void {
    if (this.isInitialized) return;

    if (Platform.OS === 'web') {
      try {
        inject({
          mode: APP_CONFIG.monitoring.environment === 'production' ? 'production' : 'development',
        });
        this.isInitialized = true;
        if (__DEV__) {
          console.log('[Vercel Analytics] Successfully injected for Web');
        }
      } catch (e) {
        console.warn('[Vercel Analytics] Web injection error:', e);
      }
    } else {
      // Native platforms log analytics events to local tracker & Sentry breadcrumbs
      this.isInitialized = true;
      if (__DEV__) {
        console.log(`[Vercel Analytics] Running in Native Bridge mode (${Platform.OS})`);
      }
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    sentry.addBreadcrumb({
      category: 'analytics',
      message: `Event: ${eventName}`,
      data: properties,
    });

    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).va) {
      try {
        (window as any).va('event', { name: eventName, data: properties });
      } catch (e) {
        console.warn('[Vercel Analytics] Event dispatch error:', e);
      }
    } else if (__DEV__) {
      console.log(`[Analytics Track: ${eventName}]`, properties || {});
    }
  }
}

export const vercelAnalytics = new VercelAnalyticsService();
