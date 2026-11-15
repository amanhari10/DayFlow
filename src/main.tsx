import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <PwaUpdatePrompt />
  </>
);
