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

export enum RolNombre {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
  SUPERVISOR = 'SUPERVISOR'
}

interface Grupo {
  id: number;
  nombre: string;
  miembros?: Miembros[];
}

interface Miembros {
  id: number;
  nombre: string;
  correo: string;
  rol?: RolNombre | null;
  grupoId?: number;
}

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
    FormsModule],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css'
})
export class EquipoComponent {

  private STORAGE_GRUPOS = 'grupos';
  private STORAGE_MIEMBROS = 'miembros';
  private STORAGE_ROLES = 'roles';

  gruposConIntegrantes: Grupo[] = [];
  miembros: Miembros[] = [];

  ngOnInit() {
    this.miembros = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
    this.cargarDatos();
  }

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
    grupoId: undefined
  };
  rolesOptions = Object.values(RolNombre).map(rol => ({
    label: rol,  // lo que se muestra
    value: rol   // lo que se guarda
  }));

  guardarGrupo() {
    // 1. Obtener lista actual
    const grupos: Grupo[] = JSON.parse(localStorage.getItem(this.STORAGE_GRUPOS) || '[]');

    // 2. Generar ID seguro
    const maxId = grupos.length > 0
      ? Math.max(...grupos.map(g => g.id))
      : 0;

    this.nuevoGrupo.id = maxId + 1;

    // 3. Agregar copia del objeto
    grupos.push({ ...this.nuevoGrupo });

    // 4. Guardar en LocalStorage
    localStorage.setItem(this.STORAGE_GRUPOS, JSON.stringify(grupos));

    // 5. Resetear formulario
    this.nuevoGrupo = {
      id: 0,
      nombre: '',
      miembros: undefined
    };
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
  }

  guardarMiembro() {
    const miembros: Miembros[] = JSON.parse(localStorage.getItem(this.STORAGE_MIEMBROS) || '[]');

    const maxId = miembros.length > 0
      ? Math.max(...miembros.map(m => m.id))
      : 0;

    this.nuevoMiembro.id = maxId + 1;

    miembros.push({ ...this.nuevoMiembro });

    localStorage.setItem(this.STORAGE_MIEMBROS, JSON.stringify(miembros));

    this.nuevoMiembro = {
      id: 0,
      nombre: '',
      correo: '',
      rol: undefined,
    };
    this.gruposConIntegrantes = this.getGruposConIntegrantes();
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

  getNombreGrupo(grupoId?: number): string {
    const grupo = this.gruposConIntegrantes.find(g => g.id === grupoId);
    return grupo ? grupo.nombre : '';
  }

  getGruposConIntegrantes(): Grupo[] {
    const grupos: Grupo[] = JSON.parse(localStorage.getItem('grupos') || '[]');
    const miembros: Miembros[] = JSON.parse(localStorage.getItem('miembros') || '[]');

    return grupos.map(grupo => ({
      ...grupo,
      integrantes: miembros.filter(m => m.grupoId === grupo.id)
    }));
  }

  mostrarLista = true;
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

  opcionesFiltro = [
    { label: 'Mostrar activo', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];

  filtroSeleccionado = 'activo';

  mostrarTabla() {
    this.mostrarLista = true;
  }

}



