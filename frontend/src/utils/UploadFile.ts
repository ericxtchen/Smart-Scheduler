interface UploadFileProps {
  file: File;
  fileType: string;
}

export default async function UploadFile(file: File, fileType: string, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const endpoint = `http://localhost:3000/api/upload-${fileType}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer: ${token}`
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
