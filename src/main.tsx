import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NarraProvider } from './state';
import './styles.css';
import '../assets/design-tokens.css';
import './brand.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><NarraProvider><App /></NarraProvider></React.StrictMode>);
