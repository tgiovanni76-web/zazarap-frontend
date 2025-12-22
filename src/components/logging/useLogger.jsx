import { base44 } from '@/api/base44Client';

export function useLogger() {
  const log = async (level, message, details = {}, context = {}) => {
    try {
      await base44.functions.invoke('logEvent', {
        level,
        message,
        details,
        context,
        path: typeof window !== 'undefined' ? window.location.pathname : ''
      });
    } catch (_) {
      // best effort
    }
  };

  return { logInfo: (m, d, c) => log('info', m, d, c), logWarn: (m, d, c) => log('warn', m, d, c), logError: (m, d, c) => log('error', m, d, c) };
}