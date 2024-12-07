import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseClient = createClient(supabaseUrl, supabaseKey)

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }