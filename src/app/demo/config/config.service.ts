import { Injectable } from '@angular/core';
import { AppConfig, DEFAULT_CONFIG, UsuarioConfig, EspacioTrabajoConfig } from './config';

const STORAGE_KEY = 'app_config';

@Injectable({ providedIn: 'root' })
export class ConfigService {

    private config: AppConfig = this.load();

    // Carga desde localStorage, si no hay nada usa defaults
    private load(): AppConfig {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_CONFIG);

        try {
            return JSON.parse(raw) as AppConfig;
        } catch {
            return structuredClone(DEFAULT_CONFIG);
        }
    }

    // Guarda todo el config al localStorage
    private save(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }

    // Getters
    getConfig(): AppConfig {
        return this.config;
    }

    getUsuarioConfig() {
        return this.config.usuario;
    }

    getEspacioConfig() {
        return this.config.espacioTrabajo;
    }

    // Setters (actualizan y persisten)
    updateUsuarioConfig(changes: Partial<UsuarioConfig>): void {
        this.config.usuario = { ...this.config.usuario, ...changes };
        this.save();
    }

    updateEspacioConfig(changes: Partial<EspacioTrabajoConfig>): void {
        this.config.espacioTrabajo = { ...this.config.espacioTrabajo, ...changes };
        this.save();
    }

    // Útil para pruebas
    resetConfig(): void {
        this.config = structuredClone(DEFAULT_CONFIG);
        this.save();
    }
}