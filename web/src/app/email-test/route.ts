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

  const port = Number(process.env.SMTP_PORT || 587)
  const cfg = {
    host: process.env.SMTP_HOST || null,
    port,
    secure: port === 465,
    user: process.env.SMTP_USER || null,
    hasPass: !!process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || null,
    to: process.env.ENQUIRY_NOTIFY_TO || null,
  }

  const result: Record<string, unknown> = { cfg }

  const errInfo = (e: unknown) => {
    const x = e as { message?: string; code?: string; response?: string; responseCode?: number }
    return { message: x?.message || String(e), code: x?.code, response: x?.response, responseCode: x?.responseCode }
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })

    try {
      await transport.verify()
      result.verify = 'ok (connection + auth succeeded)'
    } catch (e) {
      result.verify = errInfo(e)
    }

    try {
      const info = await transport.sendMail({
        from: cfg.from || undefined,
        to: cfg.to || undefined,
        subject: 'CIC email diagnostic',
        text: 'Diagnostic test from the CIC website. If you received this, SMTP works.',
      })
      result.send = { ok: true, response: info.response, accepted: info.accepted, rejected: info.rejected }
    } catch (e) {
      result.send = errInfo(e)
    }
  } catch (e) {
    result.fatal = errInfo(e)
  }

  return NextResponse.json(result)
}
