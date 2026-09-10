import type { EmailAdapter, SendEmailOptions } from 'payload'

// Railway blocks outbound SMTP, so mail goes over Brevo's HTTPS API instead of
// a nodemailer transport. Same account and authenticated domain as the SMTP
// relay — only the transport differs.

type Addr = { email: string; name?: string }

/** Accepts "a@b.com" or "Name <a@b.com>" and returns Brevo's address shape. */
const parseAddress = (input: string): Addr => {
  const match = input.match(/^\s*(.*?)\s*<(.+?)>\s*$/)
  if (match) {
    const [, name, email] = match
    return name ? { email, name } : { email }
  }
  return { email: input.trim() }
}

const toList = (input: SendEmailOptions['to']): Addr[] => {
  if (!input) return []
  if (Array.isArray(input)) return input.flatMap((entry) => toList(entry as SendEmailOptions['to']))
  if (typeof input === 'string') return input.split(',').map(parseAddress)
  const { address, name } = input as { address: string; name?: string }
  return [name ? { email: address, name } : { email: address }]
}

export const brevoAdapter =
  (apiKey: string, defaults: { fromAddress: string; fromName: string }): EmailAdapter =>
  () => ({
    name: 'brevo-api',
    defaultFromAddress: defaults.fromAddress,
    defaultFromName: defaults.fromName,
    sendEmail: async (message: SendEmailOptions) => {
      const sender = message.from
        ? parseAddress(typeof message.from === 'string' ? message.from : String(message.from))
        : { email: defaults.fromAddress, name: defaults.fromName }

      const body: Record<string, unknown> = {
        sender,
        to: toList(message.to),
        subject: message.subject,
      }
      if (message.text) body.textContent = String(message.text)
      if (message.html) body.htmlContent = String(message.html)
      if (message.replyTo) {
        body.replyTo = parseAddress(
          typeof message.replyTo === 'string' ? message.replyTo : String(message.replyTo),
        )
      }

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        throw new Error(`Brevo API ${res.status}: ${await res.text()}`)
      }
      return res.json()
    },
  })
