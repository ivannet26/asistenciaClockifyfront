import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
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

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CheckboxModule,
    TabMenuModule,
    InputTextModule,
    MultiSelectModule,
    FormsModule,
    ToastModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css'
})
export class EquipoComponent implements OnInit {

  mostrarModalMiembro = false;
  mostrarLista = false;

  grupos: Grupo[] = [];
  gruposConIntegrantes: Grupo[] = [];
  miembros: Miembros[] = [];

  nuevoGrupo: Grupo = { id: 0, nombre: '' };
  nuevoMiembro: Miembros = { id: 0, nombre: '', correo: '', rol: undefined, grupoIds: undefined, activo: true };

  rolesOptions = Object.values(RolNombre).map(rol => ({ label: rol, value: rol }));
  grupoOptions: { label: string; value: number }[] = [];
  miembrosOptions: { nombre: string; id: number }[] = [];

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

  // ── Carga de datos ───────────────────────────────────────────

  cargarDatos() {
    this.miembros = this.miembrosService.getMiembros().filter(m => m.activo);
    this.grupos = this.gruposService.getGrupos();
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.mostrarLista = this.miembros.length > 0;
    this.cargarOptions();
  }

  cargarOptions() {
    this.grupoOptions = this.gruposService.getGrupos().map(g => ({
      label: g.nombre,
      value: g.id
    }));

    this.miembrosOptions = this.miembrosService.getMiembros()
      .filter(m => m.activo)
      .map(m => ({
        nombre: m.nombre,
        id: m.id
      }));
  }
  // ── Grupos ───────────────────────────────────────────────────
  guardarGrupo() {
    const nombre = this.nuevoGrupo.nombre?.trim();

    if (!nombre) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre del grupo es requerido.' });
      return;
    }

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/;
    if (!soloLetras.test(nombre)) {
      this.messageService.add({ severity: 'warn', summary: 'Formato inválido', detail: 'Solo puede contener letras, números y espacios.' });
      return;
    }

    if (nombre.length < 3) {
      this.messageService.add({ severity: 'warn', summary: 'Nombre muy corto', detail: 'Debe tener al menos 3 caracteres.' });
      return;
    }

    if (nombre.length > 30) {
      this.messageService.add({ severity: 'warn', summary: 'Nombre muy largo', detail: 'No puede superar los 30 caracteres.' });
      return;
    }

    const existe = this.gruposService.getGrupos().some(
      g => g.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: `Ya existe un grupo con el nombre "${nombre}".` });
      return;
    }

    this.gruposService.agregarGrupo(nombre);
    this.messageService.add({ severity: 'success', summary: 'Grupo guardado', detail: `"${nombre}" fue creado correctamente.` });

    this.nuevoGrupo = { id: 0, nombre: '' };
    this.cargarDatos();
  }

  editarGrupo(id: number) {
    this.grupoEnEdicion = id;
  }

  eliminarGrupo(id: number) {
    this.gruposService.eliminarGrupo(id);
    this.cargarDatos();
  }

  // ── Miembros ─────────────────────────────────────────────────

  abrirModalNuevoMiembro() {
    this.mostrarModalMiembro = true;
  }

  guardarMiembro() {
    const nombre = this.nuevoMiembro.nombre?.trim();
    const correo = this.nuevoMiembro.correo?.trim();

    if (!nombre) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre del miembro es requerido.' });
      return;
    }

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    if (!soloLetras.test(nombre)) {
      this.messageService.add({ severity: 'warn', summary: 'Formato inválido', detail: 'El nombre solo puede contener letras y espacios.' });
      return;
    }

    if (nombre.length < 3) {
      this.messageService.add({ severity: 'warn', summary: 'Nombre muy corto', detail: 'El nombre debe tener al menos 3 caracteres.' });
      return;
    }

    if (nombre.length > 50) {
      this.messageService.add({ severity: 'warn', summary: 'Nombre muy largo', detail: 'El nombre no puede superar los 50 caracteres.' });
      return;
    }

    if (!correo) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El correo es requerido.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      this.messageService.add({ severity: 'warn', summary: 'Correo inválido', detail: 'Ingresa un correo electrónico válido.' });
      return;
    }

    const miembros = this.miembrosService.getMiembros();

    if (miembros.some(m => m.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
      this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: `Ya existe un miembro con el nombre "${nombre}".` });
      return;
    }

    if (miembros.some(m => m.correo.trim().toLowerCase() === correo.toLowerCase())) {
      this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: `El correo "${correo}" ya está registrado.` });
      return;
    }

    // ✅ Un solo llamado con nombre y correo
    const nuevos = this.miembrosService.agregarMiembro(nombre, correo);

    // ✅ Si tiene rol, lo agrega aparte
    if (this.nuevoMiembro.rol) {
      const agregado = nuevos[nuevos.length - 1];
      this.miembrosService.actualizarMiembro(agregado.id, { rol: this.nuevoMiembro.rol });
    }

    this.messageService.add({ severity: 'success', summary: 'Miembro guardado', detail: `"${nombre}" fue agregado correctamente.` });
    this.nuevoMiembro = { id: 0, nombre: '', correo: '', rol: undefined, activo: true };
    this.mostrarModalMiembro = false;
    this.cargarDatos();
  }

  guardarCambiosMiembro(miembro: Miembros) {
    this.miembrosService.actualizarMiembro(miembro.id, miembro);
    this.cargarDatos();
  }

  editarMiembro(id: number) {
    this.miembroEnEdicion = id;
  }

  desactivarMiembro(id: number) {
    this.miembrosService.desactivarMiembro(id);
    this.cargarDatos();
  }

  // ── Grupos con integrantes ────────────────────────────────────

  getGruposConIntegrantes(): Grupo[] {
    const grupos = this.gruposService.getGrupos();
    const miembros = this.miembrosService.getMiembros();

    return grupos.map(grupo => ({
      ...grupo,
      miembros: miembros.filter(m => m.grupoIds?.includes(grupo.id)),
      miembrosIds: miembros.filter(m => m.grupoIds?.includes(grupo.id)).map(m => m.id)
    }));
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

  getNombreGrupo(grupoId?: number): string {
    const grupo = this.gruposConIntegrantes.find(g => g.id === grupoId);
    return grupo ? grupo.nombre : '';
  }

  // ── Tabs ─────────────────────────────────────────────────────

  CambioTab(event: any) {
    this.tabactivo = event;
  }

}