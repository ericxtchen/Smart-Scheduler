import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Paper } from '@mantine/core';
import fetchEvents from '../../utils/FetchEvents.ts';
import './Calendar.css';

export default function Calendar({ token }: { token: string }) {
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
            events={fetchEvents}
          />
        </div>
      </Paper>
    </div>
  );
}
