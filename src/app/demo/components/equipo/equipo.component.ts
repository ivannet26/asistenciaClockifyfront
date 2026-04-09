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

import { Miembros } from '../../model/Miembro';
import { RolNombre } from '../../model/Miembro';
import { Grupo } from '../../model/Grupo';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CardModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CheckboxModule,
    TabMenuModule,
    InputTextModule,
    MultiSelectModule,
    FormsModule, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css'
})

export class EquipoComponent {

  abrirModalNuevoMiembro() {
    this.mostrarModalMiembro = true;
  }

  private STORAGE_GRUPOS = 'grupos';
  private STORAGE_MIEMBROS = 'miembros';
  private STORAGE_ROLES = 'roles';

  mostrarModalMiembro: boolean = false;
  gruposConIntegrantes: Grupo[] = [];
  miembros: Miembros[] = [];
  grupos: Grupo[];
  mostrarLista = false;

  ngOnInit() {
    this.miembros = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.mostrarTabla();
    this.cargarDatos();
    this.cargarOptions();
  }

  constructor(private messageService: MessageService) { }

  //temporal solo para el form
  nuevoGrupo: Grupo = {
    id: 0,
    nombre: ''
  }
  nuevoMiembro: Miembros = {
    id: 0,
    nombre: '',
    correo: '',
    rol: undefined,
    grupoIds: undefined
  };
  rolesOptions = Object.values(RolNombre).map(rol => ({
    label: rol,  // lo que se muestra
    value: rol   // lo que se guarda
  }));
  grupoOptions: { label: string; value: number }[] = [];
  miembrosOptions: { nombre: string; id: number }[] = [];


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

    const MIN = 3, MAX = 30;
    if (nombre.length < MIN) {
      this.messageService.add({ severity: 'warn', summary: 'Nombre muy corto', detail: `Debe tener al menos ${MIN} caracteres.` });
      return;
    }
    if (nombre.length > MAX) {
      this.messageService.add({ severity: 'warn', summary: 'Nombre muy largo', detail: `No puede superar los ${MAX} caracteres.` });
      return;
    }

