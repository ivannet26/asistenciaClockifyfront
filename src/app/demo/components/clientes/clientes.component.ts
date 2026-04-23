import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { ClientesService } from '../../service/clientes.service';
import { Clientes } from '../../model/Clientes';
import { Monedas } from '../../model/Monedas';

import { ExtraccionExcel } from '../utilities/extraccion-excel.utils';
import { MessageService } from 'primeng/api';
import { ToastModule } from "primeng/toast";
import { PermissionService } from '../../service/permission.service';
import { Observable } from 'rxjs';

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
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})

export class ClientesComponent implements OnInit {

  @ViewChild('dt') dt!: Table;
  clientes: Clientes[] = [];
  clientesFiltrados: Clientes[] = [];
  nuevoClienteNombre: string = '';
  monedas = Monedas;
  textoBusqueda: string = '';
  opcionesFiltro = [
    { label: 'Mostrar activos', value: 'activo' },
    { label: 'Mostrar inactivos', value: 'inactivo' }
  ];
  filtroSeleccionado: string = 'activo';
  clienteEnEdicion: Clientes | null = null;

  canCreate$!: Observable<boolean>;

  constructor(private clientesService: ClientesService,
              private messageService: MessageService,
              private permissionService: PermissionService,) { 

  }

  get mostrarLista(): boolean {
    return this.clientes.length > 0;
  }

  ngOnInit() {

    this.clientes = this.clientesService.getClientes();
    this.clientesFiltrados = [...this.clientes];
    this.canCreate$ = this.permissionService.canDo('createProject');
  }

  agregarCliente() {
    if (!this.nuevoClienteNombre.trim())
      return this.messageService.add({
        severity: 'info',
        summary: 'Campos Vacios',
        detail: `Campo de nombre vacio`
      });

    this.clientes = this.clientesService.agregarCliente(this.nuevoClienteNombre);
    this.clientesFiltrados = [...this.clientes];
    this.messageService.add({
      severity: 'success',
      summary: 'Cliente Creado',
      detail: `${this.nuevoClienteNombre} fue agregado correctamente`
    });
    this.nuevoClienteNombre = '';
  }

  actualizarCliente(id: number, cambios: Partial<Clientes>) {
    this.clientes = this.clientesService.actualizarCliente(id, cambios);
    this.clientesFiltrados = [...this.clientes];
    this.messageService.add({
      severity: 'warn',
      summary: 'Cliente Actualizado',
      detail: `El cliente fue actualizado correctamente`
    });
  }

  eliminarCliente(id: number) {
    this.clientes = this.clientesService.eliminarCliente(id);
    this.clientesFiltrados = [...this.clientes];
    this.messageService.add({
      severity: 'error',
      summary: 'Registro Eliminado',
      detail: `El Cliente fue eliminado correctamente`
    });
  }

  filtrarClientes() {
    this.clientesFiltrados = this.clientes.filter(c => {
      const coincideNombre = !this.textoBusqueda.trim() ||
        c.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      return coincideNombre;
    });
  }

  editarCliente(cliente: Clientes) {
    this.clienteEnEdicion = { ...cliente };
  }

  guardarEdicion() {
    if (!this.clienteEnEdicion) return;
    this.actualizarCliente(this.clienteEnEdicion.id, {
      nombre: this.clienteEnEdicion.nombre,
      direccion: this.clienteEnEdicion.direccion,
      moneda: this.clienteEnEdicion.moneda
    });
    this.clienteEnEdicion = null;
  }

  cancelarEdicion() {
    this.clienteEnEdicion = null;
  }


  exportar(): void {
    ExtraccionExcel.desdeTabla(
      this.dt,
      (p, i) => ({
        'N°': i + 1,
        'Nombre': p.nombre,
        'Dirección': p.direccion,
        'Moneda': p.moneda ? 'Activo' : 'No activo',
      }),
      'Clientes'
    );
  }

}