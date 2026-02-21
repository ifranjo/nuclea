import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isPublicPath,
  isBetaGatedPath,
  isAuthPagePath,
  buildLoginRedirectParam,
} from '@/lib/middlewareAccess'

test('isPublicPath matches configured public routes and children', () => {
  assert.equal(isPublicPath('/'), true)
  assert.equal(isPublicPath('/onboarding/capsule/legacy'), true)
  assert.equal(isPublicPath('/beta/waitlist'), true)
  assert.equal(isPublicPath('/dashboard'), false)
})

test('isBetaGatedPath matches protected capsule routes', () => {
  assert.equal(isBetaGatedPath('/dashboard'), true)
  assert.equal(isBetaGatedPath('/capsule/123'), true)
  assert.equal(isBetaGatedPath('/settings/profile'), true)
  assert.equal(isBetaGatedPath('/onboarding'), false)
})

test('isAuthPagePath matches login and registro only', () => {
  assert.equal(isAuthPagePath('/login'), true)
  assert.equal(isAuthPagePath('/registro'), true)
  assert.equal(isAuthPagePath('/login/help'), false)
})

test('buildLoginRedirectParam preserves path and query', () => {
  assert.equal(buildLoginRedirectParam('/capsule/abc', '?step=4'), '/capsule/abc?step=4')
  assert.equal(buildLoginRedirectParam('/dashboard', ''), '/dashboard')
})
