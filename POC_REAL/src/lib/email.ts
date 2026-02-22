/**
 * Provider-agnostic transactional email service for NUCLEA.
 *
 * - If RESEND_API_KEY is set, uses Resend (EU-friendly, Next.js native).
 * - Otherwise, falls back to ConsoleEmailService (logs to stdout).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  /** Provider message-id when available */
  id?: string
  error?: string
}

export interface EmailService {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_FROM = 'NUCLEA <noreply@nuclea.app>'

function getFromAddress(): string {
  return process.env.EMAIL_FROM || DEFAULT_FROM
}

// ---------------------------------------------------------------------------
// Resend implementation
// ---------------------------------------------------------------------------

export class ResendEmailService implements EmailService {
  private from: string

  constructor() {
    this.from = getFromAddress()
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    // Dynamic import keeps the Resend SDK out of the client bundle
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: this.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  }
}

// ---------------------------------------------------------------------------
// Console implementation (development / fallback)
// ---------------------------------------------------------------------------

export class ConsoleEmailService implements EmailService {
  private from: string

  constructor() {
    this.from = getFromAddress()
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const recipients = Array.isArray(params.to) ? params.to.join(', ') : params.to
    const id = `console-${Date.now()}`

    console.log(
      [
        '',
        '╔══════════════════════════════════════════════════╗',
        '║  EMAIL (console mode — no RESEND_API_KEY set)   ║',
        '╚══════════════════════════════════════════════════╝',
        `  From:    ${this.from}`,
        `  To:      ${recipients}`,
        `  Subject: ${params.subject}`,
        `  ID:      ${id}`,
        '──────────────────────────────────────────────────',
        params.text || '(no text version — HTML only)',
        '──────────────────────────────────────────────────',
        '',
      ].join('\n')
    )

    return { success: true, id }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: EmailService | null = null

/**
 * Returns the appropriate EmailService based on environment configuration.
 * Singleton — safe to call multiple times.
 */
export function getEmailService(): EmailService {
  if (_instance) return _instance

  if (process.env.RESEND_API_KEY) {
    _instance = new ResendEmailService()
  } else {
    _instance = new ConsoleEmailService()
  }

  return _instance
}
