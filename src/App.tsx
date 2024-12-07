// src/App.tsx
import { useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import ShipFeed from './components/ShipFeed'
import UserProfile from './components/UserProfile'
import Auth from './components/Auth'
import { Database } from './lib/database.types'

type Profile = Database['public']['Tables']['users']['Row']

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<Profile | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        createOrGetUser(session.user)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        createOrGetUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createOrGetUser = async (authUser: User) => {
    // First try to get existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (existingUser) {
      setUser(existingUser)
      return
    }

    // If no existing user, create one
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        full_name: authUser.email?.split('@')[0] || 'Anonymous',
        email: authUser.email || '',
        avatar_url: null,
        current_streak: 0,
        longest_streak: 0,
        last_post_date: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return
    }

    setUser(newUser)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {!session ? (
          <Auth />
        ) : (
          <Routes>
            <Route path="/" element={<ShipFeed key={user?.id} user={user} />} />
            <Route 
              path="/profile/:userId" 
              element={<UserProfile currentUser={session.user} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App