import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, m, type Variants } from 'motion/react'
import { site } from '../config/site'
import { Magnetic } from '../motion/Magnetic'
import { SplitText } from '../motion/SplitText'
import { dur, ease, spring, inView, inViewSoon } from '../motion/tokens'
import { Icon } from './Icon'
import { Reveal } from './Reveal'
import './Contact.css'

type Fields = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>
type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY: Fields = { name: '', email: '', message: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Please enter your name.'
  if (!f.email.trim()) e.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'That email address doesn’t look right.'
  if (!f.message.trim()) e.message = 'Please write a message.'
  else if (f.message.trim().length < 10) e.message = 'A little more detail, please (10+ characters).'
  return e
}

const stripScheme = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '')

const column: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.reveal, ease: ease.out } },
}

export function Contact() {
  const { email, github, linkedin } = site.links
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [serverMsg, setServerMsg] = useState('')
  const honeyRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Functional update so simultaneous changes (e.g. browser autofill) don't overwrite each other.
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  // Re-validate live once the visitor has tried to submit.
  useEffect(() => {
    if (touched) setErrors(validate(fields))
  }, [fields, touched])

  const mailtoFallback = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Portfolio message from ${fields.name || 'a visitor'}`)}&body=${encodeURIComponent(fields.message)}`
    : ''

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      // Move focus to the first invalid field.
      const first = (['name', 'email', 'message'] as const).find((k) => errs[k])
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    // Bots fill the hidden field; humans never see it.
    if (honeyRef.current?.value) {
      setStatus('sent')
      return
    }
    if (!site.contactForm.endpoint) {
      window.location.href = mailtoFallback
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(site.contactForm.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          _subject: `Portfolio message from ${fields.name.trim()}`,
          _replyto: fields.email.trim(),
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
      if (res.ok && (data.success === true || data.success === 'true')) {
        setStatus('sent')
        setFields(EMPTY)
        setTouched(false)
      } else {
        setServerMsg(data.message ?? '')
        setStatus('error')
      }
    } catch {
      setServerMsg('')
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setServerMsg('')
  }

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">
              <b>06</b> / Contact
            </p>
          </Reveal>
          <SplitText
            id="contact-title"
            className="section-title"
            parts={['Have an idea for an app? ', { text: 'Let’s talk.', className: 'serif contact__em' }]}
          />
        </div>

        <m.div
          className="postcard"
          initial={{ opacity: 0, rotateX: 18, y: 60, scale: 0.96 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          viewport={inView}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <Stamp sent={status === 'sent'} />

          <m.div
            className="postcard__info"
            variants={column}
            initial="hidden"
            whileInView="visible"
            viewport={inViewSoon}
          >
            <m.h3 className="postcard__title" variants={item}>
              Contact me
            </m.h3>
            <m.p variants={item}>
              Want to talk about one of these apps, an idea of yours, or Android development in general? Leave a message
              and I’ll reply by email as soon as I can.
            </m.p>
            {email && (
              <m.p variants={item}>
                Prefer to write directly? Send an email to:
                <br />
                <a className="postcard__link" href={`mailto:${email}`}>
                  {email}
                </a>
              </m.p>
            )}
            <m.ul className="postcard__socials" variants={item}>
              {github && (
                <li>
                  <span className="mono">GitHub</span>
                  <a className="postcard__link" href={github} target="_blank" rel="noopener noreferrer">
                    {stripScheme(github)}
                    <Icon name="arrowUpRight" size={14} />
                  </a>
                </li>
              )}
              {linkedin && (
                <li>
                  <span className="mono">LinkedIn</span>
                  <a className="postcard__link" href={linkedin} target="_blank" rel="noopener noreferrer">
                    {stripScheme(linkedin)}
                    <Icon name="arrowUpRight" size={14} />
                  </a>
                </li>
              )}
            </m.ul>
          </m.div>

          <m.span
            className="postcard__divider"
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={inViewSoon}
            transition={{ duration: 1.1, ease: ease.expo, delay: 0.3 }}
          />

          <div className="postcard__form-wrap">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' ? (
                <m.div
                  key="sent"
                  className="postcard__sent"
                  role="status"
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={spring.device}
                >
                  <svg viewBox="0 0 52 52" className="postcard__check" aria-hidden="true">
                    <m.circle
                      cx="26"
                      cy="26"
                      r="24"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: ease.out }}
                    />
                    <m.path
                      d="M15 27l7 7 15-16"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: ease.out, delay: 0.45 }}
                    />
                  </svg>
                  <p className="postcard__sent-title">Message sent.</p>
                  <p className="postcard__sent-body">Thanks for writing — I’ll get back to you by email.</p>
                  <button type="button" className="btn btn-ghost" onClick={reset}>
                    Send another message
                  </button>
                </m.div>
              ) : (
                <m.form
                  key="form"
                  ref={formRef}
                  className="postcard__form"
                  noValidate
                  onSubmit={onSubmit}
                  variants={column}
                  initial="hidden"
                  whileInView="visible"
                  viewport={inViewSoon}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                >
                  <Field label="Name" name="name" error={errors.name} variants={item}>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={fields.name}
                      onChange={onChange}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'cf-name-err' : undefined}
                      maxLength={120}
                      required
                    />
                  </Field>
                  <Field label="Email" name="email" error={errors.email} variants={item}>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="Your email address"
                      value={fields.email}
                      onChange={onChange}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'cf-email-err' : undefined}
                      maxLength={200}
                      required
                    />
                  </Field>
                  <Field label="Message" name="message" error={errors.message} variants={item}>
                    <textarea
                      id="cf-message"
                      name="message"
                      rows={5}
                      placeholder="Your message"
                      value={fields.message}
                      onChange={onChange}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'cf-message-err' : undefined}
                      maxLength={5000}
                      required
                    />
                  </Field>

                  {/* Honeypot: hidden from people and assistive tech */}
                  <input
                    ref={honeyRef}
                    type="text"
                    name="_honey"
                    tabIndex={-1}
                    autoComplete="off"
                    className="postcard__honey"
                    aria-hidden="true"
                  />

                  <m.div className="postcard__footer" variants={item}>
                    <p className="postcard__note">* Denotes a required field</p>
                    <Magnetic strength={6} className="postcard__send-wrap">
                      <m.button
                        type="submit"
                        className="postcard__send"
                        disabled={status === 'sending'}
                        whileTap={{ scale: 0.94 }}
                        transition={spring.press}
                      >
                        <span>{status === 'sending' ? 'Sending…' : 'Send'}</span>
                        <span className="postcard__send-icon" aria-hidden="true">
                          {status === 'sending' ? <span className="postcard__spinner" /> : <Icon name="arrowUpRight" size={16} />}
                        </span>
                      </m.button>
                    </Magnetic>
                  </m.div>

                  <div aria-live="polite" className="postcard__live">
                    <AnimatePresence>
                      {status === 'error' && (
                        <m.p
                          className="postcard__error-msg"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: dur.standard, ease: ease.out }}
                        >
                          The message couldn’t be sent{serverMsg ? ` (${serverMsg})` : ''}.{' '}
                          {mailtoFallback && (
                            <a className="postcard__link" href={mailtoFallback}>
                              Email me instead
                            </a>
                          )}
                        </m.p>
                      )}
                    </AnimatePresence>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </div>
        </m.div>
      </div>
    </section>
  )
}

