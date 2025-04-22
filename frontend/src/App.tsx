import { useState } from 'react'
import './App.css'
import Calendar from './components/Calendar/Calendar.tsx'
import Header from './components/Header/Header.tsx'
import { MantineProvider } from '@mantine/core'

function App() {
  return (
    <MantineProvider>
      {<>
        <Header />
        <Calendar />
      </>
      }
    </MantineProvider>
  );
}

export default App;
