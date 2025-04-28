import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js';
import SignIn from './SignIn/SignIn.tsx';
import Register from './Register/Register.tsx';
import './Auth.css';
import { SupabaseClient } from '@supabase/supabase-js';

interface AuthProps {
  supabase: SupabaseClient;
}

export default function Auth({ supabase }: AuthProps) {
  const [showRegister, setShowRegister] = useState(false);

  const toggleForm = () => {
    setShowRegister((prev) => !prev);
  }


  return (
    <div className='auth'>
      {!showRegister ? (<SignIn supabase={supabase} onToggleForm={toggleForm} />) : (<Register supabase={supabase} onToggleForm={toggleForm} />)}
    </div>
  )
}
