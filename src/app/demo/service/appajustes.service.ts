import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppConfig, DEFAULT_CONFIG } from '../model/Config';

@Injectable({ providedIn: 'root' })
export class AppAjustes {

    
    private configSubject = new BehaviorSubject<AppConfig>(
        this.loadConfig()
    );

    config$ = this.configSubject.asObservable();

    getConfig(): AppConfig {
        return this.configSubject.value;
    }

    patchEspacioTrabajo(partial: Partial<AppConfig['espacioTrabajo']>) {
        this.configSubject.next({
            ...this.configSubject.value,
            espacioTrabajo: {
                ...this.configSubject.value.espacioTrabajo,
                ...partial,
            },
        });
    }

private loadConfig(): AppConfig {
    const saved = localStorage.getItem('appConfig');
    if (!saved) return DEFAULT_CONFIG;
    
    const parsed = JSON.parse(saved);
    return {
        ...DEFAULT_CONFIG,
        ...parsed,
        espacioTrabajo: {
            ...DEFAULT_CONFIG.espacioTrabajo,
            ...parsed.espacioTrabajo,
        },
        usuario: {
            ...DEFAULT_CONFIG.usuario,
            ...parsed.usuario,
        }
    };
}
}