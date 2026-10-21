// Supabase Edge Function: unsubscribe
//
// Target of the "Unsubscribe" link in newsletter emails. Marks the subscriber
// matching the token as unsubscribed. The row is kept (not deleted) so a later
// signup can reactivate it.
//
// GET  ?token=...  → link clicked in the email; responds with a small HTML page
// POST ?token=...  → RFC 8058 one-click unsubscribe from the mail client
//
// JWT verification is disabled for this function (see supabase/config.toml)
// because mail clients and email links can't send an Authorization header.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://laurieranalytics.com';

// Tokens are UUIDs today; the looser pattern also accepts older hex tokens.
const TOKEN_RE = /^[A-Za-z0-9-]{16,128}$/;

function page(title: string, message: string, status = 200): Response {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; background: #070b0d; color: #e7ecef; font-family: -apple-system, Segoe UI, Roboto, sans-serif;">
    <main style="max-width: 480px; margin: 0 auto; padding: 96px 20px;">
      <h1 style="font-size: 22px;">${title}</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #9aa7ae;">${message}</p>
      <p style="font-size: 14px;"><a href="${SITE_URL}" style="color: #5ee0e6;">Back to Laurier Analytics</a></p>
    </main>
  </body>
</html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

Deno.serve(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const token = new URL(req.url).searchParams.get('token') ?? '';
  if (!TOKEN_RE.test(token)) {
    return page('Link not recognized', 'This unsubscribe link is invalid or incomplete.', 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('id');

  if (error) {
    console.error('DB unsubscribe error:', error);
    return page(
      'Something went wrong',
      'We could not process your request. Please try again, or email laurieranalytics@gmail.com.',
      500,
    );
  }
  if (!data || data.length === 0) {
    return page('Link not recognized', 'We could not find a subscription for this link.', 404);
  }

  if (req.method === 'POST') return new Response(null, { status: 204 });
  return page("You're unsubscribed", "You won't get the LAS newsletter anymore. You can sign up again on our website any time.");
});
