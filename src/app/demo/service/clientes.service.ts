import { Injectable } from '@angular/core';
import { Clientes } from '../model/Clientes';

@Injectable({
    providedIn: 'root'
})
export class ClientesService {

    private storageKey = 'clientes';

    getClientes(): Clientes[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    agregarCliente(nombre: string): Clientes[] {
        const clientes = this.getClientes();
        const nuevo: Clientes = {
            id: Date.now(),
            nombre,
            direccion: null,
            moneda: null
        };
        clientes.push(nuevo);
        this.guardar(clientes);
        return clientes;
    }

    actualizarCliente(id: number, cambios: Partial<Clientes>): Clientes[] {
        const clientes = this.getClientes();
        const index = clientes.findIndex(c => c.id === id);

        if (index === -1) return clientes; // no encontrado, retorna sin cambios

        clientes[index] = { ...clientes[index], ...cambios };
        this.guardar(clientes);
        return clientes;
    }

    eliminarCliente(id: number): Clientes[] {
        const clientes = this.getClientes().filter(c => c.id !== id);
        this.guardar(clientes);
        return clientes;
    }

    private guardar(clientes: Clientes[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(clientes));
    }

}