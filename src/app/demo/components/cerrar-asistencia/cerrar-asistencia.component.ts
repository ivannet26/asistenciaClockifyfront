import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TimerService } from '../../service/timer.service';

@Component({
  selector: 'app-cerrar-asistencia',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './cerrar-asistencia.component.html',
  styleUrl: './cerrar-asistencia.component.css'
})
export class CerrarAsistenciaComponent implements OnInit, OnDestroy {

  usuariosActivos: any[] = [];
  private intervalo: any;

  constructor(private messageService: MessageService, private timerService: TimerService) { }

  ngOnInit() {
    this.cargarDatos();
    this.intervalo = setInterval(() => this.cargarDatos(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  cargarDatos() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const timer = JSON.parse(localStorage.getItem('timer_activo') || '{}');

    if (timer?.inicio) {
      this.usuariosActivos = [{
        usuario: session.userData?.usuario || '-',
        correo: session.userData?.correo || '-',
        nombreCompleto: session.userData?.nombre || '-',
        dni: session.userData?.dni || '-',
        tiempoInicio: timer.inicio
      }];
    } else {
      this.usuariosActivos = [];
    }
  }

  calcularTiempo(inicio: string): string {
    const diffMs = new Date().getTime() - new Date(inicio).getTime();
    const totalS = Math.floor(diffMs / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  detenerAsistencia(user: any) {
    this.usuariosActivos = this.usuariosActivos.filter(u => u.dni !== user.dni);
    localStorage.setItem('asistencias_activas', JSON.stringify(this.usuariosActivos));

    // Aquí dispara la señal
    this.timerService.detenerDesdeAfuera$.next();

    this.messageService.add({
      severity: 'success',
      summary: 'Proceso Detenido',
      detail: `Se detuvo el temporizador de ${user.nombreCompleto}`
    });
  }
}