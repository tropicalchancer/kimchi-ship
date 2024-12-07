import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token'
    })
  }),
  
  http.get('*/posts', () => {
    return HttpResponse.json([
      {
        id: '1',
        content: 'Test post',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users: {
          id: 'test-user',
          full_name: 'Test User',
          avatar_url: null,
          current_streak: 1,
          email: 'test@example.com'
        }
      }
    ])
  })
]