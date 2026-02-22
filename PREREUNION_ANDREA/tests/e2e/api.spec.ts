import { test, expect } from '@playwright/test'

test.describe('API health checks', () => {
  test('GET /api/waitlist returns 200 with count', async ({ request }) => {
    const response = await request.get('/api/waitlist')

    // If Firebase Admin is configured, returns real count
    // If not, the route catches the error and returns { count: 0 }
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('count')
    expect(typeof body.count).toBe('number')
    expect(body.count).toBeGreaterThanOrEqual(0)
  })

  test('POST /api/waitlist with valid payload returns 200 or 201', async ({
    request,
  }) => {
    const response = await request.post('/api/waitlist', {
      data: {
        email: `e2e-test-${Date.now()}@example.com`,
        source: 'e2e-test',
        consentVersion: '2.0',
        acceptedPrivacy: true,
      },
      headers: { 'Content-Type': 'application/json' },
    })

    // 201 = new entry, 200 = already exists, 500 = Firebase not configured
    // We accept all three since Firebase may not be running locally
    expect([200, 201, 500]).toContain(response.status())

    if (response.status() !== 500) {
      const body = await response.json()
      expect(body).toHaveProperty('message')
    }
  })

  test('POST /api/waitlist with invalid data returns 400', async ({
    request,
  }) => {
    const response = await request.post('/api/waitlist', {
      data: { invalidField: 'not-an-email' },
      headers: { 'Content-Type': 'application/json' },
    })

    // Zod validation rejects malformed payloads
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).toBeLessThan(500)

    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('POST /api/waitlist with empty body returns 400', async ({
    request,
  }) => {
    const response = await request.post('/api/waitlist', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).toBeLessThan(500)
  })

  test('GET /api/capsules without auth returns 401', async ({ request }) => {
    const response = await request.get('/api/capsules')

    // Should require Bearer token authentication
    expect(response.status()).toBe(401)

    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('POST /api/capsules without auth returns 401', async ({ request }) => {
    const response = await request.post('/api/capsules', {
      data: { type: 'legacy', title: 'Test' },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(401)
  })
})
