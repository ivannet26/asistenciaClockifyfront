import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { AppConfig, DEFAULT_CONFIG } from '../model/Config';

@Injectable({ providedIn: 'root' })
export class AppAjustes {

    private configSubject = new BehaviorSubject<AppConfig>(DEFAULT_CONFIG);
    config$ = this.configSubject.asObservable();

    constructor(private http: HttpClient) {
        this.inicializar();
    }

    private inicializar() {
        const enStorage = localStorage.getItem('appConfig');

        if (enStorage) {
            const parsed = JSON.parse(enStorage);
            this.configSubject.next(this.merge(parsed));
        } else {
            this.http.get<AppConfig>('/src/assets/Ajustes.json').pipe(
                tap(config => {
                    this.configSubject.next(this.merge(config));

                    localStorage.setItem('appConfig', JSON.stringify(config));
                })
            ).subscribe();
        }
    }

    private merge(parsed: Partial<AppConfig>): AppConfig {
        return {
            ...DEFAULT_CONFIG,
            ...parsed,
            usuario: { ...DEFAULT_CONFIG.usuario, ...parsed.usuario },
            espacioTrabajo: { ...DEFAULT_CONFIG.espacioTrabajo, ...parsed.espacioTrabajo }
        };
    }

    private save(config: AppConfig) {
        this.configSubject.next(config);
        localStorage.setItem('appConfig', JSON.stringify(config));
    }

    getConfig(): AppConfig {
        return this.configSubject.value;
    }

    patchUsuario(partial: Partial<AppConfig['usuario']>) {
        this.save({
            ...this.configSubject.value,
            usuario: { ...this.configSubject.value.usuario, ...partial }
        });
    }

    patchEspacioTrabajo(partial: Partial<AppConfig['espacioTrabajo']>) {
        this.save({
            ...this.configSubject.value,
            espacioTrabajo: { ...this.configSubject.value.espacioTrabajo, ...partial }
        });
    }

    resetToAssets() {
        localStorage.removeItem('appConfig');
        this.inicializar();
    }
}