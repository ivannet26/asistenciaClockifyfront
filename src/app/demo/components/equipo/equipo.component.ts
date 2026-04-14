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

  // Lógica de Filtrado
  miembrosFiltrados: Miembros[] = [];
  gruposFiltrados: Grupo[] = [];

  // Modelos de Filtro
  filtroTodo: string = 'todos';
  filtroRol: RolNombre | null = null;
  filtroGrupo: number | null = null;
  filtroBusquedaGrupo: string = '';

  // Opciones Dropdowns
  todoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ninguno', value: 'ninguno' }
  ];
  rolesOptions = Object.values(RolNombre).map(rol => ({ label: rol, value: rol }));
  grupoOptions: { label: string; value: number }[] = [];
  miembrosOptions: { nombre: string; id: number }[] = [];

  // Modelos de Creación
  nuevoGrupo: Grupo = { id: 0, nombre: '' };
  nuevoMiembro: Miembros = { id: 0, nombre: '', correo: '', contrasena: undefined, rol: undefined, grupoIds: undefined, activo: true };

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

  // ── Lógica de Filtros (Todo, Rol, Grupo) ──────────────────────

  aplicarFiltrosMiembros() {
    if (this.filtroTodo === 'ninguno') {
      this.miembrosFiltrados = [];
      return;
    }

    this.miembrosFiltrados = this.miembros.filter(m => {
      const cumpleRol = !this.filtroRol || m.rol === this.filtroRol;
      const cumpleGrupo = !this.filtroGrupo || (m.grupoIds && m.grupoIds.includes(this.filtroGrupo));
      return cumpleRol && cumpleGrupo;
    });
  }

  aplicarFiltrosGrupos() {
    this.gruposFiltrados = this.gruposConIntegrantes.filter(g =>
      !this.filtroBusquedaGrupo || g.nombre.toLowerCase().includes(this.filtroBusquedaGrupo.toLowerCase())
    );
  }

  // ── Miembros ─────────────────────────────────────────────────

  abrirModalNuevoMiembro() { this.mostrarModalMiembro = true; }

  guardarMiembro() {
    const nombre = this.nuevoMiembro.nombre?.trim();
    const correo = this.nuevoMiembro.correo?.trim();
    const contrasena = this.nuevoMiembro.correo?.trim();
    if (!nombre || !correo) return;

    const nuevos = this.miembrosService.agregarMiembro(nombre, correo, contrasena);
    if (this.nuevoMiembro.rol) {
      const agregado = nuevos[nuevos.length - 1];
      this.miembrosService.actualizarMiembro(agregado.id, { rol: this.nuevoMiembro.rol });
    }

    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Miembro añadido' });
    this.nuevoMiembro = { id: 0, nombre: '', correo: '',contrasena: undefined, rol: undefined, activo: true };
    this.mostrarModalMiembro = false;
    this.cargarDatos();
  }

  guardarCambiosMiembro(miembro: Miembros) {
    this.miembrosService.actualizarMiembro(miembro.id, miembro);
    this.cargarDatos();
  }

  editarMiembro(id: number) { this.miembroEnEdicion = id; }

  desactivarMiembro(id: number) {
    this.miembrosService.desactivarMiembro(id);
    this.cargarDatos();
  }

  // ── Grupos ───────────────────────────────────────────────────

  guardarGrupo() {
    const nombre = this.nuevoGrupo.nombre?.trim();
    if (!nombre) return;
    this.gruposService.agregarGrupo(nombre);
    this.nuevoGrupo = { id: 0, nombre: '' };
    this.cargarDatos();
  }

  eliminarGrupo(id: number) {
    this.gruposService.eliminarGrupo(id);
    this.cargarDatos();
  }

  guardarMiembrosAGrupo(grupo: Grupo) {
    const miembros = this.miembrosService.getMiembros();
    miembros.forEach(m => {
      if (!m.grupoIds) m.grupoIds = [];
      if (grupo.miembrosIds?.includes(m.id)) {
        if (!m.grupoIds.includes(grupo.id)) m.grupoIds.push(grupo.id);
      } else {
        m.grupoIds = m.grupoIds.filter(gid => gid !== grupo.id);
      }
      this.miembrosService.actualizarMiembro(m.id, { grupoIds: m.grupoIds });
    });
    this.cargarDatos();
  }

  getGruposConIntegrantes(): Grupo[] {
    const grupos = this.gruposService.getGrupos();
    const miembros = this.miembrosService.getMiembros();
    return grupos.map(grupo => ({
      ...grupo,
      miembros: miembros.filter(m => m.grupoIds?.includes(grupo.id)),
      miembrosIds: miembros.filter(m => m.grupoIds?.includes(grupo.id)).map(m => m.id)
    }));
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