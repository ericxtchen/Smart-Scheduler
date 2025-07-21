//TODO:
//Create api endpoint to fetch calendar events
//Use the getApi() method on the calendar to refresh events with the refetchEvents() method using a button


export default async function fetchEvents(token: string) {
  try {
    const endpoint = "http://localhost:3000/api/calendar/events";
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

