import { Injectable } from '@angular/core';
import { Miembros, RolNombre } from '../model/Miembro';

@Injectable({
    providedIn: 'root'
})
export class MiembrosService {

    private storageKey = 'miembros';

    getMiembros(): Miembros[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    agregarMiembro(nombre: string, correo: string, contrasena: string): Miembros[] {
        const miembro = this.getMiembros();
        const nuevo: Miembros = {
            id: Date.now(),
            nombre,
            correo,
            contrasena,
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

    guardarTodos(miembros: Miembros[]): void {
        this.guardar(miembros);
    }

    desactivarMiembro(id: number): Miembros[] {
        return this.actualizarMiembro(id, { activo: false } as any);
    }

    private guardar(miembro: Miembros[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(miembro));
    }

    login(correo: string, contrasena: string): Miembros | null {
        const miembros = this.getMiembros();
        const encontrado = miembros.find(
            (m) => m.correo === correo && m.contrasena === contrasena && m.activo
        );
        return encontrado ?? null;
    }
    initDefaultMiembro(): void {
        const existing = this.getMiembros();

        // Solo crea el usuario por defecto si la lista está vacía
        if (existing.length === 0) {
            const defaultMiembro: Miembros = {
                id: Date.now(),
                nombre: 'Administrador',
                correo: 'admin@correo.com',
                contrasena: 'admin123',
                rol: RolNombre.ADMINISTRADOR,
                grupoIds: [],
                activo: true
            };
            this.guardar([defaultMiembro]);
        }
    }

}