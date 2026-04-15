import { Injectable } from '@angular/core';
import { EspacioTrabajo } from '../model/EspacioTrabajo';

@Injectable({
    providedIn: 'root'
})
export class EspacioTrabajoService {

    private storageKey = 'espaciostrabajos';
    private activeKey = 'espaciotrabajo_activo';

    getEspacios(): EspacioTrabajo[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    getEspaciosPorMiembro(miembroId: number): EspacioTrabajo[] {

        return this.getEspacios().filter(e => e.miembroId === miembroId);
    }

    crearEspacio(nombre: string, miembroId: number): EspacioTrabajo {
        const espacios = this.getEspacios();
        const nuevo: EspacioTrabajo = {
            id: Date.now(),
            nombre,
            miembroId,
            fechaCreacion: new Date()
        };
        espacios.push(nuevo);
        this.guardar(espacios);
        return nuevo;
    }

    actualizarEspacio(id: number, cambios: Partial<EspacioTrabajo>): EspacioTrabajo[] {
        const espacios = this.getEspacios();
        const index = espacios.findIndex(e => e.id === id);
        if (index === -1) return espacios;
        espacios[index] = { ...espacios[index], ...cambios };
        this.guardar(espacios);
        return espacios;
    }

    eliminarEspacio(id: number): EspacioTrabajo[] {
        const espacios = this.getEspacios().filter(e => e.id !== id);
        this.guardar(espacios);
        return espacios;
    }

    // ─── Workspace activo en sesión ────────────────────────────────────────────

    /** Guarda el id del workspace que el usuario tiene seleccionado */
    setEspacioActivo(id: number): void {
        sessionStorage.setItem(this.activeKey, String(id));
    }

    /** Devuelve el id del workspace activo, o null si no hay ninguno */
    getEspacioActivoId(): number | null {
        const val = sessionStorage.getItem(this.activeKey);
        return val ? Number(val) : null;
    }

    /** Devuelve el objeto del workspace activo */
    getEspacioActivo(): EspacioTrabajo | null {
        const id = this.getEspacioActivoId();
        if (id === null) return null;
        return this.getEspacios().find(e => e.id === id) ?? null;
    }

    clearEspacioActivo(): void {
        sessionStorage.removeItem(this.activeKey);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    /**
     * Llamar al iniciar sesión: si el usuario ya tiene workspace lo activa,
     * si no lo tiene se crea uno por defecto con su nombre.
     */
    initEspacioParaMiembro(miembroId: number, nombreMiembro: string): void {
        let espacio = this.getEspacios().find(e => e.miembroId === miembroId);
        if (!espacio) {
            espacio = this.crearEspacio(`Workspace de ${nombreMiembro}`, miembroId);
        }
        this.setEspacioActivo(espacio.id);
    }

    private guardar(espacios: EspacioTrabajo[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(espacios));
    }
}
