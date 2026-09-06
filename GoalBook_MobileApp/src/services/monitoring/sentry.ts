import { Platform } from 'react-native';
import { APP_CONFIG } from '../../constants/config';

export interface Breadcrumb {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
  timestamp?: number;
}

export interface UserContext {
  id: string;
  email?: string;
  username?: string;
}

class SentryService {
  private isInitialized = false;
  private breadcrumbs: Breadcrumb[] = [];
  private tags: Record<string, string> = {};
  private currentUser: UserContext | null = null;

  init(): void {
    const { sentryDsn, environment, enableSentry } = APP_CONFIG.monitoring;

    if (!enableSentry && !sentryDsn) {
      if (__DEV__) {
        console.log('[Sentry] Sentry disabled or DSN not provided; running in local mock mode.');
      }
      return;
    }

    try {
      this.isInitialized = true;
      this.setTag('platform', Platform.OS);
      this.setTag('app_version', APP_CONFIG.version);
      this.setTag('environment', environment);

      if (__DEV__) {
        console.log(`[Sentry] Initialized for ${Platform.OS} (${environment})`);
      }
    } catch (error) {
      console.warn('[Sentry] Failed to initialize:', error);
    }
  }

  captureException(error: Error | unknown, context?: Record<string, any>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (this.isInitialized) {
      // In production with Sentry native/web SDK loaded
      console.error('[Sentry Capture]', {
        message: errorMessage,
        stack: errorStack,
        context,
        user: this.currentUser,
        tags: this.tags,
        recentBreadcrumbs: this.breadcrumbs.slice(-5),
      });
    } else if (__DEV__) {
      console.warn('[Sentry (Local Mock)] Exception captured:', errorMessage, context);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (this.isInitialized) {
      console.log(`[Sentry Message - ${level.toUpperCase()}]`, message, {
        tags: this.tags,
        user: this.currentUser,
      });
    }
  }

  setUser(user: UserContext | null): void {
    this.currentUser = user;
    if (__DEV__) {
      console.log('[Sentry] User context set:', user?.id || 'null');
    }
  }

  clearUser(): void {
    this.currentUser = null;
  }

  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    const crumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
      level: breadcrumb.level || 'info',
    };
    this.breadcrumbs.push(crumb);
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift();
    }
  }

  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  getTags(): Record<string, string> {
    return { ...this.tags };
  }

  getCurrentUser(): UserContext | null {
    return this.currentUser;
  }
}

export const sentry = new SentryService();
