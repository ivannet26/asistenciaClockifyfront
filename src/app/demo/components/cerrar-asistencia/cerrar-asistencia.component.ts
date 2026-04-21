import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cerrar-asistencia',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './cerrar-asistencia.component.html',
  styleUrl: './cerrar-asistencia.component.css'
})
export class CerrarAsistenciaComponent implements OnInit {
  
  usuariosActivos: any[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Intentamos leer la lista de usuarios con timer activo
    const data = localStorage.getItem('asistencias_activas');
    this.usuariosActivos = data ? JSON.parse(data) : [];
  }

  detenerAsistencia(user: any) {
    // 1. Quitamos al usuario de la lista visual
    this.usuariosActivos = this.usuariosActivos.filter(u => u.dni !== user.dni);
    
    // 2. Actualizamos el LocalStorage global
    localStorage.setItem('asistencias_activas', JSON.stringify(this.usuariosActivos));
    
    // 3. Mostramos el mensaje de éxito
    this.messageService.add({
      severity: 'success', 
      summary: 'Proceso Detenido', 
      detail: `Se detuvo el temporizador de ${user.nombreCompleto}`
    });
  }
}