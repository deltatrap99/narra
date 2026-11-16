import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { NarraProvider } from './state';
import { PlayerProvider } from './game';
import './styles.css';
import '../assets/design-tokens.css';
import './brand.css';
import './refined.css';
import './dark-polish.css';
import './readability.css';
import './brand-option5.css';
import './focus-layout.css';
import { initializeBrand } from './brand-variant';

initializeBrand();

createRoot(document.getElementById('root')!).render(<React.StrictMode><NarraProvider><PlayerProvider><App /></PlayerProvider></NarraProvider></React.StrictMode>);
