import { Injectable } from '@angular/core';
import { Etiquetas } from './../model/Etiquetas';

@Injectable({
    providedIn: 'root'
})
export class EtiquetasService {
    private storageKey = 'etiquetas'

    getEtiquetas(): Etiquetas[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    agregarEtiqueta(nombre: string): Etiquetas[] {
        const etiquetas = this.getEtiquetas();
        const nuevo: Etiquetas = {
            id: Date.now(),
            nombre
        };
        etiquetas.push(nuevo);
        this.guardar(etiquetas);
        return etiquetas;
    }

    actualizarEtiqueta(id: number, cambios: Partial<Etiquetas>): Etiquetas[] {
        const etiquetas = this.getEtiquetas();
        const index = etiquetas.findIndex(c => c.id === id);

        if (index === -1) return etiquetas; // no encontrado, retorna sin cambios

        etiquetas[index] = { ...etiquetas[index], ...cambios };
        this.guardar(etiquetas);
        return etiquetas;
    }

    eliminarEtiqueta(id: number): Etiquetas[] {
        const etiquetas = this.getEtiquetas().filter(c => c.id !== id);
        this.guardar(etiquetas);
        return etiquetas;
    }

    private guardar(etiquetas: Etiquetas[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(etiquetas));
    }

}
