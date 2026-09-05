import { NextResponse } from 'next/server'
// @ts-expect-error nodemailer ships without bundled type declarations
import nodemailer from 'nodemailer'

// TEMPORARY SMTP diagnostic. Token-protected. Remove after debugging email.
export const dynamic = 'force-dynamic'

const TOKEN = 'cic-emailtest-7q2f9x'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const host = process.env.SMTP_HOST || 'mail.cicgeorgia.ge'
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || null
  const to = process.env.ENQUIRY_NOTIFY_TO || process.env.SMTP_USER || null

  const errInfo = (e: unknown) => {
    const x = e as { message?: string; code?: string; response?: string; responseCode?: number }
    return { message: x?.message || String(e), code: x?.code, response: x?.response, responseCode: x?.responseCode }
  }

  // Try several host/port combos to see which (if any) the server accepts.
  const combos = [
    { host, port: 465, secure: true },
    { host, port: 587, secure: false },
    { host, port: 2525, secure: false },
    { host: '50.87.146.216', port: 465, secure: true },
  ]

  const attempts: Record<string, unknown>[] = []
  for (const c of combos) {
    const a: Record<string, unknown> = { host: c.host, port: c.port, secure: c.secure }
    try {
      const transport = nodemailer.createTransport({
        host: c.host,
        port: c.port,
        secure: c.secure,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
        tls: { rejectUnauthorized: false },
      })
      await transport.verify()
      a.verify = 'OK'
      try {
        const info = await transport.sendMail({
          from: from || undefined,
          to: to || undefined,
          subject: 'CIC email diagnostic',
          text: 'Diagnostic test from the CIC website. If you received this, SMTP works.',
        })
        a.send = { ok: true, response: info.response, accepted: info.accepted }
      } catch (e) {
        a.send = errInfo(e)
      }
    } catch (e) {
      a.verify = errInfo(e)
    }
    attempts.push(a)
  }

  return NextResponse.json({
    cfg: { host, user: process.env.SMTP_USER || null, hasPass: !!process.env.SMTP_PASS, from, to },
    attempts,
  })
}
