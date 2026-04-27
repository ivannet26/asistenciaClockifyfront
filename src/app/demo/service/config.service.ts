import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private config: any = {};

    // Signal para el formato de duración. 
    // Intenta leer de localStorage al iniciar; si no existe, usa 'full'.
    public durationFormat = signal<'full' | 'short'>(
        (localStorage.getItem('pref_duration_format') as 'full' | 'short') || 'full'
    );

    // --- NUEVA SIGNAL PARA JERARQUÍA ---
    // Persiste el nombre personalizado (Ej: Proyecto, Trabajo, Ubicación)
    public jerarquia2Nombre = signal<string>(
        localStorage.getItem('pref_jerarquia2_nombre') || 'Proyecto'
    );

    constructor(private http: HttpClient) {}

    async loadConfig(): Promise<void> {
        try {
            this.config = await firstValueFrom(
                this.http.get('/assets/config.json')
            );
            (window as any).config = this.config;
        } catch (error) {
            console.error(' Error cargando config.json', error);
        }
    }

    // Método para actualizar el formato y persistirlo
    updateDurationFormat(label: string): void {
        const newFormat = (label && label.includes('hh:mm:ss')) ? 'full' : 'short';
        
        // Actualiza la señal (notifica a los pipes)
        this.durationFormat.set(newFormat);
        
        // Guarda la preferencia en el navegador
        localStorage.setItem('pref_duration_format', newFormat);
    }

    // --- NUEVO MÉTODO PARA ACTUALIZAR JERARQUÍA ---
    updateJerarquia2Nombre(nuevoNombre: string): void {
        if (nuevoNombre) {
            this.jerarquia2Nombre.set(nuevoNombre);
            localStorage.setItem('pref_jerarquia2_nombre', nuevoNombre);
        }
    }

    // --- TUS GETTERS ORIGINALES ---

    getConfig(key: string): any {
        return (window as any).config ? (window as any).config[key] : null;
    }

    getApiUrl(): string {
        return this.getConfig('url');
    }

    getRutaDoc(): string {
        return this.getConfig('rutaDoc');
    }

    getVersion(): string {
        return this.getConfig('appVersion');
    }

    getTheme(): string {
        return this.getConfig('theme');
    }

    getCodigoModulo(): string {
        return this.getConfig('codigoModulo');
    }

    getEstado() {
        return this.getConfig('estado');
    }

    getTipoAplicacion(): string {
        return this.getConfig('tipoAplicacion');
    }
}