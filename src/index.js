import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppWrapper from './context';
import { MantineProvider } from '@mantine/core';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
          fontFamily: 'Roboto, sans-serif',
          primaryColor: 'orange',
        }}>
        <App />
      </MantineProvider>
    </AppWrapper>
  </React.StrictMode>
);
