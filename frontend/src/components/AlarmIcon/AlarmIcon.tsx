import icon from '../../../public/alarm.svg';

interface AlarmIconProps {
  size: number;
}

export default function AlarmIcon({ size }: AlarmIconProps) {
  return (
    <img src={icon} alt='Alarm Icon' width={size} height={size} />
  );
}
