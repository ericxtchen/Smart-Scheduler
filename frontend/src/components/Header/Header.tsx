import { Container } from '@mantine/core';
import './Header.css';
import logo from '../../../public/logo.svg';
import StartSession from '../StartSession/StartSession.tsx';
import Profile from '../Profile/Profile.tsx';
import { SupabaseClient } from '@supabase/supabase-js';

interface HeaderProps {
  supabase: SupabaseClient
}

export default function Header({ supabase }: HeaderProps) {
  return (
    <div className='header'>
      <Container fluid size="100%" h={60} style={{ display: 'flex', justifyContent: 'space-between' }} className='container'>
        <img src={logo} alt='Logo' className='logo' />
        <div className='session-button'>
          <StartSession />
        </div>

        <Profile supabase={supabase}/>
      </Container>
    </div>
  );
}
