import logo from '../../../public/google.svg'

interface GoogleLogoProps {
  size: number;
}

export default function GoogleLogo({ size }: GoogleLogoProps) {
  return (
    <img src={logo} height={size} width={size} />
  );
}