    const grupos: Grupo[] = JSON.parse(localStorage.getItem(this.STORAGE_GRUPOS) || '[]');
    const existe = grupos.some(g => g.nombre.trim().toLowerCase() === nombre.toLowerCase());
    if (existe) {
      this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: `Ya existe un grupo con el nombre "${nombre}".` });
      return;
    }

    const maxId = grupos.length > 0 ? Math.max(...grupos.map(g => g.id)) : 0;
    this.nuevoGrupo.id = maxId + 1;
    this.nuevoGrupo.nombre = nombre;
    grupos.push({ ...this.nuevoGrupo });
    localStorage.setItem(this.STORAGE_GRUPOS, JSON.stringify(grupos));

    // Toast de éxito
    this.messageService.add({ severity: 'success', summary: 'Grupo guardado', detail: `"${nombre}" fue creado correctamente.` });

    this.nuevoGrupo = { id: 0, nombre: '', miembros: undefined };
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.cargarOptions();
  }

  guardarMiembro() {
    const nombre = this.nuevoMiembro.nombre?.trim();
    const correo = this.nuevoMiembro.correo?.trim();

    // ── Validaciones nombre ──────────────────────────────────────
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

    // ── Validaciones correo ──────────────────────────────────────
    if (!correo) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El correo es requerido.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      this.messageService.add({ severity: 'warn', summary: 'Correo inválido', detail: 'Ingresa un correo electrónico válido.' });
      return;
    }

    // ── Sin duplicados ───────────────────────────────────────────
    const miembros: Miembros[] = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');

    const nombreDuplicado = miembros.some(m => m.nombre.trim().toLowerCase() === nombre.toLowerCase());
    if (nombreDuplicado) {
      this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: `Ya existe un miembro con el nombre "${nombre}".` });
      return;
    }

    const correoDuplicado = miembros.some(m => m.correo.trim().toLowerCase() === correo.toLowerCase());
    if (correoDuplicado) {
      this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: `El correo "${correo}" ya está registrado.` });
      return;
    }

    // ── Guardar ──────────────────────────────────────────────────
    const maxId = miembros.length > 0 ? Math.max(...miembros.map(m => m.id)) : 0;
    this.nuevoMiembro.id = maxId + 1;
    this.nuevoMiembro.nombre = nombre;
    this.nuevoMiembro.correo = correo;

    miembros.push({ ...this.nuevoMiembro });
    localStorage.setItem(this.STORAGE_MIEMBROS, JSON.stringify(miembros));

    this.messageService.add({ severity: 'success', summary: 'Miembro guardado', detail: `"${nombre}" fue agregado correctamente.` });

    this.nuevoMiembro = { id: 0, nombre: '', correo: '', rol: undefined };
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.miembros = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');
    this.mostrarTabla();
    this.mostrarModalMiembro = false;
  }

  guardarCambiosMiembro(miembro: Miembros) {
    const miembros: Miembros[] = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');

    const index = miembros.findIndex(m => m.id === miembro.id);

    if (index !== -1) {
      miembros[index] = miembro;
    }

    localStorage.setItem(this.STORAGE_MIEMBROS, JSON.stringify(miembros));

    this.miembros = miembros;
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
  }

  guardarMiembrosAGrupo(grupo: any) {
    const miembros: Miembros[] = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');

    miembros.forEach(m => {
      if (!m.grupoIds) m.grupoIds = [];

      if (grupo.miembrosIds?.includes(m.id)) {
        // agregar grupo si no lo tiene ya
        if (!m.grupoIds.includes(grupo.id)) {
          m.grupoIds.push(grupo.id);
        }
      } else {
        // quitar solo este grupo, no los demás
        m.grupoIds = m.grupoIds.filter(gid => gid !== grupo.id);
      }
    });

    localStorage.setItem(this.STORAGE_MIEMBROS, JSON.stringify(miembros));
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.cargarOptions();
  }

  getNombreGrupo(grupoId?: number): string {
    const grupo = this.gruposConIntegrantes.find(g => g.id === grupoId);
    return grupo ? grupo.nombre : '';
  }

  getGruposConIntegrantes(): Grupo[] {
    const grupos: Grupo[] = JSON.parse(localStorage.getItem('grupos') || '[]');
    const miembros: Miembros[] = JSON.parse(localStorage.getItem('miembros') || '[]');

    return grupos.map(grupo => {
      const miembrosDelGrupo = miembros.filter(m => m.grupoIds?.includes(grupo.id));
      return {
        ...grupo,
        miembros: miembrosDelGrupo,
        miembrosIds: miembrosDelGrupo.map(m => m.id)
      };
    });
  }

  tabs = [
    { label: 'Miembros', id: 0 },
    { label: 'Grupos', id: 1 },
    { label: 'Recordatorios', id: 2 }
  ];

  tabactivo = this.tabs[0];

  CambioTab(event: any) {
    this.tabactivo = event;
  }

  cargarDatos() {
    this.miembros = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
  }

  cargarOptions() {
    const grupos: Grupo[] = JSON.parse(localStorage.getItem(this.STORAGE_GRUPOS) || '[]');
    const miembros: Miembros[] = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');

    this.grupoOptions = grupos.map(g => ({
      label: g.nombre,
      value: g.id
    }));

    this.miembrosOptions = miembros.map(m => ({
      nombre: m.nombre,
      id: m.id
    }));
  }

  mostrarTabla() {
    const miembros: Miembros[] = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');
    this.mostrarLista = miembros.length > 0;
  }

  //chips para miembros
  desbordado(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth;
  }

  alfinal(el: HTMLElement): boolean {
    return el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
  }

  onScroll() {
    // dispara change detection si usas OnPush
  }

}



