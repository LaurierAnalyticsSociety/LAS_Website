import { createClient, FunctionsFetchError, FunctionsRelayError } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !publishableKey) {
  // Surfaced in the console during dev if the .env vars are missing.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Signup forms will fail until these are set in .env.',
  );
}

// Only construct a client when both values exist. An empty URL throws inside
// supabase-js and would take down the whole page on a build without env vars.
export const supabase =
  url && publishableKey
    ? createClient(url, publishableKey, { auth: { persistSession: false } })
    : null;

/**
 * Turns a functions.invoke error into a message for the user. Non-2xx
 * responses carry our function's own `{ error }` body; fetch/relay errors mean
 * the backend couldn't be reached at all (e.g. DNS failure, function not
 * deployed).
 */
async function invokeErrorMessage(error: unknown, unreachableMessage: string): Promise<string> {
  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
    console.error('[supabase] Edge Function unreachable:', error);
    return unreachableMessage;
  }
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const payload = (await ctx.json()) as { error?: string };
      if (payload?.error) return payload.error;
    } catch {
      // ignore parse errors, keep default message
    }
  }
  return 'Something went wrong. Please try again.';
}

export type SignupType = 'newsletter' | 'event';

export interface SubscribeResult {
  ok: boolean;
  stored?: boolean;
  already_subscribed?: boolean;
  email_sent?: boolean;
  error?: string;
}

/**
 * Calls the `subscribe` edge function to store an email and (for new signups)
 * send a welcome email. Throws on network/function failure so callers can
 * show an error state.
 */
export async function subscribe(params: {
  email: string;
  type?: SignupType;
  eventKey?: string;
  source?: string;
}): Promise<SubscribeResult> {
  if (!supabase) {
    return {
      ok: false,
      error: 'Signups are not available right now. Please try again later.',
    };
  }

  const { data, error } = await supabase.functions.invoke<SubscribeResult>('subscribe', {
    body: {
      email: params.email,
      type: params.type ?? 'newsletter',
      event_key: params.eventKey,
      source: params.source,
    },
  });

  if (error) {
    return {
      ok: false,
      error: await invokeErrorMessage(error, 'Signups are temporarily unavailable. Please try again later.'),
    };
  }

  return data ?? { ok: false, error: 'Empty response from server.' };
}

export interface SponsorInquiryResult {
  ok: boolean;
  stored?: boolean;
  email_sent?: boolean;
  error?: string;
}

/**
 * Calls the `sponsor-inquiry` edge function to store a partnership inquiry and
 * notify the LAS team. Mirrors {@link subscribe}: the DB write is the source of
 * truth, and the team notification is best-effort.
 */
export async function submitSponsorInquiry(params: {
  company: string;
  contactName: string;
  email: string;
  message?: string;
  source?: string;
}): Promise<SponsorInquiryResult> {
  if (!supabase) {
    return {
      ok: false,
      error: 'Inquiries are not available right now. Please email us directly.',
    };
  }

  const { data, error } = await supabase.functions.invoke<SponsorInquiryResult>('sponsor-inquiry', {
    body: {
      company: params.company,
      contact_name: params.contactName,
      email: params.email,
      message: params.message,
      source: params.source,
    },
  });

  if (error) {
    return {
      ok: false,
      error: await invokeErrorMessage(
        error,
        "We couldn't send your inquiry right now. Please email laurieranalytics@gmail.com directly.",
      ),
    };
  }

  return data ?? { ok: false, error: 'Empty response from server.' };
}
