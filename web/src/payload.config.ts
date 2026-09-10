import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { brevoAdapter } from './lib/brevoEmail'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Fields } from './collections/Fields'
import { Pages } from './collections/Pages'
import { Programs } from './collections/Programs'
import { Enquiries } from './collections/Enquiries'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Email: use SMTP when configured, otherwise fall back to Payload's console logger
// (dev-friendly — enquiry notifications are printed to the terminal).
// Relays (Brevo etc.) authenticate with a login that is NOT a sendable address,
// so the default sender comes from EMAIL_FROM — accepting either a bare address
// or the `Name <address>` form — and only falls back to SMTP_USER.
const defaultFrom =
  process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ||
  process.env.EMAIL_FROM ||
  process.env.SMTP_USER ||
  'info@cicgeorgia.ge'

// Brevo's HTTPS API is preferred: Railway blocks outbound SMTP, so a nodemailer
// transport times out there regardless of provider. SMTP stays as a fallback for
// environments that do allow it.
const email = process.env.BREVO_API_KEY
  ? brevoAdapter(process.env.BREVO_API_KEY, {
      fromAddress: defaultFrom,
      fromName: 'CIC Georgia',
    })
  : process.env.SMTP_HOST
  ? nodemailerAdapter({
      // From must be a sender the relay has verified, or it rejects the message.
      defaultFromAddress: defaultFrom,
      defaultFromName: 'CIC Georgia',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        // Port 465 uses implicit TLS; 587 upgrades via STARTTLS.
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        // Fail fast rather than hanging if the mail server is unreachable.
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      },
    })
  : undefined

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— CIC Georgia',
    },
    components: {
      beforeDashboard: ['/components/admin/RecentLeads'],
    },
    // Custom admin component paths (e.g. '/components/admin/…') resolve relative
    // to src/, not the project root.
    importMap: {
      baseDir: dirname,
    },
  },
  // Bilingual content: Georgian default, English alternate (PRD R1.x).
  localization: {
    locales: [
      { label: 'ქართული', code: 'ka' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ka',
    fallback: true,
  },
  collections: [Pages, Fields, Programs, Media, Enquiries, Users],
  globals: [Header, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Postgres (Neon). DATABASE_URI holds the pooled connection string.
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  ...(email ? { email } : {}),
  sharp,
})
