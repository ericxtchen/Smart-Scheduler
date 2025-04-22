import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Paper } from '@mantine/core'
import './Calendar.css';

export default function Calendar() {
  return (
    <div className='calendar'>
      <Paper shadow="xl" radius="md" withBorder p="xl" style={{ width: '100vw' }}>
        <div style={{ height: '600px' }}>
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView='timeGridWeek'
            height={"100%"} // setting this to 100% messes up the calendar 
            expandRows={true}
          // how to make the calendar shrink but make the rest of the calendar thats not intially visible scrollable to see
          />
        </div>
      </Paper>
    </div>
  );
}
