import { Paper, Button, Modal, TextInput, FileInput, Stack, Alert, LoadingOverlay } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import './Upload.css';
import React, { useRef, useState } from 'react';
import { UploadFile, UploadLink } from '../../utils/UploadFile';
import FullCalendar from '@fullcalendar/react';

import { ScheduleValidationForm } from './ScheduleValidationForm';
import { FullParsingResult } from '../../types/schedule';

interface UploadProps {
  token: string,
  ref: React.RefObject<FullCalendar | null>
}

interface ImgErrorValidation {
  [key: string]: string
}

export default function Upload({ token, ref: calendarRef }: UploadProps) {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const icsRef = useRef<HTMLInputElement | null>(null);
  const pdfRef = useRef<HTMLInputElement | null>(null);

  const [parsedData, setParsedData] = useState<FullParsingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [icsOpened, { open: openICSModal, close: closeICSModal }] = useDisclosure(false);
  const [imgOpened, { open: openImgModal, close: closeImgModal }] = useDisclosure(false);
  const [validationOpened, { open: openValidationModal, close: closeValidationModal }] = useDisclosure(false);

  const [semStart, setSemStart] = useState(null);
  const [semEnd, setSemEnd] = useState(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files) {
      const file = e.target.files[0];
      UploadFile(file, fileType, token);
      if (fileType === "ics") {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
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

  const handleImgParse = async (values: any) => {
    setIsLoading(true);
    setError(null);

    setSemStart(values.semesterStart);
    setSemEnd(values.semesterEnd);

    const endpoint = `${API_BASE_URL}/api/upload-image`;
    const formData = new FormData();
    formData.append('image', values.uploadedFile);
    formData.append('semesterStart', (new Date(values.semesterStart)).toISOString());
    formData.append('semesterEnd', (new Date(values.semesterEnd)).toISOString());

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

      const data: FullParsingResult = await response.json();
      setParsedData(data);
      closeImgModal();
      openValidationModal();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occured.");
      alert(error);
    } finally {
      setIsLoading(false);
    }

  }

  const handleFinalSubmit = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/schedules/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: parsedData, semesterStart: semStart, semesterEnd: semEnd })
      });
      if (!response.ok) {
        throw new Error("Failed to save the scheudle.");
      }

      alert("Schedule saved successfully!");
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
      closeValidationModal();
      imgForm.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occured.");
    } finally {
      setIsLoading(false);
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
        {/* ICS UPLOAD MODAL */}
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
        {/* IMAGE UPLOAD MODAL */}
        <Modal opened={imgOpened} onClose={closeImgModal} title="Upload your schedule as an image">
          <LoadingOverlay visible={isLoading} />
          <form onSubmit={imgForm.onSubmit(handleImgParse)}>
            <Stack>
              {error && <Alert color="red" title="Error">{error}</Alert>}
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
            </Stack>
          </form>
        </Modal>
        <Button onClick={openImgModal}>Upload your schedule</Button>
        {/* SCHEDULE VALIDATION MODAL */}
        <Modal opened={validationOpened} onClose={closeValidationModal} size="xl" title="Review Parsed Schedule">
          <LoadingOverlay visible={isLoading} />
          {error && <Alert color="red" title="Error" onClose={() => setError(null)} withCloseButton>{error}</Alert>}
          {parsedData && (
            <ScheduleValidationForm
              scheduleData={parsedData}
              setScheduleData={setParsedData}
              onFinalSubmit={handleFinalSubmit}
              isSubmitting={isLoading}
            />
          )}
        </Modal>
        <Button onClick={() => checkRefNull(pdfRef)}>Upload your syllabus</Button>
        <input type='file' ref={pdfRef} accept='.pdf, application/pdf' onChange={(e) => handleFileChange(e, 'pdf')} style={{ display: 'none' }} />
      </Paper>
    </div>
  );
}
