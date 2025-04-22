import { Container } from '@mantine/core';
import './Header.css';
import logo from '../../../public/logo.svg'
import StartSession from '../StartSession/StartSession.tsx'

export default function Header() {
  return (
    <div className='header'>
      <Container fluid size="md" h={60} className='container'>
        <img src={logo} alt='Logo' className='logo' />

      </Container>
    </div>
  );
}
