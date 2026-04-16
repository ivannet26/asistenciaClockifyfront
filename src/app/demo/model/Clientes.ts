import { Monedas } from './Monedas';

export interface Clientes {
    id: number;
    nombre: string;
    direccion: string | null;
    moneda: Monedas | null;
}