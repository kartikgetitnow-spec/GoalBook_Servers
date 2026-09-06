import { registerUnauthorizedHandler, apiClient } from '../client';
import { secureStorage } from '../../storage/secureStorage';
import { APP_CONFIG } from '../../../constants/config';

describe('apiClient & Interceptors', () => {
  beforeEach(async () => {
    await secureStorage.deleteItem(APP_CONFIG.storageKeys.authToken);
    await secureStorage.deleteItem(APP_CONFIG.storageKeys.refreshToken);
    jest.clearAllMocks();
  });

  it('allows registering and unregistering unauthorized handlers', () => {
    const handler = jest.fn();
    const unsubscribe = registerUnauthorizedHandler(handler);

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('attaches Bearer token in request interceptor when available in secure storage', async () => {
    await secureStorage.setItem(APP_CONFIG.storageKeys.authToken, 'mock-jwt-token-12345');

    // Get the request interceptor function from apiClient
    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
    expect(requestInterceptor).toBeDefined();

    const initialConfig: any = { headers: {} };
    const modifiedConfig = await requestInterceptor(initialConfig);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer mock-jwt-token-12345');
  });

  it('does not attach Authorization header if no token is stored', async () => {
    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
    const initialConfig: any = { headers: {} };
    const modifiedConfig = await requestInterceptor(initialConfig);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('clears stored tokens and fires unauthorized handlers on 401 response', async () => {
    await secureStorage.setItem(APP_CONFIG.storageKeys.authToken, 'expired-token');
    await secureStorage.setItem(APP_CONFIG.storageKeys.refreshToken, 'refresh-token');

    const unauthorizedHandler = jest.fn();
    const unsubscribe = registerUnauthorizedHandler(unauthorizedHandler);

    const responseErrorInterceptor = (apiClient.interceptors.response as any).handlers[0]?.rejected;
    expect(responseErrorInterceptor).toBeDefined();

    const mock401Error = {
      response: {
        status: 401,
        data: { message: 'Token expired' },
      },
    };

    await expect(responseErrorInterceptor(mock401Error)).rejects.toEqual(mock401Error);

    // Verify token was purged
    const storedToken = await secureStorage.getItem(APP_CONFIG.storageKeys.authToken);
    expect(storedToken).toBeNull();

    // Verify unauthorized handler was called
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
