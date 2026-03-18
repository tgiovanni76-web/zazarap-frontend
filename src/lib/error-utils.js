import { Base44Error } from '@base44/sdk';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

let lastToastSig = '';
let lastToastAt = 0;
const TOAST_DEDUP_WINDOW_MS = 2000;
const ENABLE_API_ERROR_ANALYTICS = true;

export function isNetworkError(err) {
  return !(err instanceof Base44Error);
}

export function mapErrorToUserMessage(err) {
  if (isNetworkError(err)) return 'Problema di connessione. Controlla la rete e riprova.';
  switch (err.status) {
    case 401:
      return 'Sessione scaduta. Effettua di nuovo l’accesso.';
    case 403:
      return 'Non hai i permessi per questa azione.';
    case 404:
      return 'Risorsa non trovata.';
    case 409:
      return 'Conflitto: la risorsa esiste già o è cambiata.';
    case 422:
      return 'Dati non validi. Controlla i campi.';
    case 429:
      return 'Troppe richieste. Riprova tra poco.';
    default:
      return 'Si è verificato un errore inatteso. Riprova.';
  }
}

export function handleAuthRedirectIfNeeded(err, nextUrl = window.location.href) {
  if (err instanceof Base44Error && err.status === 401) {
    // Usa il client già inizializzato del progetto
    base44.auth.redirectToLogin(nextUrl);
  }
}

export async function trackApiError(err, context = {}) {
  try {
    if (!ENABLE_API_ERROR_ANALYTICS) return;
    const props = {
      status: err instanceof Base44Error ? err.status : 'network',
      code: err?.code || null,
      message: err?.message?.slice(0, 200) || 'error',
      path: window.location.pathname,
      ...context,
    };
    await base44.analytics.track({ eventName: 'api_error', properties: props });
  } catch (_) {
    // non bloccare il flusso se l’analytics fallisce
  }
}

function shouldToast(signature) {
  const now = Date.now();
  if (lastToastSig === signature && now - lastToastAt < TOAST_DEDUP_WINDOW_MS) return false;
  lastToastSig = signature;
  lastToastAt = now;
  return true;
}

export function handleApiError(err, options = {}) {
  const { showToast = true, redirect = true, track = true, context } = options;
  if (redirect) handleAuthRedirectIfNeeded(err);
  if (track) trackApiError(err, context);
  const msg = mapErrorToUserMessage(err);
  const sig = `${err instanceof Base44Error ? err.status : 'network'}:${msg}`;
  if (showToast && shouldToast(sig)) toast.error(msg);
  return msg;
}