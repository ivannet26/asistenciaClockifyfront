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
  selector: 'app-clientes',
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
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  
  // --- VARIABLES DE ESTADO ---
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  mostrarLista: boolean = false;
  
  // --- VARIABLES DE MODELO ---
  nuevoClienteNombre: string = '';
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

  // Cargar datos al iniciar
  cargarDesdeStorage() {
    const data = localStorage.getItem('clientes');
    if (data) {
      this.clientes = JSON.parse(data);
      this.clientesFiltrados = [...this.clientes];
      // Si hay clientes, mostramos la tabla directamente
      this.mostrarLista = this.clientes.length > 0;
    }
  }

  // Función principal para añadir
  agregarCliente() {
    if (!this.nuevoClienteNombre.trim()) return;

    const nuevo = {
      id: Date.now(), // Generamos un ID único
      nombre: this.nuevoClienteNombre,
      direccion: 'Lima', // Valor por defecto
      moneda: 'USD'
    };

    // Agregamos al arreglo principal
    this.clientes.push(nuevo);
    
    // Guardamos y actualizamos vista
    this.guardarYRefrescar();
    
    // Limpiar input y asegurar que se vea la tabla
    this.nuevoClienteNombre = '';
    this.mostrarLista = true;
  }

  // Función para borrar clientes
  eliminarCliente(id: number) {
    this.clientes = this.clientes.filter(c => c.id !== id);
    this.guardarYRefrescar();
    
    // Si borramos todos, volvemos al estado vacío
    if (this.clientes.length === 0) {
      this.mostrarLista = false;
    }
  }

  // Lógica de búsqueda reactiva
  filtrarClientes() {
    if (!this.textoBusqueda.trim()) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(c => 
        c.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      );
    }
  }

  private guardarYRefrescar() {
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
    this.filtrarClientes();
  }

  // Este método reemplaza a tu antiguo mostrarTabla()
  mostrarTabla() {
    this.agregarCliente();
  }
}