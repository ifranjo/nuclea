import { z } from 'zod'
import { CURRENT_CONSENT_VERSION } from '@/types'

export class ApiValidationError extends Error {
  status: number
  issues: string[]

  constructor(message: string, issues: string[] = []) {
    super(message)
    this.status = 400
    this.issues = issues
  }
}

const capsuleTypeSchema = z.enum(['legacy', 'together', 'social', 'pet', 'life-chapter', 'origin'])

export const strictEmptyQuerySchema = z.object({}).strict()

export const waitlistPostBodySchema = z.object({
  email: z.string().trim().toLowerCase().email('Email invalido'),
  source: z.string().trim().min(1).max(80).default('api'),
  acceptedPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar privacidad y terminos para unirte a la lista' })
  }),
  consentVersion: z.string().trim().min(1).max(24).default(CURRENT_CONSENT_VERSION)
})

export const waitlistUnsubscribeBodySchema = z.object({
  token: z.string().trim().min(1).max(256)
})

export const waitlistUnsubscribeQuerySchema = z.object({
  token: z.string().trim().min(1).max(256)
})

export const capsulesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().trim().min(1).max(1024).optional()
})

export const capsulesCreateBodySchema = z.object({
  type: capsuleTypeSchema,
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(5000).default('')
})

function issuesToMessages(issues: z.ZodIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })
}

export function validateWithSchema<T>(schema: z.ZodType<T>, value: unknown, context: string): T {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw new ApiValidationError(`Invalid ${context}`, issuesToMessages(parsed.error.issues))
  }
  return parsed.data
}

export function validateSearchParams<T>(schema: z.ZodType<T>, searchParams: URLSearchParams): T {
  const raw = Object.fromEntries(searchParams.entries())
  return validateWithSchema(schema, raw, 'query parameters')
}
