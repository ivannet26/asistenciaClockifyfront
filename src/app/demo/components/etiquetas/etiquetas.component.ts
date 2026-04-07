import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

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
  
  // --- VARIABLES DE ESTADO ---
  etiquetas: any[] = [];
  etiquetasFiltradas: any[] = [];
  mostrarLista: boolean = false;

  // --- VARIABLES DE MODELO ---
  nuevaEtiquetaNombre: string = '';
  textoBusqueda: string = '';

  // --- CONFIGURACIÓN ---
  opcionesFiltro = [
    { label: 'Mostrar activo', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];
  filtroSeleccionado: string = 'activo';

  ngOnInit() {
    this.cargarDesdeStorage();
  }

  // Carga las etiquetas guardadas al iniciar el componente
  cargarDesdeStorage() {
    const data = localStorage.getItem('etiquetas');
    if (data) {
      this.etiquetas = JSON.parse(data);
      this.etiquetasFiltradas = [...this.etiquetas];
      this.mostrarLista = this.etiquetas.length > 0;
    }
  }

  // Función para añadir una etiqueta nueva
  agregarEtiqueta() {
    if (!this.nuevaEtiquetaNombre.trim()) return;

    const nueva = {
      id: Date.now(),
      nombre: this.nuevaEtiquetaNombre
    };

    this.etiquetas.push(nueva);
    this.guardarYRefrescar();
    
    // Limpieza de campos
    this.nuevaEtiquetaNombre = '';
    this.mostrarLista = true;
  }

  // Elimina una etiqueta por su ID
  eliminarEtiqueta(id: number) {
    this.etiquetas = this.etiquetas.filter(e => e.id !== id);
    this.guardarYRefrescar();
    
    if (this.etiquetas.length === 0) {
      this.mostrarLista = false;
    }
  }

  // Lógica de búsqueda reactiva (se llama desde el HTML con el evento input)
  filtrarEtiquetas() {
    if (!this.textoBusqueda.trim()) {
      this.etiquetasFiltradas = [...this.etiquetas];
    } else {
      this.etiquetasFiltradas = this.etiquetas.filter(e => 
        e.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      );
    }
  }

  // Centraliza el guardado en Storage y la actualización de la lista visible
  private guardarYRefrescar() {
    localStorage.setItem('etiquetas', JSON.stringify(this.etiquetas));
    this.filtrarEtiquetas();
  }

  
  mostrarTabla() {
    this.agregarEtiqueta();
  }
}