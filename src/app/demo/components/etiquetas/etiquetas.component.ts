import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { Etiquetas } from '../../model/Etiquetas';
import { EtiquetasService } from '../../service/etiquetas.service';

import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';
import { MessageService } from 'primeng/api';
import { ToastModule } from "primeng/toast";

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
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
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

  constructor(private etiquetasService: EtiquetasService, private messageService: MessageService) { }

  get mostrarLista(): boolean {
    return this.etiquetas.length > 0;
  }

  ngOnInit() {

    this.etiquetas = this.etiquetasService.getEtiquetas();
    this.etiquetasFiltrados = [...this.etiquetas];

  }

  agregarEtiqueta() {
    if (!this.nuevaEtiquetaNombre.trim()) 
      return this.messageService.add({
      severity: 'info',
      summary: 'Campos Vacios',
      detail: `Campo de nombre vacio`
    });

    this.nuevaEtiquetaNombre = '';
    this.etiquetas = this.etiquetasService.agregarEtiqueta(this.nuevaEtiquetaNombre);
    this.etiquetasFiltrados = [...this.etiquetas];
    this.messageService.add({
      severity: 'success',
      summary: 'Etiqueta Creada',
      detail: `${this.nuevaEtiquetaNombre} fue agregado correctamente`
    });
    this.nuevaEtiquetaNombre = '';

  }

  actualizarEtiqueta(id: number, cambios: Partial<Etiquetas>) {
    this.etiquetas = this.etiquetasService.actualizarEtiqueta(id, cambios);
    this.etiquetasFiltrados = [...this.etiquetas];
    this.messageService.add({
      severity: 'warn',
      summary: 'Etiqueta Actualizada',
      detail: `La etiqueta fue actualizada correctamente`
    });
  }

  eliminarEtiqueta(id: number) {
    this.etiquetas = this.etiquetasService.eliminarEtiqueta(id);
    this.etiquetasFiltrados = [...this.etiquetas];
    this.messageService.add({
      severity: 'error',
      summary: 'Registro Eliminado',
      detail: `La etiqueta fue eliminada correctamente`
    });
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
      (p, i) => ({
        'N°': i + 1,
        'Etiqueta': p.nombre,
      }),
      'Etiquetas'
    );
  }
}