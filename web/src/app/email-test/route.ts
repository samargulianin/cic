import { NextResponse } from 'next/server'

// TEMPORARY email diagnostic. Token-protected. Remove once delivery is confirmed.
export const dynamic = 'force-dynamic'

const TOKEN = 'cic-emailtest-7q2f9x'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM || 'info@cicgeorgia.ge'
  const to = process.env.ENQUIRY_NOTIFY_TO || 'info@cicgeorgia.ge'

  const cfg = {
    hasBrevoKey: !!apiKey,
    keyLength: apiKey?.length ?? 0,
    keyPrefix: apiKey?.slice(0, 8) ?? null,
    keyLast4: apiKey?.slice(-4) ?? null,
    keyHasBrackets: !!apiKey && (apiKey.includes('<') || apiKey.includes('>')),
    keyHasWhitespace: !!apiKey && apiKey !== apiKey.trim(),
    from,
    to,
  }
  if (!apiKey) {
    return NextResponse.json({ cfg, error: 'BREVO_API_KEY is not set in this environment' })
  }

  const match = from.match(/^\s*(.*?)\s*<(.+?)>\s*$/)
  const sender = match ? { name: match[1], email: match[2] } : { email: from.trim() }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject: 'CIC email diagnostic (Brevo API)',
        textContent: 'Diagnostic from the CIC website via the Brevo HTTPS API. Delivery works.',
      }),
      signal: AbortSignal.timeout(15000),
    })
    const bodyText = await res.text()
    return NextResponse.json({ cfg, status: res.status, ok: res.ok, response: bodyText })
  } catch (e) {
    const x = e as { message?: string; name?: string }
    return NextResponse.json({ cfg, error: x?.message || String(e), name: x?.name })
  }
}
