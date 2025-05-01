import { Paper, Button, Divider, TextInput, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import Logo from '../../Logo/Logo.tsx';
import GoogleLogo from '../../Logo/GoogleLogo.tsx';
import { SupabaseClient } from '@supabase/supabase-js';


interface RegisterProps {
  supabase: SupabaseClient;
  onToggleForm: () => void;
}

export default function Register({ supabase, onToggleForm }: RegisterProps) {

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      name: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  async function signUpNewUser() {
    const { data, error } = await supabase.auth.signUp({
      email: form.values.email,
      password: form.values.password,
      options: {
        data: {
          name: form.values.name,
        },
      },
    });
    if (error) console.log("Registration Error: ", error);
  }
  // Do i make the Paper a flex display or do I use a div and make that a flex display?
  return (
    <Paper radius='md' shadow='xl' className='signin-box' w={400} p={30}>
      <Logo height={60} width={350} />
      <Button variant='default' fullWidth>
        <GoogleLogo size={14} />
        Register with Google
      </Button>
      <Divider my='md' label="Or continue with email" labelPosition='center' />
      <form onSubmit={form.onSubmit(() => { })} style={{ width: '100%' }} >
        <TextInput
          label="Name:"
          withAsterisk
          placeholder='Name'
          value={form.values.name}
          onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
          radius='md'
        />

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

        <Button fullWidth radius='md' onClick={signUpNewUser}>Register</Button>

        <Anchor component='button' type='button' c='dimmed' onClick={onToggleForm}>
          Already have an account? Sign in
        </Anchor>
      </form>
    </Paper >
  );
}
