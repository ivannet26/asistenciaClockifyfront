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
    const grupos = this.getGrupos();
    const nuevo: Grupo = {
      id: Date.now(),
      nombre,
      miembros: [],    // Inicializado como arreglo vacío
      miembrosIds: []  // Inicializado como arreglo vacío
    };
    grupos.push(nuevo);
    this.guardar(grupos);
    return grupos;
  }

  actualizarGrupo(id: number, cambios: Partial<Grupo>): Grupo[] {
    const grupos = this.getGrupos();
    const index = grupos.findIndex(c => c.id === id);

    if (index === -1) return grupos;

    grupos[index] = { ...grupos[index], ...cambios };
    this.guardar(grupos);
    return grupos;
  }

  eliminarGrupo(id: number): Grupo[] {
    const grupos = this.getGrupos().filter(c => c.id !== id);
    this.guardar(grupos);
    return grupos;
  }

  private guardar(grupos: Grupo[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(grupos));
  }
}