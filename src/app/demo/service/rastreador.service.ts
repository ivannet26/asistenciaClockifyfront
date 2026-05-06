import { Injectable } from '@angular/core';
import { Registro } from '../model/Registro';

@Injectable({ providedIn: 'root' })
export class RastreadorService {

  private readonly STORAGE_REGISTROS = 'registros';

  cargarRegistros(miembroId: number): Registro[] {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    return data
      .filter((r: any) => r.miembroId === miembroId)
      .map((r: any) => ({
        ...r,
        inicio: new Date(r.inicio),
        fin: new Date(r.fin)
      }));
  }

  guardarRegistro(nuevo: any): void {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const existe = data.find((r: any) =>
      new Date(r.inicio).getTime() === new Date(nuevo.inicio).getTime()
    );
    if (!existe) {
      data.unshift(nuevo);
      localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(data));
    }
  }

  actualizarRegistro(regActualizado: any): boolean {
    const todos = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const index = todos.findIndex((r: any) =>
      new Date(r.inicio).getTime() === new Date(regActualizado.inicio).getTime()
    );
    if (index !== -1) {
      todos[index] = regActualizado;
      localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(todos));
      return true;
    }
    return false;
  }

  eliminarRegistro(registro: any): void {
    const todos = JSON.parse(localStorage.getItem(this.STORAGE_REGISTROS) || '[]');
    const filtrados = todos.filter((r: any) =>
      new Date(r.inicio).getTime() !== new Date(registro.inicio).getTime()
    );
    localStorage.setItem(this.STORAGE_REGISTROS, JSON.stringify(filtrados));
  }

  agruparRegistros(registros: Registro[]): any[] {
    const mapa = new Map<string, any>();
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    registros.forEach(reg => {
      const fecha = new Date(reg.inicio);
      let clave = this.esMismaFecha(fecha, hoy) ? 'hoy' :
        this.esMismaFecha(fecha, ayer) ? 'ayer' : fecha.toDateString();

      let label = clave === 'hoy' ? 'Hoy' : clave === 'ayer' ? 'Ayer' :
        fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

      if (!mapa.has(clave)) {
        mapa.set(clave, { label, fecha, registros: [], totalMs: 0 });
      }

      const grupo = mapa.get(clave);
      grupo.registros.push(reg);
      grupo.totalMs += new Date(reg.fin).getTime() - new Date(reg.inicio).getTime();
    });

    return Array.from(mapa.values()).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  formatearTiempo(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  esMismaFecha(f1: Date, f2: Date): boolean {
    return f1.getFullYear() === f2.getFullYear() &&
      f1.getMonth() === f2.getMonth() &&
      f1.getDate() === f2.getDate();
  }
}
