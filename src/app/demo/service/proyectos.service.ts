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
        favorito: boolean,
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
            favorito: false,
            fcreacion: new Date(),
        };

        proyectos.push(nuevo);
        this.guardar(proyectos);
        return proyectos;
    }

    actualizarProyecto(id: number, cambios: Partial<Proyecto>): Proyecto[] {
        const proyectos = this.getProyectos();
        const index = proyectos.findIndex(c => c.id === id);

        if (index === -1) return proyectos;

        const { favorito, ...cambiosSinFavorito } = cambios;
        proyectos[index] = { ...proyectos[index], ...cambiosSinFavorito };
        this.guardar(proyectos);
        return proyectos;
    }

    toggleFavorito(id: number): Proyecto[] {
        const proyectos = this.getProyectos();
        const index = proyectos.findIndex(p => p.id === id);

        if (index === -1) return proyectos;

        proyectos[index].favorito = !proyectos[index].favorito;
        this.guardar(proyectos);
        return proyectos;
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