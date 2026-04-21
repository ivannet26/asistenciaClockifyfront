import { Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly STORAGE_KEY = 'timer_activo';
  
  corriendo = signal<boolean>(false);
  tiempoTranscurrido = signal<string>('00:00:00');
  tareaActual = signal<string>('');
  proyectoSeleccionado = signal<any>(null);

  public inicioTiempo: Date | null = null;
  private intervalo: any = null;

  constructor(private titleService: Title) {
    
  }

  // Método para que el componente le ordene revivir
  remanecer(data: any) {
    this.inicioTiempo = new Date(data.inicio);
    this.tareaActual.set(data.descripcion || '');
    this.proyectoSeleccionado.set(data.proyecto || null);
    this.corriendo.set(true);
    this.iniciarIntervalo();
  }

  start(inicio: Date, descripcion: string, proyecto: any, facturable: boolean, etiquetas: string[]) {
    this.inicioTiempo = inicio;
    this.tareaActual.set(descripcion);
    this.proyectoSeleccionado.set(proyecto);
    this.corriendo.set(true);
    this.guardarProgreso(facturable, etiquetas);
    this.iniciarIntervalo();
  }

  iniciarIntervalo() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.intervalo = setInterval(() => {
      if (!this.inicioTiempo) return;
      const ahora = new Date();
      const diffMs = ahora.getTime() - this.inicioTiempo.getTime();
      const tiempoStr = this.formatear(diffMs);
      this.tiempoTranscurrido.set(tiempoStr);
      this.titleService.setTitle(`${tiempoStr} • Clockify`);
      this.guardarProgreso();
    }, 1000);
  }

  private guardarProgreso(facturable?: boolean, etiquetas?: string[]) {
    const actual = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const backup = {
      inicio: this.inicioTiempo,
      fin: new Date().getTime(),
      descripcion: this.tareaActual(),
      proyecto: this.proyectoSeleccionado(),
      facturable: facturable !== undefined ? facturable : actual.facturable,
      etiquetas: etiquetas || actual.etiquetas || []
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backup));
  }

  stop() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.corriendo.set(false);
    this.tiempoTranscurrido.set('00:00:00');
    this.tareaActual.set('');
    this.proyectoSeleccionado.set(null);
    this.titleService.setTitle('Clockify');
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private formatear(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}