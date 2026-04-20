import { Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly STORAGE_KEY = 'timer_activo';
  
  corriendo = signal<boolean>(false);
  tiempoTranscurrido = signal<string>('00:00:00');
  
  // ESTAS SON LAS LÍNEAS QUE FALTABAN:
  tareaActual = signal<string>('');
  proyectoSeleccionado = signal<any>(null);

  public inicioTiempo: Date | null = null;
  private intervalo: any = null;

  constructor(private titleService: Title) {
    this.revivirTimer();
  }

  private revivirTimer() {
    const guardado = localStorage.getItem(this.STORAGE_KEY);
    if (guardado) {
      const data = JSON.parse(guardado);
      this.inicioTiempo = new Date(data.inicio);
      
      // Recuperamos también la descripción y el proyecto
      this.tareaActual.set(data.descripcion || '');
      this.proyectoSeleccionado.set(data.proyecto || null);
      
      this.corriendo.set(true);
      this.iniciarIntervalo();
    }
  }

  start(inicio: Date, descripcion: string, proyecto: any, facturable: boolean, etiquetas: string[]) {
    this.inicioTiempo = inicio;
    this.tareaActual.set(descripcion);
    this.proyectoSeleccionado.set(proyecto);
    this.corriendo.set(true);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      inicio: this.inicioTiempo,
      descripcion,
      proyecto,
      facturable,
      etiquetas
    }));

    this.iniciarIntervalo();
  }

  iniciarIntervalo() {
    if (this.intervalo) clearInterval(this.intervalo);
    
    this.intervalo = setInterval(() => {
      if (!this.inicioTiempo) return;
      const diffMs = new Date().getTime() - this.inicioTiempo.getTime();
      const tiempoStr = this.formatear(diffMs);
      this.tiempoTranscurrido.set(tiempoStr);
      this.titleService.setTitle(`${tiempoStr} • Clockify`);
    }, 1000);
  }

  stop() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.corriendo.set(false);
    this.tiempoTranscurrido.set('00:00:00');
    this.tareaActual.set(''); // Limpiamos al detener
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