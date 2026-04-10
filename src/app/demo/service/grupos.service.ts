import { Injectable } from '@angular/core';
import { Grupo } from '../model/Grupo';

@Injectable({
    providedIn: 'root'
})
export class GruposService {

    private storageKey = 'grupos';

    getGrupos(): Grupo[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    agregarGrupo(nombre: string): Grupo[] {
        const grupo = this.getGrupos();
        const nuevo: Grupo = {
            id: Date.now(),
            nombre,
            miembros: null,
            miembrosIds: null,
        };
        grupo.push(nuevo);
        this.guardar(grupo);
        return grupo;
    }

    actualizarGrupo(id: number, cambios: Partial<Grupo>): Grupo[] {
        const grupo = this.getGrupos();
        const index = grupo.findIndex(c => c.id === id);

        if (index === -1) return grupo; // no encontrado, retorna sin cambios

        grupo[index] = { ...grupo[index], ...cambios };
        this.guardar(grupo);
        return grupo;
    }

    eliminarGrupo(id: number): Grupo[] {
        const grupo = this.getGrupos().filter(c => c.id !== id);
        this.guardar(grupo);
        return grupo;
    }

    private guardar(grupo: Grupo[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(grupo));
    }

}