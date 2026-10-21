// Supabase Edge Function: sponsor-inquiry
//
// Handles partnership/sponsorship inquiries from the website. Stores the
// inquiry in Supabase (bypassing RLS with the service role) and then notifies
// the LAS team by email via Resend. The DB write is the source of truth: if the
// Resend send fails (e.g. no verified domain yet, or SPONSOR_NOTIFY_TO unset),
// the inquiry is still saved and the request still succeeds.
//
// Request:  POST { company, contact_name, email, message?, source? }
// Response: { ok, stored, email_sent }

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// Where sponsor inquiries are emailed. Until a domain is verified in Resend,
// this must be the Resend account owner's email to actually deliver.
const NOTIFY_TO = Deno.env.get('SPONSOR_NOTIFY_TO');

// Same sender as the subscribe function; see RESEND_FROM there.
const FROM_ADDRESS = Deno.env.get('RESEND_FROM') ?? 'Laurier Analytics <onboarding@resend.dev>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function notifyTeam(inquiry: {
  company: string;
  contact_name: string;
  email: string;
  message: string | null;
}): Promise<{ sent: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { sent: false, error: 'RESEND_API_KEY not configured' };
  if (!NOTIFY_TO) return { sent: false, error: 'SPONSOR_NOTIFY_TO not configured' };
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
      <h1 style="font-size: 20px;">New sponsor inquiry</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        <strong>${escapeHtml(inquiry.company)}</strong> wants to partner with LAS.
      </p>
      <table style="font-size: 14px; color: #334155; border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Contact</td><td>${escapeHtml(inquiry.contact_name)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Email</td><td>${escapeHtml(inquiry.email)}</td></tr>
      </table>
      ${
        inquiry.message
          ? `<p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 16px; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</p>`
          : ''
      }
      <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Laurier Analytics &amp; Statistics</p>
    </div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [NOTIFY_TO],
        reply_to: inquiry.email,
        subject: `Sponsor inquiry: ${inquiry.company}`,
        html,
      }),
    });
    if (res.ok) return { sent: true };
    return { sent: false, error: `Resend ${res.status}: ${await res.text()}` };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const company = String(body.company ?? '').trim().slice(0, 200);
  const contactName = String(body.contact_name ?? '').trim().slice(0, 200);
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 320);
  const messageRaw = String(body.message ?? '').trim().slice(0, 4000);
  const message = messageRaw.length > 0 ? messageRaw : null;
  const source = body.source ? String(body.source).slice(0, 100) : null;

  if (!company) return json({ ok: false, error: 'Please enter your company or organization.' }, 400);
  if (!contactName) return json({ ok: false, error: 'Please enter a contact name.' }, 400);
  if (!email || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from('sponsor_inquiries')
    .insert({ company, contact_name: contactName, email, message, source });

  if (error) {
    console.error('DB insert error:', error);
    return json({ ok: false, error: 'Could not send your inquiry. Please try again.' }, 500);
  }

  const result = await notifyTeam({ company, contact_name: contactName, email, message });
  if (!result.sent) console.warn('Sponsor notification not sent:', result.error);

  return json({ ok: true, stored: true, email_sent: result.sent });
});
