import { useState, useEffect } from 'react'
import './App.css'
import Calendar from './components/Calendar/Calendar.tsx'
import Header from './components/Header/Header.tsx'
import { MantineProvider } from '@mantine/core'
import { createClient, Session } from '@supabase/supabase-js'
import Auth from './components/Auth/Auth.tsx'

const supabase = createClient(import.meta.env.VITE_PROJECT_URL, import.meta.env.VITE_ANON_KEY);

function App() {
  const [session, setSession] = useState<Session | null>(null); // is Auth supposed to return something to change session?

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <MantineProvider>
      {!session ? (
        <Auth supabase={supabase} />
      ) : (
        <>
          <Header />
          <Calendar />
        </>
      )}
    </MantineProvider>
  );
}

export default App;
