import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Paper } from '@mantine/core';
import fetchEvents from '../../utils/FetchEvents.ts';
import './Calendar.css';
import { useState, useEffect} from 'react';

interface CalendarProps {
  token: string,
  ref: React.RefObject<FullCalendar | null>
}

export default function CalendarComponent({ token, ref}: CalendarProps) {
  const [events, setEvents] = useState([]);

  //useEffect(() => {
  //  fetchEvents(token);
  //}, [])

  return (
    <div className='calendar'>
      <Paper shadow="xl" radius="md" withBorder p="xl" style={{ width: '100vw' }}>
        <div style={{ height: '600px' }}>
          <FullCalendar
            ref={ref}
            plugins={[timeGridPlugin]}
            initialView='timeGridWeek'
            height={"100%"} // setting this to 100% messes up the calendar
            expandRows={true}
            // how to make the calendar shrink but make the rest of the calendar thats not intially visible scrollable to see
            //events={fetchEvents(token)}
          />
        </div>
      </Paper>
    </div>
  );
}
