import { Paper, Button, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import './Upload.css';
import React, { useRef } from 'react';
import { UploadFile, UploadLink } from '../../utils/UploadFile';
import { Session } from '@supabase/supabase-js';

export default function Upload({ token }: { token: string }) {
  const icsRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);
  const pdfRef = useRef<HTMLInputElement | null>(null);

  const [opened, {open, close}] = useDisclosure(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files) {
      const file = e.target.files[0];
      UploadFile(file, fileType, token);
    }
  }

  const checkRefNull = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.click();
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
        <Modal opened={opened} onClose={close} title="Upload an ics file or link">
          <Button onClick={() => checkRefNull(icsRef)}>Upload an ics file</Button>
          <input tyoe='file' ref={icsRef} accept='.ics, text/calendar' onChange={(e) => handleFileChange(e, 'ics')} style={{display: 'none'}} />

          <form onSubmit={icsLinkForm.onSubmit((value) => UploadLink(value))}>
            <TextInput
              label="ICS Link"
              value={icsLinkForm.values.link}
              onChange={(event) => icsLinkForm.setFieldValue('link', event.currentTarget.value)}
            />
          </form>
        </Modal>
        <Button onClick={open}>Upload an ics file or link</Button>
        <Button onClick={() => checkRefNull(imgRef)}>Upload your schedule</Button>
        <input type='file' ref={imgRef} accept='image/*' onChange={(e) => handleFileChange(e, 'image')} style={{ display: 'none' }} />
        <Button onClick={() => checkRefNull(pdfRef)}>Upload your syllabus</Button>
        <input type='file' ref={pdfRef} accept='.pdf, application/pdf' onChange={(e) => handleFileChange(e, 'pdf')} style={{ display: 'none' }} />
      </Paper>
    </div>
  );
}
