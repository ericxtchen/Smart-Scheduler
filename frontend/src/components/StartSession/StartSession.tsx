import { Button } from '@mantine/core';
//import { IconAlarm } from '@tabler/icons-react'; // makes load time A LOT LONGER
import AlarmIcon from '../AlarmIcon/AlarmIcon.tsx';

export default function StartSession() {
  return (
    <Button leftSection={<AlarmIcon size={20} />} variant={'filled'} radius={'md'} className='session-button'>
      Start Session
    </Button>
  );
}
