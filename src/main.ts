import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';



// Función para cargar la configuración antes de arrancar Angular
async function loadConfig(): Promise<void> {
  try {
    const response = await fetch('/assets/config.json');
    const config = await response.json();
    (window as any).config = config;

  } catch (error) {
    //console.error("Error al cargar config.json, usando valores por defecto.");
    (window as any).config = { apiUrl: '' }; // Configuración por defecto
  }
}

// Cargar configuración y luego iniciar Angular
loadConfig().then(() => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
});

