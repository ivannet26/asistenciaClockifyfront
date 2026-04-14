import { Component, OnInit , ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule ,Table} from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { Etiquetas } from '../../model/Etiquetas';
import { EtiquetasService } from '../../service/etiquetas.service';

import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';

@Component({
  selector: 'app-etiquetas',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    CheckboxModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './etiquetas.component.html',
  styleUrl: './etiquetas.component.css'
})
export class EtiquetasComponent implements OnInit {

  @ViewChild('dt') dt!: Table;
  etiquetas: Etiquetas[] = [];
  etiquetasFiltrados: Etiquetas[] = [];
  nuevaEtiquetaNombre: string = '';
  textoBusqueda: string = '';
  opcionesFiltro = [
    { label: 'Mostrar activos', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];
  filtroSeleccionado: string = 'activo';
  etiquetaEnEdicion: Etiquetas | null = null;

  constructor(private etiquetasService: EtiquetasService) { }

  get mostrarLista(): boolean {
    return this.etiquetas.length > 0;
  }

  ngOnInit() {

    this.etiquetas = this.etiquetasService.getEtiquetas();
    this.etiquetasFiltrados = [...this.etiquetas];

  }

  agregarEtiqueta() {
    if (!this.nuevaEtiquetaNombre.trim()) return;
    this.etiquetas = this.etiquetasService.agregarEtiqueta(this.nuevaEtiquetaNombre);
    this.etiquetasFiltrados = [...this.etiquetas];
    this.nuevaEtiquetaNombre = '';
  }

  actualizarEtiqueta(id: number, cambios: Partial<Etiquetas>) {
    this.etiquetas = this.etiquetasService.actualizarEtiqueta(id, cambios);
    this.etiquetasFiltrados = [...this.etiquetas];
  }

  eliminarEtiqueta(id: number) {
    this.etiquetas = this.etiquetasService.eliminarEtiqueta(id);
    this.etiquetasFiltrados = [...this.etiquetas];
  }

  filtrarEtiquetas() {
    this.etiquetasFiltrados = this.etiquetas.filter(c => {
      const coincideNombre = !this.textoBusqueda.trim() ||
        c.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      return coincideNombre;
    });
  }

  editarEtiqueta(etiqueta: Etiquetas) {
    this.etiquetaEnEdicion = { ...etiqueta };
  }

  guardarEdicion() {
    if (!this.etiquetaEnEdicion) return;
    this.actualizarEtiqueta(this.etiquetaEnEdicion.id, {
      nombre: this.etiquetaEnEdicion.nombre
    });
    this.etiquetaEnEdicion = null;
  }

  cancelarEdicion() {
    this.etiquetaEnEdicion = null;
  }

exportar(): void {
  ExtraccionExcel.desdeTabla(
    this.dt,
    (p,i) => ({
      'N°':  i + 1,
      'Etiqueta': p.nombre,
    }),
    'Etiquetas'
  );
}
}