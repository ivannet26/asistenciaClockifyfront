import { Injectable } from '@angular/core';
import { Tarea } from '../model/Tarea';

@Injectable({ providedIn: 'root' })
export class TareasService {

  private storageKey = 'tareas';

  getTareas(): Tarea[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getTareasPorProyecto(proyectoId: number): Tarea[] {
    return this.getTareas().filter(t => t.proyectoId === proyectoId);
  }

  agregarTarea(proyectoId: number, nombre: string): Tarea[] {
    const tareas = this.getTareas();
    const nueva: Tarea = {
      id: Date.now(),
      proyectoId,
      nombre,
      prioridad: 'ninguna',
      completada: false,
      fcreacion: new Date()
    };
    tareas.push(nueva);
    this.guardar(tareas);
    return tareas;
  }

  actualizarTarea(id: number, cambios: Partial<Tarea>): Tarea[] {
    const tareas = this.getTareas();
    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
      tareas[index] = { ...tareas[index], ...cambios };
      this.guardar(tareas);
    }
    return tareas;
  }

  eliminarTarea(id: number): Tarea[] {
    const tareas = this.getTareas().filter(t => t.id !== id);
    this.guardar(tareas);
    return tareas;
  }

  private guardar(tareas: Tarea[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tareas));
  }
}
