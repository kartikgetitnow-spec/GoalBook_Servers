/**
 * Optimistic Updates Engine for GoalBook
 * Allows immediate UI updates with automatic rollback on network failure.
 */

export interface OptimisticActionOptions<TData, TResult = any> {
  applyOptimistic: () => void;
  rollback: () => void;
  executeApi: () => Promise<TResult>;
  onError?: (error: any) => void;
  onSuccess?: (result: TResult) => void;
}

export async function executeOptimisticUpdate<TData, TResult = any>(
  options: OptimisticActionOptions<TData, TResult>
): Promise<TResult | null> {
  // 1. Apply UI state change immediately
  options.applyOptimistic();

  try {
    // 2. Perform network/API operation
    const result = await options.executeApi();
    options.onSuccess?.(result);
    return result;
  } catch (error) {
    // 3. Rollback local state on error
    console.warn('[Optimistic Engine] Action failed, rolling back:', error);
    options.rollback();
    options.onError?.(error);
    return null;
  }
}
