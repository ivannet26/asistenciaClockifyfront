import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TabMenuModule } from 'primeng/tabmenu';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from "primeng/toast";
import { MultiSelectModule } from 'primeng/multiselect';

import { GruposService } from '../../service/grupos.service';
import { MiembrosService } from '../../service/miembros.service';
import { Miembros, RolNombre } from '../../model/Miembro';
import { Grupo } from '../../model/Grupo';
import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [
    CardModule, CommonModule, ButtonModule, TableModule, DropdownModule,
    CheckboxModule, TabMenuModule, InputTextModule, MultiSelectModule,
    FormsModule, ToastModule, DialogModule
  ],
  providers: [MessageService],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css'
})
export class EquipoComponent implements OnInit {

  @ViewChild('dt') dt!: Table;
  @ViewChild('dts') dts!: Table;
  mostrarModalMiembro = false;
  mostrarLista = false;
  grupos: Grupo[] = [];
  gruposConIntegrantes: Grupo[] = [];
  miembros: Miembros[] = [];

  miembrosFiltrados: Miembros[] = [];
  gruposFiltrados: Grupo[] = [];
  filtroNombre: string = '';
  filtroTodo: any = 'todos';
  filtroRol: RolNombre | null = null;
  filtroGrupo: number | null = null;
  filtroBusquedaGrupo: string = '';

  rolesOptions = Object.values(RolNombre).map(rol => ({ label: rol, value: rol }));
  grupoOptions: { label: string; value: number }[] = [];
  miembrosOptions: { nombre: string; id: number }[] = [];

  nuevoGrupo: Grupo = { id: 0, nombre: '' };
  nuevoMiembro: Miembros = { id: 0, nombre: '', correo: '', contrasena: '', rol: undefined, grupoIds: undefined, activo: true };

  miembroEnEdicion: number | null = null;
  grupoEnEdicion: number | null = null;

  tabs = [
    { label: 'Miembros', id: 0 },
    { label: 'Grupos', id: 1 },
  ];
  tabactivo = this.tabs[0];

  constructor(
    private messageService: MessageService,
    private gruposService: GruposService,
    private miembrosService: MiembrosService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.miembros = this.miembrosService.getMiembros().filter(m => m.activo);
    this.grupos = this.gruposService.getGrupos();
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.mostrarLista = this.miembros.length > 0;

    this.aplicarFiltrosMiembros();
    this.aplicarFiltrosGrupos();
    this.cargarOptions();
  }

  cargarOptions() {
    this.grupoOptions = this.gruposService.getGrupos().map(g => ({
      label: g.nombre, value: g.id
    }));
    this.miembrosOptions = this.miembrosService.getMiembros()
      .filter(m => m.activo)
      .map(m => ({ nombre: m.nombre, id: m.id }));
  }

  get todoOptions() {
    const listaMiembros = this.miembros.map(m => ({ label: m.nombre, value: m.nombre }));
    return [
      { label: 'Todos', value: 'todos' },
      { label: 'Ninguno', value: 'ninguno' },
      ...listaMiembros
    ];
  }

  aplicarFiltrosMiembros() {
    if (this.filtroTodo === 'ninguno') {
      this.miembrosFiltrados = [];
      return;
    }
    this.miembrosFiltrados = this.miembros.filter(m => {
      const coincideMiembro = this.filtroTodo === 'todos' || m.nombre === this.filtroTodo;
      const cumpleRol = !this.filtroRol || m.rol === this.filtroRol;
      const cumpleGrupo = !this.filtroGrupo || (m.grupoIds && m.grupoIds.includes(this.filtroGrupo));
      // ── filtro de búsqueda por nombre ──
      const cumpleBusqueda = !this.filtroNombre ||
        m.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      return coincideMiembro && cumpleRol && cumpleGrupo && cumpleBusqueda;
    });
  }

  aplicarFiltrosGrupos() {
    this.gruposFiltrados = this.gruposConIntegrantes.filter(g =>
      !this.filtroBusquedaGrupo || g.nombre.toLowerCase().includes(this.filtroBusquedaGrupo.toLowerCase())
    );
  }

