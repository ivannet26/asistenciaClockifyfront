import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { Proyecto } from '../../model/Proyecto';
import { ProyectosService } from '../../service/proyectos.service';
import { ClientesService } from '../../service/clientes.service';
import { Clientes } from '../../model/Clientes';
import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';

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
  providers: [DatePipe],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent implements OnInit {

  @ViewChild('dt') dt!: Table;
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
    publico: true,
  };

  proyectoEditandoId: number | null = null;
  editBuffer: {
    nombre: string;
    cliente: Clientes | null;
    publico: boolean;
    progreso: number;
  } = { nombre: '', cliente: null, publico: true, progreso: 0 };



  constructor(
    private proyectosService: ProyectosService,
    private clientesService: ClientesService,
    private datepipe: DatePipe
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
      0,
      new Date(),
      true,
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

  archivarRegistro(proyecto: Proyecto): void {
    this.actualizarProyecto(proyecto.id!, { activo: false } as any);
  }

  activarRegistro(proyecto: Proyecto): void {
    this.actualizarProyecto(proyecto.id!, { activo: true } as any);
  }

  exportar(): void {
    ExtraccionExcel.desdeTabla(
      this.dt,
      (p, i) => ({
        'N°': i + 1,
        'Nombre del Proyecto': p.nombre,
        'Cliente': this.getNombreCliente(p.clienteId),
        'Progreso': p.progreso + '%',
        'Registrado': this.datepipe.transform(p.registrado, 'dd/MM/yyyy HH:mm'),
        'Acceso': p.publico ? 'Público' : 'Privado',
        'Estado': p.activo ? 'Activo' : 'Archivado'
      }),
      'Proyectos'
    );
  }

  //edicion

  iniciarEdicion(proyecto: Proyecto): void {
    this.proyectoEditandoId = proyecto.id!;
    this.editBuffer = {
      nombre: proyecto.nombre,
      cliente: this.clientes.find(c => c.id === proyecto.clienteId) ?? null,
      publico: proyecto.publico,
      progreso: proyecto.progreso
    };
  }

  guardarEdicion(proyecto: Proyecto): void {
    this.actualizarProyecto(proyecto.id!, {
      nombre: this.editBuffer.nombre,
      clienteId: this.editBuffer.cliente?.id ?? 0,
      publico: this.editBuffer.publico,
      progreso: this.editBuffer.progreso
    });
    this.proyectoEditandoId = null;
  }

  cancelarEdicion(): void {
    this.proyectoEditandoId = null;
  }

}