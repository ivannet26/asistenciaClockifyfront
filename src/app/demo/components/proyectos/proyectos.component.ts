import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { Proyecto } from '../../model/Proyecto';
import { ProyectosService } from '../../service/proyectos.service';
import { ClientesService } from '../../service/clientes.service';
import { Clientes } from '../../model/Clientes';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    OverlayPanelModule,
    TableModule,
    InputTextModule,
    DropdownModule,
  ],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent implements OnInit {

  mostrarModalProyecto: boolean = false;
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = null;

  clientes: Clientes[] = [];

  nuevoProyecto: {
    nombre: string;
    cliente: Clientes | null;
    color: string;
    publico: boolean;
  } = {
      nombre: '',
      cliente: null,
      color: '#5c6bc0',
      publico: true
    };

  constructor(
    private proyectosService: ProyectosService, private clientesService: ClientesService) { }

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarClientes();
  }

  cargarProyectos(): void {
    this.proyectos = this.proyectosService.getProyectos();
  }

  abrirModalNuevoProyecto(): void {
    this.cargarClientes();
    this.mostrarModalProyecto = true;
  }

  guardarProyecto(): void {
    if (!this.nuevoProyecto.nombre?.trim()) return;

    const clienteId = this.nuevoProyecto.cliente?.id ?? 0;

    this.proyectos = this.proyectosService.agregarProyecto(
      this.nuevoProyecto.nombre,
      clienteId,
      this.nuevoProyecto.color,
      this.nuevoProyecto.publico,
      0
    );

    this.proyectoSeleccionado = this.proyectos[this.proyectos.length - 1];
    this.mostrarModalProyecto = false;
    this.resetFormulario();
  }

  actualizarProyecto(id: number, cambios: Partial<Proyecto>): void {
    this.proyectos = this.proyectosService.actualizarProyecto(id, cambios);
  }

  eliminarProyecto(id: number): void {
    this.proyectos = this.proyectosService.eliminarProyecto(id);
    if (this.proyectoSeleccionado?.id === id) {
      this.proyectoSeleccionado = null;
    }
  }

  dividirRegistro(proyecto: Proyecto): void {
    console.log('Establecer como plantilla:', proyecto);
  }

  duplicarRegistro(proyecto: Proyecto): void {
    console.log('Archivar:', proyecto);
  }

  private resetFormulario(): void {
    this.nuevoProyecto = {
      nombre: '',
      cliente: null,
      color: '#5c6bc0',
      publico: true
    };
  }

  cargarClientes(): void {
    this.clientes = this.clientesService.getClientes();
  }

  getNombreCliente(clienteId: number): string {
    if (!clienteId) return 'Sin cliente';
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente?.nombre ?? 'Sin cliente';
  }

}