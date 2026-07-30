// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './css/globals.css';

// La interfaz puede abrirse sin conexión si ya fue instalada/cargada antes.
// No se almacenan respuestas de API: ventas, stock y caja siempre se validan online.
const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm('Hay una nueva versión disponible. ¿Deseas actualizar ahora?')) {
      updateSW(true);
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
