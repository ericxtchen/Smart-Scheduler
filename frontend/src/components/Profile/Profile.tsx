import { Button, Menu } from '@mantine/core';
import './Profile.css';
import { SupabaseClient } from '@supabase/supabase-js';

interface ProfileProps {
  supabase: SupabaseClient
}


export default function Profile({ supabase }: ProfileProps) {
  const signOut = () => {
    supabase.auth.signOut();
  }
  return (
    <Menu>
      <Menu.Target>
        <Button variant='outline' radius={'50%'} size='xs' className='profile'></Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={signOut}>Log Out</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
