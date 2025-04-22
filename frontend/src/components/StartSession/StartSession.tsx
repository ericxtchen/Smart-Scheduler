import { Button } from '@mantine/core';
import { IconAlarm } from '@tabler/icons-react';

export default function StartSession() {
  return (
    <Button leftSection={<IconAlarm size={14} />} variant={'filled'} radius={'md'}>
      Start Session
    </Button>
  );
}
