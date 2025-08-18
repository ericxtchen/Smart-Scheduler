import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import iCalendarPlugin from '@fullcalendar/icalendar';
import { Paper } from '@mantine/core';
import { SupabaseClient } from '@supabase/supabase-js';
import './Calendar.css';
import { useState, useEffect } from 'react';
import GetUser from '../../utils/GetUser';
import { EventSourceInput } from '@fullcalendar/core/index.js';

interface CalendarProps {
  ref: React.RefObject<FullCalendar | null>,
  supabase: SupabaseClient
}

interface CalendarSource {
  calendarSourceId: string,
  color: string,
  calendarName: string,
  url: string | null,
  hasStoredEvents: boolean
}

export default function CalendarComponent({ ref, supabase }: CalendarProps) {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [eventSources, setEventSources] = useState<EventSourceInput[]>([]);

  useEffect(() => {
    const fetchEventSources = async () => {
      const userId = await GetUser(supabase);
      if (userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/user-calendar-sources/${userId}`);
          const calendarSources: CalendarSource[] = await response.json();
          const sources: EventSourceInput[] = calendarSources.map((source) => {
            if (source.hasStoredEvents) {
              return {
                url: `${API_BASE_URL}/api/events/${source.calendarSourceId}`,
                backgroundColor: source.color,
                textColor: '#ffffff'
              } as EventSourceInput;
            } else {
              return {
                url: `${API_BASE_URL}/api/ics-proxy/${source.url}`, // use backend as proxy to avoid CORS errors
                format: 'ics',
                backgroundColor: source.color,
                textColor: '#ffffff'
              } as EventSourceInput;
            }
          })
          setEventSources(sources);
        } catch (error) {
          alert("Error fetching events: " + error)
        }
      }
    }
    fetchEventSources();
  }, [supabase])

  return (
    <div className='calendar'>
      <Paper shadow="xl" radius="md" withBorder p="xl" style={{ width: '100vw' }}>
        <div style={{ height: '600px' }}>
          <FullCalendar
            ref={ref}
            plugins={[timeGridPlugin, iCalendarPlugin]}
            initialView='timeGridWeek'
            height={"100%"} // setting this to 100% messes up the calendar
            expandRows={true}
            eventSources={eventSources}
          // how to make the calendar shrink but make the rest of the calendar thats not intially visible scrollable to see
          //events={fetchEvents(token)}
          />
        </div>
      </Paper>
    </div>
  );
}
