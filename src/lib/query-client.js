import { QueryClient } from '@tanstack/react-query';
import { handleApiError, isNetworkError } from '@/lib/error-utils';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Network puro → un singolo retry "soft"
        if (isNetworkError(error)) return failureCount < 1;
        const status = error?.status;
        if (status === 401 || status === 403) return false; // no retry su auth/permessi
        if ([404, 409, 422].includes(status)) return false; // errori client → no retry
        if (status === 429) return failureCount < 3; // rate limit → fino a 3
        if (status >= 500) return failureCount < 2; // 5xx → fino a 2
        return false;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt + Math.random() * 300, 30000),
      onError: (error, query) => {
        handleApiError(error, {
          showToast: true,
          redirect: true,
          track: true,
          context: { source: 'react-query:query', queryKey: JSON.stringify(query?.queryKey || []) },
        });
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isNetworkError(error)) return failureCount < 1;
        const status = error?.status;
        if (status === 429) return failureCount < 2; // un extra tentativo
        if (status >= 500) return failureCount < 1; // un retry su 5xx
        return false;
      },
      retryDelay: (attempt) => 1000 * (attempt + 1),
      onError: (error, _variables, _context, mutation) => {
        handleApiError(error, {
          showToast: true,
          redirect: true,
          track: true,
          context: { source: 'react-query:mutation', mutationKey: JSON.stringify(mutation?.options?.mutationKey || []) },
        });
      },
    },
  },
});