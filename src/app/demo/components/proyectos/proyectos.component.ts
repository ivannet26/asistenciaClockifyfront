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
  proyectosFiltrados: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = null;
  clientes: Clientes[] = [];

  // Modelos para Filtros
  filtroNombre: string = '';
  filtroEstado: string = 'Activo';
  filtroCliente: Clientes | null = null;
  filtroAcceso: string = 'Todos';

  // Opciones Dropdowns
  opcionesEstado = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Archivado', value: 'Archivado' },
    { label: 'Todos', value: 'Todos' }
  ];

  opcionesAcceso = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Público', value: 'Público' },
    { label: 'Privado', value: 'Privado' }
  ];

  nuevoProyecto = {
    nombre: '',
    cliente: null as Clientes | null,
    color: '#5c6bc0',
    publico: true
  };

  constructor(
    private proyectosService: ProyectosService, 
    private clientesService: ClientesService
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.proyectos = this.proyectosService.getProyectos();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.proyectosFiltrados = this.proyectos.filter(p => {
      // Usamos 'as any' para leer 'activo' aunque no esté en la interfaz
      const estadoProyecto = (p as any).activo !== undefined ? (p as any).activo : true;
      
      const cumpleEstado = this.filtroEstado === 'Todos' || 
                           (this.filtroEstado === 'Activo' ? estadoProyecto : !estadoProyecto);

      const cumpleCliente = !this.filtroCliente || p.clienteId === this.filtroCliente.id;

      const cumpleAcceso = this.filtroAcceso === 'Todos' || 
                           (this.filtroAcceso === 'Público' ? p.publico : !p.publico);

      const cumpleNombre = !this.filtroNombre || 
                           p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      return cumpleEstado && cumpleCliente && cumpleAcceso && cumpleNombre;
    });
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

    this.mostrarModalProyecto = false;
    this.resetFormulario();
    this.aplicarFiltros();
  }

  actualizarProyecto(id: number, cambios: any): void {
    this.proyectos = this.proyectosService.actualizarProyecto(id, cambios);
    this.aplicarFiltros();
  }

  eliminarProyecto(id: number): void {
    this.proyectos = this.proyectosService.eliminarProyecto(id);
    this.aplicarFiltros();
  }

  private resetFormulario(): void {
    this.nuevoProyecto = { nombre: '', cliente: null, color: '#5c6bc0', publico: true };
  }

  cargarClientes(): void {
    this.clientes = this.clientesService.getClientes();
  }

  getNombreCliente(clienteId: number): string {
    if (!clienteId) return 'Sin cliente';
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente?.nombre ?? 'Sin cliente';
  }

  dividirRegistro(proyecto: Proyecto): void { console.log('Plantilla:', proyecto); }
  
  duplicarRegistro(proyecto: Proyecto): void {
    // Aquí usamos el casteo para evitar el error de la propiedad 'activo'
    this.actualizarProyecto(proyecto.id!, { activo: false } as any);
  }
}