  guardarMiembro() {
    const nombre = this.nuevoMiembro.nombre?.trim();
    const correo = this.nuevoMiembro.correo?.trim();
    const contrasena = this.nuevoMiembro.contrasena?.trim();
    if (!nombre || !correo) return;

    const nuevos = this.miembrosService.agregarMiembro(nombre, correo, contrasena);
    if (this.nuevoMiembro.rol) {
      const agregado = nuevos[nuevos.length - 1];
      this.miembrosService.actualizarMiembro(agregado.id, { rol: this.nuevoMiembro.rol });
    }

    this.messageService.add({ severity: 'success', summary: 'Miembro Creado', detail: `${this.nuevoMiembro.nombre} fue agregado correctamente` });
    this.nuevoMiembro = { id: 0, nombre: '', correo: '', contrasena: undefined, rol: undefined, activo: true };
    this.mostrarModalMiembro = false;
    this.cargarDatos();
  }

guardarCambiosMiembro(miembro: Miembros) {
  // 1. Guardar el miembro con sus nuevos datos
  this.miembrosService.actualizarMiembro(miembro.id, miembro);

  // 2. Sincronizar los grupos (igual que en guardarMiembrosAGrupo)
  const todosLosGrupos = this.gruposService.getGrupos();

  todosLosGrupos.forEach(grupo => {
    const miembrosActuales = grupo.miembrosIds ?? [];
    const debePertenecer = miembro.grupoIds?.includes(grupo.id) ?? false;

    let nuevosMiembros: number[];
    if (debePertenecer && !miembrosActuales.includes(miembro.id)) {
      nuevosMiembros = [...miembrosActuales, miembro.id];
    } else if (!debePertenecer && miembrosActuales.includes(miembro.id)) {
      nuevosMiembros = miembrosActuales.filter(id => id !== miembro.id);
    } else {
      return; // Sin cambios en este grupo
    }

    this.gruposService.actualizarGrupo(grupo.id, {
      nombre: grupo.nombre,
      miembrosIds: nuevosMiembros
    });
  });

  this.messageService.add({ severity: 'info', summary: 'Actualizado', detail: 'Cambios guardados' });
  this.cargarDatos();
}

  guardarGrupo() {
    const nombre = this.nuevoGrupo.nombre?.trim();
    if (!nombre) return;
    this.gruposService.agregarGrupo(nombre);
    this.messageService.add({ severity: 'success', summary: 'Grupo Creado', detail: `${this.nuevoGrupo.nombre} fue agregado correctamente` });
    this.nuevoGrupo = { id: 0, nombre: '' };
    this.cargarDatos();
  }


  eliminarGrupo(id: number) {
    this.gruposService.eliminarGrupo(id);
    this.messageService.add({
      severity: 'error',
      summary: 'Registro Eliminado',
      detail: `El proyecto fue eliminado correctamente`
    });
    this.cargarDatos();
  }

  guardarMiembrosAGrupo(grupo: Grupo) {
    const miembrosGlobales = this.miembrosService.getMiembros();

    miembrosGlobales.forEach(m => {
      if (!m.grupoIds) m.grupoIds = [];
      const debeEstar = grupo.miembrosIds?.includes(m.id) ?? false;
      if (debeEstar && !m.grupoIds.includes(grupo.id)) {
        m.grupoIds.push(grupo.id);
      } else if (!debeEstar) {
        m.grupoIds = m.grupoIds.filter(gid => gid !== grupo.id);
      }
    });

    this.miembrosService.guardarTodos(miembrosGlobales);
    this.gruposService.actualizarGrupo(grupo.id, {
      nombre: grupo.nombre,
      miembrosIds: grupo.miembrosIds ?? []
    });

    this.messageService.add({ severity: 'warn', summary: 'Grupo Actualizado', detail: 'Grupo actualizado correctamente' });
    this.cargarDatos();
  }

  getGruposConIntegrantes(): Grupo[] {
    const grupos = this.gruposService.getGrupos();
    const miembros = this.miembrosService.getMiembros();
    return grupos.map(grupo => {
      const integrantes = miembros.filter(m => m.grupoIds?.includes(grupo.id));
      return {
        ...grupo,
        miembros: integrantes,
        miembrosIds: integrantes.map(m => m.id)
      };
    });
  }

  getNombreGrupo = (id?: number) => this.grupos.find(g => g.id === id)?.nombre || '';

  CambioTab(event: any) { this.tabactivo = event; }

  exportarMiembros(): void {
    ExtraccionExcel.desdeTabla(
      this.dt,
      (p, i) => ({
        'N°': i + 1,
        'Nombre': p.nombre,
        'Correo': p.correo,
        'Rol': p.rol,
        'Grupo': (p.grupoIds || [])
          .map((id: number) => this.getNombreGrupo(id))
          .join(', '),
      }),
      'Equipo-Miembros'
    );
  }

  abrirModalNuevoMiembro() {
    this.nuevoMiembro = {
      id: 0, nombre: '', correo: '',
      contrasena: '', rol: undefined,
      grupoIds: undefined, activo: true
    };
    this.mostrarModalMiembro = true;
  }

  editarMiembro(id: number) {
    this.miembroEnEdicion = id;
  }

  desactivarMiembro(id: number) {
    this.miembrosService.desactivarMiembro(id);
    this.messageService.add({
      severity: 'warn',
      summary: 'Desactivado',
      detail: 'Miembro desactivado correctamente'
    });
    this.cargarDatos();
  }

  exportarGrupos(): void {
    ExtraccionExcel.desdeTabla(
      this.dts,
      (p, i) => ({
        'N°': i + 1,
        'Nombre': p.nombre,
        'Miembros': (p.miembros || [])
          .map((m: any) => m.nombre)
          .join(', '),
      }),
      'Equipo-Grupos'
    );
  }
}