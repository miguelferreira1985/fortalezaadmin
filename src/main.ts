import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { Tooltip, Modal } from 'bootstrap';

bootstrapApplication(App, appConfig)
  .then(() => {
        // Iniciar todos los tooltips en el DOM
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
          new Tooltip(el);
        });
    
        // Si también usas modales, puedes inicializarlos aquí:
        document.querySelectorAll('.modal').forEach((el) => {
          new Modal(el);
        });
  })
  .catch((err) => console.error(err));
