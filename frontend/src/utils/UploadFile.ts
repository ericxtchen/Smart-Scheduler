export async function UploadFile(file: File, fileType: string, token: string) {
  const formData = new FormData();
  formData.append(fileType, file);
  console.log(fileType);

  try {
    const endpoint = `http://localhost:3000/api/upload-${fileType}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Upload Failed.");
    alert("File uploaded successfully!");
  } catch (error) {
    if (error instanceof Error) {
      alert(`Error: ${error.message}`);
      console.log(error);
    }
  }
}

export async function UploadLink(link: string, token: string) {
  try {
    const endpoint = "http://localhost:3000/api/upload-ics-link";
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: link }),
    });

    if (!response.ok) throw new Error("Link Upload Failed"); // maybe an error from backend validation can be thrown to the frontend via the reponse and subsquently thrown here?
    alert("Link uploaded successfully!");
  } catch (error) {
    if (error instanceof Error) {
      alert(`Error: ${error.message}`);
      console.log(error);
    }
  }
}
