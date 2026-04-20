import { Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  
  corriendo = signal<boolean>(false);
  tiempoTranscurrido = signal<string>('00:00:00');
  
  // Agregamos signals para los datos adicionales
  tareaActual = signal<string>('');
  proyectoSeleccionado = signal<any>(null);

  public inicioTiempo: Date | null = null;
  private intervalo: any = null;

  constructor(private titleService: Title) {}

  // AHORA SÍ: Acepta los 5 argumentos
  start(inicio: Date, descripcion: string, proyecto: any, facturable: boolean, etiquetas: string[]) {
    this.inicioTiempo = inicio;
    this.tareaActual.set(descripcion);
    this.proyectoSeleccionado.set(proyecto);
    this.corriendo.set(true);
    
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
    this.titleService.setTitle('Clockify');
  }

  private formatear(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}