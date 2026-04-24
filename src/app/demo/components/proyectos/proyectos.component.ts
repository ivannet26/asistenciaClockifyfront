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
import { CardModule } from "primeng/card";

import { MessageService } from 'primeng/api';
import { ToastModule } from "primeng/toast";

import { PermissionService } from '../../service/permission.service';
import { Observable } from 'rxjs';
import { FavoritosService } from '../../service/favoritoproyecto.service';

import { AppAjustes } from '../../service/appajustes.service';

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
    CardModule,
    ToastModule
  ],
  providers: [DatePipe, MessageService],
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

  jerarquia2Nombre = 'Proyecto';

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

  canCreateP$!: Observable<boolean>;
  canfavorito$!: Observable<boolean>;

  private favoritosService = new FavoritosService();
  private usuarioActualId: number = JSON.parse(localStorage.getItem('userSession') || '{}').userData?.id;
  constructor(
    private proyectosService: ProyectosService,
    private clientesService: ClientesService,
    private datepipe: DatePipe,
    private messageService: MessageService,
    private permissionService: PermissionService,
    private appAjustes: AppAjustes
  ) {
    
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProyectos();
    this.canfavorito$ = this.permissionService.canDo('activeFavorito');
    this.canCreateP$ = this.permissionService.canDo('createProject');
    this.appAjustes.config$.subscribe(config => {
      this.jerarquia2Nombre = config.espacioTrabajo.jerarquia2Nombre;
    });
  }

  get mostrarLista(): boolean {
    return this.proyectos.length > 0;
  }

  cargarProyectos(): void {
    this.proyectos = this.proyectosService.getProyectos();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const favoritosIds = this.favoritosService.getFavoritosDeUsuario(this.usuarioActualId);

    this.proyectosFiltrados = this.proyectos.filter(p => {
      const estadoProyecto = (p as any).activo !== undefined ? (p as any).activo : true;

      const cumpleEstado = this.filtroEstado === 'Todos' ||
        (this.filtroEstado === 'Activo' ? estadoProyecto : !estadoProyecto);

      const cumpleCliente = !this.filtroCliente || p.clienteId === this.filtroCliente.id;

      const cumpleAcceso = this.filtroAcceso === 'Todos' ||
        (this.filtroAcceso === 'Público' ? p.publico : !p.publico);

      const cumpleNombre = !this.filtroNombre ||
        p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      return cumpleEstado && cumpleCliente && cumpleAcceso && cumpleNombre;
    })
      .sort((a, b) => {
        const aFav = favoritosIds.includes(a.id) ? 1 : 0;
        const bFav = favoritosIds.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      });
  }

  abrirModalNuevoProyecto(): void {
    this.cargarClientes();
    this.mostrarModalProyecto = true;
  }

  guardarProyecto(): void {
    if (!this.nuevoProyecto.nombre?.trim())
      return this.messageService.add({
        severity: 'info',
        summary: 'Campos Vacios',
        detail: `Campo de nombre vacio`
      });

    this.messageService.add({
      severity: 'success',
      summary: 'Proyecto Creado',
      detail: `${this.nuevoProyecto.nombre} fue agregado correctamente`
    });

    const clienteId = this.nuevoProyecto.cliente?.id ?? 0;

    this.proyectos = this.proyectosService.agregarProyecto(
      this.nuevoProyecto.nombre,
      clienteId,
      this.nuevoProyecto.color,
      this.nuevoProyecto.publico,
      0,
      true,
      new Date(),
    );

    this.mostrarModalProyecto = false;
    this.resetFormulario();
    this.aplicarFiltros();
  }

  actualizarProyecto(id: number, cambios: any): void {
    this.proyectos = this.proyectosService.actualizarProyecto(id, cambios);
    this.aplicarFiltros();

    const tieneSoloCambiosDeEstado = Object.keys(cambios).every(
      k => k === 'activo' || k === 'publico'
    );

    if (tieneSoloCambiosDeEstado) {
      if ('activo' in cambios) {
        this.messageService.add({
          severity: cambios.activo ? 'success' : 'warn',
          summary: cambios.activo ? 'Proyecto Activado' : 'Proyecto Archivado',
          detail: cambios.activo
            ? 'El proyecto fue activado exitosamente'
            : 'El proyecto fue archivado exitosamente'
        });
      }

      if ('publico' in cambios) {
        this.messageService.add({
          severity: cambios.publico ? 'success' : 'warn',
          summary: cambios.publico ? 'Proyecto Público' : 'Proyecto Privado',
          detail: cambios.publico
            ? 'El proyecto ahora es visible al público'
            : 'El proyecto ahora es privado'
        });
      }

    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Proyecto Actualizado',
        detail: 'Los datos del proyecto fueron actualizados exitosamente'
      });
    }
  }

  esFavorito(proyectoId: number): boolean {
    return this.favoritosService.esFavorito(this.usuarioActualId, proyectoId);
  }

  toggleFavorito(proyectoId: number): void {
    this.favoritosService.toggleFavorito(this.usuarioActualId, proyectoId);
    this.aplicarFiltros(); // re-ordena
  }

  eliminarProyecto(id: number): void {
    this.proyectos = this.proyectosService.eliminarProyecto(id);
    this.aplicarFiltros();
    this.messageService.add({
      severity: 'error',
      summary: 'Registro Eliminado',
      detail: `El proyecto fue eliminado correctamente`
    });
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
        'Tiempo Registrado': this.getTiempoProyecto(p.id!),
        'Acceso': p.publico ? 'Público' : 'Privado',
        'Estado': p.activo ? 'Activo' : 'Archivado',
        'FCreacion': this.datepipe.transform(p.fcreacion, 'dd/MM/yyyy HH:mm'),
      }),
      'Proyectos'
    );
  }

  getTiempoProyecto(proyectoId: number): string {
    const data = JSON.parse(localStorage.getItem('registros') || '[]');

    const totalMs = data
      .filter((r: any) => r.proyecto?.id === proyectoId)
      .reduce((acc: number, r: any) => {
        const inicio = new Date(r.inicio).getTime();
        const fin = new Date(r.fin).getTime();
        return acc + (fin - inicio);
      }, 0);

    return this.formatearTiempo(totalMs);
  }

  formatearTiempo(ms: number): string {
    const totalS = Math.floor(ms / 1000);
    const h = Math.floor(totalS / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalS % 3600) / 60).toString().padStart(2, '0');
    const s = (totalS % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
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

