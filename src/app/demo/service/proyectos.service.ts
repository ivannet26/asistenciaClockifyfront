import { Injectable } from '@angular/core';
import { Proyecto } from '../model/Proyecto';

@Injectable({
    providedIn: 'root'
})
export class ProyectosService {

    private storageKey = 'proyectos';

    getProyectos(): Proyecto[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    agregarProyecto(
        nombre: string,
        clienteId: number,
        color: string,
        publico: boolean,
        progreso: number,
        activo: boolean,
        fcreacion: Date
    ): Proyecto[] {

        const proyectos = this.getProyectos();

        const nuevo: Proyecto = {
            id: Date.now(),
            nombre,
            clienteId,
            color,
            publico,
            progreso,
            activo: true,
            fcreacion: new Date(),
        };

        proyectos.push(nuevo);
        this.guardar(proyectos);
        return proyectos;
    }

    actualizarProyecto(id: number, cambios: Partial<Proyecto>): Proyecto[] {
        const proyecto = this.getProyectos();
        const index = proyecto.findIndex(c => c.id === id);

        if (index === -1) return proyecto;

        proyecto[index] = { ...proyecto[index], ...cambios };
        this.guardar(proyecto);
        return proyecto;
    }

    eliminarProyecto(id: number): Proyecto[] {
        const proyecto = this.getProyectos().filter(c => c.id !== id);
        this.guardar(proyecto);
        return proyecto;
    }

    private guardar(proyecto: Proyecto[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(proyecto));
    }

}