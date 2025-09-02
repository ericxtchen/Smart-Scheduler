import { Paper, Button, TextInput, Anchor, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import Logo from '../../Logo/Logo.tsx';
import './SignIn.css'
import { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';


interface SignInProps {
  supabase: SupabaseClient;
  onToggleForm: () => void;
}

export default function SignIn({ supabase, onToggleForm }: SignInProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  async function signInWithEmail() {
    const { data, error } = await supabase.auth.signInWithPassword({
    email: form.values.email,
    password: form.values.password,
    });
  
    if (error) {
      setError("Invalid email or password. Please try again.");
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }


  return (
    <Paper radius='md' shadow='xl' className='signin-box' w={400} p={30}>
      <Logo height={60} width={350} />
      <form onSubmit={form.onSubmit(() => { })} style={{ width: '100%' }} >
        <TextInput
          label="Email:"
          withAsterisk
          placeholder='Email'
          value={form.values.email}
          onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
          radius='md'
        />

        <PasswordInput
          label="Password: "
          withAsterisk
          placeholder='Password'
          value={form.values.password}
          onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
          radius='md'
        />
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <Button fullWidth radius='md' onClick={signInWithEmail}>Sign In</Button>

        <Anchor component='button' type='button' c='dimmed' onClick={onToggleForm}>
          Don't have an account? Register
        </Anchor>
      </form>
    </Paper >
  );
}
