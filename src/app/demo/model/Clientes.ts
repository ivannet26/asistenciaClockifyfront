export enum Moneda {
    USD = 'USD',
    SOLES = 'SOLES',
}

export interface Clientes {
    id: number;
    nombre: string;
    Direccion: string | null;
    Moneda: Moneda | null;
}