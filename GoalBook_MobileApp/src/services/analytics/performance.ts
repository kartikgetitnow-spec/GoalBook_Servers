import { sentry } from '../monitoring/sentry';
import { vercelAnalytics } from './vercelAnalytics';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'fps' | 'bytes' | 'count';
  timestamp: string;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private metrics: PerformanceMetric[] = [];

  startTrace(traceName: string): void {
    this.marks.set(traceName, Date.now());
  }

  stopTrace(traceName: string, tags?: Record<string, string>): number {
    const start = this.marks.get(traceName);
    if (!start) return 0;
    const duration = Date.now() - start;
    this.marks.delete(traceName);

    this.recordMetric({
      name: traceName,
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      tags,
    });

    if (__DEV__) {
      console.log(`[Performance] ${traceName} took ${duration}ms`, tags || '');
    }

    sentry.addBreadcrumb({
      category: 'performance',
      message: `Trace: ${traceName} (${duration}ms)`,
      data: { duration, ...tags },
    });

    return duration;
  }

  async measureAsync<T>(traceName: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    this.startTrace(traceName);
    try {
      return await fn();
    } finally {
      this.stopTrace(traceName, tags);
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    if (metric.value > 1000 && metric.unit === 'ms') {
      vercelAnalytics.trackEvent('slow_operation', {
        operation: metric.name,
        durationMs: metric.value,
      });
    }
  }

  getMetricsSummary(): {
    totalTraces: number;
    metrics: PerformanceMetric[];
    slowestTraces: PerformanceMetric[];
  } {
    const durationMetrics = this.metrics.filter((m) => m.unit === 'ms');
    const sorted = [...durationMetrics].sort((a, b) => b.value - a.value);

    return {
      totalTraces: this.metrics.length,
      metrics: [...this.metrics],
      slowestTraces: sorted.slice(0, 5),
    };
  }

  clearMetrics(): void {
    this.marks.clear();
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
