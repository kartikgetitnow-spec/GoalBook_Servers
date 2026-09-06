import { executeOptimisticUpdate } from '../optimistic';

describe('optimistic updates engine', () => {
  it('applies optimistic UI update and returns result on success', async () => {
    let uiState = 'initial';
    const applyOptimistic = jest.fn(() => {
      uiState = 'optimistic';
    });
    const rollback = jest.fn(() => {
      uiState = 'initial';
    });
    const executeApi = jest.fn().mockResolvedValue({ status: 200, data: 'server-confirmed' });
    const onSuccess = jest.fn();

    const result = await executeOptimisticUpdate({
      applyOptimistic,
      rollback,
      executeApi,
      onSuccess,
    });

    expect(applyOptimistic).toHaveBeenCalledTimes(1);
    expect(uiState).toBe('optimistic');
    expect(executeApi).toHaveBeenCalledTimes(1);
    expect(rollback).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith({ status: 200, data: 'server-confirmed' });
    expect(result).toEqual({ status: 200, data: 'server-confirmed' });
  });

  it('rolls back UI state and invokes onError when API rejects', async () => {
    let uiState = 'initial';
    const applyOptimistic = jest.fn(() => {
      uiState = 'optimistic';
    });
    const rollback = jest.fn(() => {
      uiState = 'initial';
    });
    const apiError = new Error('Network timeout');
    const executeApi = jest.fn().mockRejectedValue(apiError);
    const onError = jest.fn();

    const result = await executeOptimisticUpdate({
      applyOptimistic,
      rollback,
      executeApi,
      onError,
    });

    expect(applyOptimistic).toHaveBeenCalledTimes(1);
    expect(executeApi).toHaveBeenCalledTimes(1);
    expect(rollback).toHaveBeenCalledTimes(1);
    expect(uiState).toBe('initial');
    expect(onError).toHaveBeenCalledWith(apiError);
    expect(result).toBeNull();
  });
});
