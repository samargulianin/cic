'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { submitEnquiry, type EnquiryState } from '@/actions/enquiry'
import { STUDY_LEVELS } from '@/lib/studyLevels'

const initial: EnquiryState = { status: 'idle' }

export function EnquiryForm({
  locale,
  fields,
}: {
  locale: string
  fields: { id: string; title: string }[]
}) {
  const t = useTranslations('enquiry')
  const [state, action, isPending] = useActionState(submitEnquiry, initial)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // Capture which CTA opened the form: any link to #enquire can carry a
  // `data-enquiry-source` attribute; the last one clicked wins.
  const [source, setSource] = useState('homepage')
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href*="#enquire"]') as HTMLElement | null
      const src = link?.dataset?.enquirySource
      if (src) setSource(src)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-xl border border-navy-100 bg-navy-50 p-8 text-center"
      >
        <p className="text-lg font-bold text-navy-900">{t('successTitle')}</p>
        <p className="mt-2 text-sm text-muted">{t('successBody')}</p>
      </div>
    )
  }

  const labelCls = 'text-sm font-semibold'
  const inputCls =
    'rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      {/* Honeypot — hidden from users, catches bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>{t('name')} *</span>
          <input name="name" required className={inputCls} autoComplete="name" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>{t('email')} *</span>
          <input name="email" type="email" required className={inputCls} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>{t('phone')}</span>
          <input name="phone" className={inputCls} autoComplete="tel" inputMode="tel" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>{t('field')}</span>
          <select name="fieldOfInterest" className={inputCls} defaultValue="">
            <option value="">{t('fieldPlaceholder')}</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>{t('studyLevel')}</span>
          <select name="studyLevel" className={inputCls} defaultValue="">
            <option value="">{t('studyLevelPlaceholder')}</option>
            {STUDY_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelCls}>{t('preferredContact')}</span>
          <select name="preferredContact" className={inputCls} defaultValue="whatsapp">
            <option value="whatsapp">{t('whatsapp')}</option>
            <option value="phone">{t('phoneCall')}</option>
            <option value="email">{t('emailContact')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelCls}>{t('message')}</span>
          <textarea name="message" rows={4} className={inputCls} />
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4" />
        <span>{t('consent')}</span>
      </label>

      {siteKey ? (
        <>
          <div className="cf-turnstile" data-sitekey={siteKey} />
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
        </>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-red-cta inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
      >
        {isPending ? t('sending') : t('submit')}
      </button>
    </form>
  )
}
