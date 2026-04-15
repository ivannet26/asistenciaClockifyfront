import { Monedas } from './Monedas';

export interface Clientes {
    id: number;
    nombre: string;
    //espaciotrabajoId: number;
    direccion: string | null;
    moneda: Monedas | null;
}