import { useState, useEffect } from 'react'
import './App.css'
import Calendar from './components/Calendar/Calendar.tsx'
import Header from './components/Header/Header.tsx'
import { MantineProvider } from '@mantine/core'
import { createClient, Session } from '@supabase/supabase-js'
import Auth from './components/Auth/Auth.tsx'

const supabase = createClient('https://ytxihfzapbdifbxdsfmz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eGloZnphcGJkaWZieGRzZm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTMwMDMsImV4cCI6MjA2MTAyOTAwM30.cP7Nvc7gZxFx3DTRFuCDnU53uGXy8xQ73eVXWT6TNLw');


function App() {
  const [session, setSession] = useState<Session | null>(null);

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
