import { Paper, Button, Modal, TextInput, FileInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import './Upload.css';
import React, { useRef } from 'react';
import { UploadFile, UploadLink } from '../../utils/UploadFile';
import FullCalendar from '@fullcalendar/react';

interface UploadProps {
  token: string,
  ref: React.RefObject<FullCalendar | null>
}

interface ImgErrorValidation {
  [key: string]: string
}

export default function Upload({ token, ref }: UploadProps) {
  const icsRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);
  const pdfRef = useRef<HTMLInputElement | null>(null);

  const [icsOpened, { open: openICSModal, close: closeICSModal }] = useDisclosure(false);
  const [imgOpened, { open: openImgModal, close: closeImgModal }] = useDisclosure(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files) {
      const file = e.target.files[0];
      UploadFile(file, fileType, token);
      if (fileType === "ics") {
        if (ref.current) {
          const calendarApi = ref.current.getApi();
          calendarApi.refetchEvents();
        }
      }
    }
  }

  const checkRefNull = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.click();
  }

  const handleLinksumbit = (values: { link: string }) => {
    UploadLink(values.link, token);
    icsLinkForm.reset();
    // code to handle how the calendar takes the ics link

  }

  const imgForm = useForm({
    initialValues: {
      uploadedFile: null,
      semesterStart: null,
      semesterEnd: null
    },

    validate: (values) => {
      const errors: ImgErrorValidation = {}
      if (values.uploadedFile === null) {
        errors.uploadedFile = "Please upload an image of your class schedule";
      }
      if (!values.semesterStart) {
        errors.semesterStart = "Please input a date for the start of your semester.";
      }
      if (!values.semesterEnd) {
        errors.semesterEnd = "Please input a date for the end of your semester.";
      }
      if (values.semesterStart && values.semesterEnd) {
        const start = new Date(values.semesterStart);
        const end = new Date(values.semesterEnd);
        if (end <= start) {
          errors.semesterEnd = "The end of your semester cannot be earlier than the start."
        }
      }

      return errors;
    }
  })

  const handleImgSubmit = async (values: any) => {
    console.log("Type of uploadedFile ", typeof values.uploadedFile);
    console.log("uploadedFile: ", values.uploadedFile);
    console.log("Type of semesterStart ", typeof values.semesterStart);
    console.log("semesterStart ", values.semesterStart);

    const endpoint = 'http://localhost:3000/api/upload-image';
    const formData = new FormData();
    formData.append('image', values.uploadedFile);
    formData.append('semesterStart', values.semesterStart);
    formData.append('semesterEnd', values.semesterEnd);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) { throw new Error("Image Upload Response was not ok"); }
      alert("File uploaded successfully.");
    } catch (error) {
      alert(error);
    }

  }

  const icsLinkForm = useForm({
    initialValues: {
      link: ''
    },

    validate: {
      link: (value) => (value.length === 0 ? "Empty input" : null)
    },
  });
  return (
    <div className='div-upload'>
      <Paper shadow='md' radius='md' className='upload' style={{ display: 'flex', marginRight: 'auto', gap: '1rem' }} w='50%'>
        Upload a file:
        <Modal opened={icsOpened} onClose={closeICSModal} title="Upload an ics file or link">
          <Button onClick={() => checkRefNull(icsRef)}>Upload an ics file</Button>
          <input type='file' ref={icsRef} accept='.ics, text/calendar' onChange={(e) => handleFileChange(e, 'ics')} style={{ display: 'none' }} />

          <form onSubmit={icsLinkForm.onSubmit(handleLinksumbit)}>
            <TextInput
              label="ICS Link"
              value={icsLinkForm.values.link}
              onChange={(event) => icsLinkForm.setFieldValue('link', event.currentTarget.value)}
            />
            <Button type='submit'>Upload Link</Button>

          </form>
        </Modal>
        <Button onClick={openICSModal}>Upload an ics file or link</Button>

        <Modal opened={imgOpened} onClose={closeImgModal} title="Upload your schedule as an image">
          <form onSubmit={imgForm.onSubmit(handleImgSubmit)}>
            <FileInput mt="md" label="Upload Schedule" placeholder="Click to select or drag file" {...imgForm.getInputProps('uploadedFile')} accept='image/png, image/jpg' />
            <DatePickerInput
              mt='md'
              placeholder='Start'
              label='Start of your Semester'
              withAsterisk
              valueFormat='YYYY-MM-DD'
              {...imgForm.getInputProps('semesterStart')}
            />
            <DatePickerInput
              mt='md'
              placeholder='End'
              label='End of your Semester'
              withAsterisk
              valueFormat='YYYY-MM-DD'
              {...imgForm.getInputProps('semesterEnd')}
            />
            <Button type='submit'>Submit</Button>
          </form>
        </Modal>
        <Button onClick={openImgModal}>Upload your schedule</Button>
        <input type='file' ref={imgRef} accept='image/*' onChange={(e) => handleFileChange(e, 'image')} style={{ display: 'none' }} />
        <Button onClick={() => checkRefNull(pdfRef)}>Upload your syllabus</Button>
        <input type='file' ref={pdfRef} accept='.pdf, application/pdf' onChange={(e) => handleFileChange(e, 'pdf')} style={{ display: 'none' }} />
      </Paper>
    </div>
  );
}
