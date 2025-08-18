import { Paper, Button, Divider, TextInput, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import Logo from '../../Logo/Logo.tsx';
import GoogleLogo from '../../Logo/GoogleLogo.tsx';
import './SignIn.css'
import { SupabaseClient } from '@supabase/supabase-js';


interface SignInProps {
  supabase: SupabaseClient;
  onToggleForm: () => void;
}

export default function SignIn({ supabase, onToggleForm }: SignInProps) {

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
      console.log("Login Error: ", error);
      return { success: false, error: error.message };
    }
  
    console.log("User logged in:", data.user);
    return { success: true, data };
  }

  // Do i make the Paper a flex display or do I use a div and make that a flex display?
  return (
    <Paper radius='md' shadow='xl' className='signin-box' w={400} p={30}>
      <Logo height={60} width={350} />
      <Button variant='default' fullWidth>
        <GoogleLogo size={14} />
        Sign in with Google
      </Button>
      <Divider my='md' label="Or continue with email" labelPosition='center' />
      <form onSubmit={form.onSubmit(() => { })} style={{ width: '100%' }} >
        <TextInput
          label="Email:"
          withAsterisk
          placeholder='Email'
          value={form.values.email}
          onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
          radius='md'
        />

        <TextInput
          label="Password: "
          withAsterisk
          placeholder='Password'
          value={form.values.password}
          onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
          radius='md'
        />

        <Button fullWidth radius='md' onClick={signInWithEmail}>Sign In</Button>

        <Anchor component='button' type='button' c='dimmed' onClick={onToggleForm}>
          Don't have an account? Register
        </Anchor>
      </form>
    </Paper >
  );
}
