import logo from '../../../public/logo.svg'

interface LogoProps {
  height: number;
  width: number;
}

export default function ({ height, width }: LogoProps) {
  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <img src={logo} alt='Logo' style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
    </div >
  );
} 
