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
import './home-dashboard.css';
import './home-chapter-path.css';
import { initializeBrand } from './brand-variant';
import { AccountProvider, useAccounts } from './AccountContext';

initializeBrand();

function AccountApp() {
  const { activeAccount } = useAccounts();
  return <NarraProvider key={activeAccount.id}><PlayerProvider><App /></PlayerProvider></NarraProvider>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><AccountProvider><AccountApp /></AccountProvider></React.StrictMode>);
