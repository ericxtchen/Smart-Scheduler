import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js';
import SignIn from './SignIn/SignIn.tsx';
import './Auth.css';

export default function Auth({ supabase }: { supabase: any }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log(email);
  }, [email])

  const handleSignUp = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) alert(error.message)
    setLoading(false)
  }

  const handleSignIn = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className='auth'>
      <SignIn supabase={supabase} />
    </div>
  )
}
