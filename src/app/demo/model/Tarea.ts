export interface Tarea {
  id: number;
  proyectoId: number;
  nombre: string;
  descripcion?: string;
  asignadoA?: number;       // miembroId
  asignadoNombre?: string;  // nombre del miembro
  prioridad: 'alta' | 'media' | 'baja' | 'ninguna';
  completada: boolean;
  fcreacion: Date;
}
