import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from "primeng/paginator";
import { MiembrosService } from '../../service/miembros.service';
import { Miembros, RolNombre } from '../../model/Miembro';

@Component({
  selector: 'app-micuenta',
  standalone: true,
  imports: [
    CardModule,
    ToastModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    PaginatorModule
],
  providers: [MessageService],
  templateUrl: './micuenta.component.html',
  styleUrl: './micuenta.component.css'
})
export class MicuentaComponent implements OnInit {

  userData: Miembros | null = null;
  edicion = false;

  datosEditados: Partial<Miembros> = {};

    constructor(
    private miembrosService: MiembrosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');

    if (session?.isAuthenticated) {
      const id: number = session.userData.id;
      this.cargarMiembro(id);
    }
  }

  cargarMiembro(id: number): void {
    const miembros = this.miembrosService.getMiembros();
    this.userData = miembros.find(m => m.id === id) ?? null;

    if (this.userData) {
      this.datosEditados = { ...this.userData };
    }
  }

  editarMiembro(estado: boolean): void {
    this.edicion = estado;

    if (!estado && this.userData) {
      this.datosEditados = { ...this.userData };
    }
  }

  guardarCambios(): void {
  if (!this.userData) return;

  const { nombre, correo, contrasena } = this.datosEditados;

  if (!nombre?.trim() || !correo?.trim() || !contrasena?.trim()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Campos vacíos',
      detail: 'Por favor completa todos los campos antes de guardar.'
    });
    return; // ← corta la ejecución, no guarda nada
  }

  const actualizados = this.miembrosService.actualizarMiembro(
    this.userData.id,
    this.datosEditados
  );

  this.userData = actualizados.find(m => m.id === this.userData!.id) ?? null;

  const session = JSON.parse(localStorage.getItem('userSession') || '{}');
  session.userData = this.userData;
  localStorage.setItem('userSession', JSON.stringify(session));

  this.edicion = false;

  this.messageService.add({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Datos actualizados correctamente'
  });
}


}
