export default async function UploadICSLink(token: string, link: string) {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  try {
    const endpoint = `${API_BASE_URL}/api/upload-ics-link`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: link,
    });

    if (!response.ok) alert('Link upload failed');
    alert('Link uploaded successfully');
  } catch (error) {
    if (error instanceof Error) {
      alert(`Error: ${error.message}`);
      console.log(error);
    }
  }
}