interface FieldProps {
  label: string
  name: keyof Fields
  error?: string
  variants: Variants
  children: ReactNode
}

function Field({ label, name, error, variants, children }: FieldProps) {
  return (
    <m.div className={`postcard__field ${error ? 'has-error' : ''}`} variants={variants}>
      <label htmlFor={`cf-${name}`}>
        {label}:<span aria-hidden="true">*</span>
      </label>
      <m.div
        className="postcard__control"
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4, ease: ease.out }}
      >
        {children}
        <span className="postcard__focus" aria-hidden="true" />
      </m.div>
      <AnimatePresence>
        {error && (
          <m.p
            id={`cf-${name}-err`}
            className="postcard__error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: dur.micro }}
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </m.div>
  )
}

const perforations: [number, number][] = [
  ...Array.from({ length: 9 }, (_, i) => [i * 8, 0] as [number, number]),
  ...Array.from({ length: 9 }, (_, i) => [i * 8, 76] as [number, number]),
  ...Array.from({ length: 11 }, (_, i) => [0, i * 7.6] as [number, number]),
  ...Array.from({ length: 11 }, (_, i) => [64, i * 7.6] as [number, number]),
]

/** Postage stamp with a postmark that stamps down once a message is sent. */
function Stamp({ sent }: { sent: boolean }) {
  return (
    <div className="stamp" aria-hidden="true">
      <m.div
        className="stamp__paper"
        initial={{ rotate: 12, scale: 0.6, opacity: 0 }}
        whileInView={{ rotate: 4, scale: 1, opacity: 1 }}
        viewport={inViewSoon}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.6 }}
      >
        <svg viewBox="0 0 64 76" className="stamp__art">
          {/* Paper with perforated edges: small notches punched along the border */}
          <rect x="0" y="0" width="64" height="76" fill="#f2f2ea" />
          {perforations.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.1" fill="#0c0e12" />
          ))}
          <rect x="6" y="6" width="52" height="64" rx="2" fill="#c8f53c" />
          <rect x="22" y="18" width="20" height="36" rx="4" fill="none" stroke="#0a0c0b" strokeWidth="2.5" />
          <path d="M29 22h6" stroke="#0a0c0b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 33v10M36 33v10M28 38h8" stroke="#0a0c0b" strokeWidth="2.5" strokeLinecap="round" />
          <text x="32" y="66" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="6" fill="#0a0c0b">
            ANDROID
          </text>
        </svg>
      </m.div>
      <m.svg
        viewBox="0 0 100 100"
        className="stamp__postmark"
        initial={false}
        animate={sent ? { scale: [1.6, 0.92, 1], opacity: [0, 1, 0.9], rotate: -14 } : { opacity: 0, scale: 1.6, rotate: -14 }}
        transition={{ duration: 0.5, ease: ease.out }}
      >
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <text x="50" y="47" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="8" fill="currentColor">
          SENT
        </text>
        <text x="50" y="58" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="6" fill="currentColor">
          ✓
        </text>
        <path d="M0 40q8-4 16 0t16 0M0 50q8-4 16 0t16 0M0 60q8-4 16 0t16 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </m.svg>
    </div>
  )
}
