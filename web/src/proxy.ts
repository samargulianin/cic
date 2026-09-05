import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Run locale routing on everything EXCEPT Payload admin/api, Next internals,
  // and files with an extension. This keeps /admin and /api/* under Payload's control.
  matcher: ['/((?!api|admin|seed|email-test|_next|_payload|_vercel|.*\\..*).*)'],
}
