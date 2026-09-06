import { sentry } from '../sentry';
import { vercelAnalytics } from '../../analytics/vercelAnalytics';
import { performanceMonitor } from '../../analytics/performance';

describe('Monitoring & Analytics Infrastructure', () => {
  beforeEach(() => {
    sentry.clearUser();
    performanceMonitor.clearMetrics();
  });

  describe('Sentry Service', () => {
    it('initializes and sets platform tags', () => {
      sentry.init();
      sentry.setTag('release', '1.0.0');
      const tags = sentry.getTags();
      expect(tags.release).toBe('1.0.0');
    });

    it('sets and clears user context', () => {
      sentry.setUser({ id: 'user-999', email: 'test@example.com' });
      expect(sentry.getCurrentUser()?.id).toBe('user-999');

      sentry.clearUser();
      expect(sentry.getCurrentUser()).toBeNull();
    });

    it('records and rotates breadcrumbs safely', () => {
      sentry.addBreadcrumb({
        category: 'navigation',
        message: 'Navigated to Reader',
      });

      const crumbs = sentry.getBreadcrumbs();
      expect(crumbs.length).toBeGreaterThan(0);
      expect(crumbs[crumbs.length - 1].message).toBe('Navigated to Reader');
    });

    it('captures errors safely without throwing', () => {
      expect(() => {
        sentry.captureException(new Error('Synthetic error'), { extra: 'info' });
        sentry.captureMessage('Informational notice', 'info');
      }).not.toThrow();
    });
  });

  describe('Vercel Analytics Service', () => {
    it('initializes and records events', () => {
      expect(() => {
        vercelAnalytics.init();
        vercelAnalytics.trackEvent('test_event', { key: 'value' });
      }).not.toThrow();
    });
  });

  describe('Performance Monitoring Service', () => {
    it('tracks synchronous trace durations and records metrics', () => {
      performanceMonitor.startTrace('test_render');
      const duration = performanceMonitor.stopTrace('test_render', { screen: 'Dashboard' });

      expect(duration).toBeGreaterThanOrEqual(0);
      const summary = performanceMonitor.getMetricsSummary();
      expect(summary.totalTraces).toBe(1);
      expect(summary.metrics[0].name).toBe('test_render');
    });

    it('measures asynchronous actions', async () => {
      const result = await performanceMonitor.measureAsync('async_op', async () => {
        return 42;
      });

      expect(result).toBe(42);
      const summary = performanceMonitor.getMetricsSummary();
      expect(summary.metrics.some((m) => m.name === 'async_op')).toBe(true);
    });
  });
});
