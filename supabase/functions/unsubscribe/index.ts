// Supabase Edge Function: unsubscribe
//
// Target of the "Unsubscribe" link in newsletter emails. Marks the subscriber
// matching the token as unsubscribed. The row is kept (not deleted) so a later
// signup can reactivate it.
//
// GET  ?token=...  → link opened from the email; shows a confirm page only.
//                    Never writes, because mail security scanners (Safe Links
//                    and similar) prefetch links on their own.
// POST ?token=...  → performs the unsubscribe. A body of
//                    `List-Unsubscribe=One-Click` is an RFC 8058 one-click
//                    request from the mail client (empty 200); anything else is
//                    the confirm form, which gets the "unsubscribed" page.
//
// JWT verification is disabled for this function (see supabase/config.toml)
// because mail clients and email links can't send an Authorization header.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://laurieranalytics.com';

// Must match the `unsubscribe_token uuid` column, otherwise Postgres rejects
// the value (22P02) and the reader gets a 500 instead of "Link not recognized".
const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, message: string, status = 200, extra = ''): Response {
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
      <p style="font-size: 15px; line-height: 1.6; color: #9aa7ae;">${message}</p>${extra}
      <p style="font-size: 14px;"><a href="${SITE_URL}" style="color: #5ee0e6;">Back to Laurier Analytics</a></p>
    </main>
  </body>
</html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function confirmForm(token: string): string {
  return `
      <form method="post" action="?token=${encodeURIComponent(token)}" style="margin: 24px 0;">
        <button type="submit" style="background: #5ee0e6; color: #070b0d; border: 0; padding: 12px 20px; font-size: 15px; cursor: pointer;">Unsubscribe</button>
      </form>`;
}

const notFound = () => page('Link not recognized', 'We could not find a subscription for this link.', 404);
const failed = () =>
  page(
    'Something went wrong',
    'We could not process your request. Please try again, or email laurieranalytics@gmail.com.',
    500,
  );

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

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('status')
      .eq('unsubscribe_token', token)
      .maybeSingle();
    if (error) {
      console.error('DB unsubscribe lookup error:', error);
      return failed();
    }
    if (!data) return notFound();
    if (data.status === 'unsubscribed') {
      return page("You're already unsubscribed", "You won't get the LAS newsletter anymore.");
    }
    return page(
      'Unsubscribe from the LAS newsletter?',
      "Confirm below and we'll stop sending you the biweekly newsletter.",
      200,
      confirmForm(token),
    );
  }

  const body = await req.text();
  const oneClick = new URLSearchParams(body).get('List-Unsubscribe') === 'One-Click';

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('id');

  if (error) {
    console.error('DB unsubscribe error:', error);
    return oneClick ? new Response(null, { status: 500 }) : failed();
  }
  if (!data || data.length === 0) return oneClick ? new Response(null, { status: 404 }) : notFound();

  if (oneClick) return new Response(null, { status: 200 });
  return page("You're unsubscribed", "You won't get the LAS newsletter anymore. You can sign up again on our website any time.");
});
