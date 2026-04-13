import { Injectable } from '@angular/core';
import { Miembros } from '../model/Miembro';

@Injectable({
    providedIn: 'root'
})
export class MiembrosService {

    private storageKey = 'miembros';

    getMiembros(): Miembros[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    agregarMiembro(nombre: string, correo: string): Miembros[] {
        const miembro = this.getMiembros();
        const nuevo: Miembros = {
            id: Date.now(),
            nombre,
            correo,
            rol: undefined,
            grupoIds: undefined,
            activo: true
        };
        miembro.push(nuevo);
        this.guardar(miembro);
        return miembro;
    }

    actualizarMiembro(id: number, cambios: Partial<Miembros>): Miembros[] {
        const miembro = this.getMiembros();
        const index = miembro.findIndex(c => c.id === id);

        if (index === -1) return miembro;

        miembro[index] = { ...miembro[index], ...cambios };
        this.guardar(miembro);
        return miembro;
    }

    eliminarMiembro(id: number): Miembros[] {
        const miembro = this.getMiembros().filter(c => c.id !== id);
        this.guardar(miembro);
        return miembro;
    }

    desactivarMiembro(id: number): Miembros[] {
        return this.actualizarMiembro(id, { activo: false } as any);
    }

    private guardar(miembro: Miembros[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(miembro));
    }

}