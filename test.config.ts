import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { setupServer } from 'msw/node'

// Define handlers first before using them
const handlers = [
  http.post(`${process.env.VITE_SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
    })
  })
]

// Create server with handlers
const server = setupServer(...handlers)

// Export what we need
export { server, handlers }

// Setup test utilities
export {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  render,
  screen,
  fireEvent
}