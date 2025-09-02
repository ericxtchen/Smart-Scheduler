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
        const allSources = [] as EventSourceInput[];
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
          allSources.push(...sources);
          // Fetch PDF events
          allSources.push({
            url: `${API_BASE_URL}/api/pdf-events/${userId}`,
            backgroundColor: '#34D399', // Tailwind green-400
            textColor: '#ffffff'
          })
          // Fetch Schedule events
          allSources.push({
            url: `${API_BASE_URL}/api/schedule-events/${userId}`,
            backgroundColor: '#F59E0B', // Tailwind yellow-500
            textColor: '#ffffff'
          })
          setEventSources(allSources);
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
            height={"100%"}
            expandRows={true}
            eventSources={eventSources}
          />
        </div>
      </Paper>
    </div>
  );
}
