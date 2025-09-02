//TODO:
//Create api endpoint to fetch calendar events
//Use the getApi() method on the calendar to refresh events with the refetchEvents() method using a button


export default async function fetchEvents(token: string) {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  try {
    const endpoint = `${API_BASE_URL}/api/calendar/events`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error("Failed to get events.")
    const eventsData = await response.json();

    return eventsData;
  } catch (error) {
    if (error instanceof Error) {
      alert(`Error: ${error.message}`);
    }

    return [];
  }
}

