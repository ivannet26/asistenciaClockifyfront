import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    ReactiveFormsModule,
    FormsModule,
    FormGroup,
    FormBuilder,
    Validators,
    FormControl,
} from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
//import { Perfil } from '../../model/perfil';
//import { PerfilService } from '../../service/perfil.service';
import { BreadcrumbService } from '../../service/breadcrumb.service';
import { Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
      ToastModule,
      TableModule,
      ReactiveFormsModule,
      CommonModule,
      ButtonModule,
      CardModule,
      InputTextModule,
      PanelModule,
      BreadcrumbModule,
      ConfirmDialogModule,
      FormsModule,
      RouterModule,
      TooltipModule
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
  providers: [MessageService, ConfirmationService],
})
export class PerfilComponent implements OnInit{
  mPerfilForm: FormGroup;
    //mPerfilList: Perfil[] = [];
    isEditing: boolean = false;
    editingRowIndex: number | null = null;
    //editingPerfil: Perfil | null = null;
    editingRows: { [s: string]: boolean } = {};
    editingData: any = {};
    displayDialog: boolean = false;
    isNew: boolean = false;
    //clonedPerfil: { [s: string]: Perfil } = {};
    items: any[] = [];
    enableAddbutton: boolean = true;

    constructor(
        private fb: FormBuilder,
        //private maS: PerfilService,
        private mS: MessageService,
        private confirmationsService: ConfirmationService,
        private bS: BreadcrumbService,
        private link:Router
    ) {}
    ngOnInit(): void {
        this.bS.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            { label: 'Manteniemiento perfil', routerLink: '/Home/perfil' },
        ]);
        this.bS.currentBreadcrumbs$.subscribe((bc) => {
            this.items = bc;
        });
        this.initForm();
        this.loadPerfil();
    }

    initForm() {
        this.mPerfilForm = this.fb.group({
            Codigo: ['', Validators.required],
            Nombre: ['', Validators.required],
            Descripcion: ['', Validators.required],
        });
    }

    loadPerfil(): void {
        /*this.maS.getAll().subscribe({
            next: (data) => {
                //console.log('Datos obtenidos:', data); // Console log para verificar la data
                this.mPerfilList = data;
            },
            error: (err) => {
                console.error('Error al obtener datos:', err); // Manejo de errores
            },
        });*/
    }

    /*verasignarPerfiles(rowData: Perfil)
    {
        const navigationExtras={
            state:{
                codigo:rowData.codigo
            }
        }
        this.link.navigate(['Home/asignarpermiso'],navigationExtras)
        // console.log(navigationExtras);
    }

    onRowEditInit(perfil: any, index: number) {
        if (this.isEditing == true) {
            this.enableAddbutton = false;
            this.isEditing = false;
            this.editingRows = {}; // Asegúrate de limpiar el estado antes de editar una nueva fila
            this.editingRows[index] = true; // Habilita edición solo para esta fila
            this.editingPerfil = { ...perfil }; // Crea una copia del perfil actual
        } else {
            this.enableAddbutton = false;
            this.editingRows = {}; // Asegúrate de limpiar el estado antes de editar una nueva fila
            this.editingRows[index] = true; // Habilita edición solo para esta fila
            this.editingPerfil = { ...perfil }; // Crea una copia del perfil actual
        }
    }*/

    /*onRowEditSave(perfil: any, index: number) {
        if (this.editingPerfil) {
            this.maS.update(perfil.codigo, perfil).subscribe({
                next: () => {
                    this.editingRows[index] = false; // Desactiva edición para esta fila
                    this.editingPerfil = null;
                    this.enableAddbutton = true;
                    this.mS.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro actualizado',
                    });
                },
                error: () => {
                    this.mS.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar',
                    });
                },
            });
        }
    }*/

    /*onRowEditCancel(perfil: any, index: number) {
        this.mPerfilList[index] = { ...this.editingPerfil }; // Restaura datos originales
        this.editingRows[index] = false; // Desactiva edición para esta fila
        this.editingPerfil = null;
        this.enableAddbutton = true;
        this.mS.add({
            severity: 'info',
            summary: 'Edición cancelada',
            detail: 'Los cambios se han revertido',
        });
    }

    showAddRow() {
        this.editingRows = {};
        this.isEditing = true;
        this.mPerfilForm.reset();
    }

    onSave() {
        if (this.mPerfilForm.valid) {
            const newPerfil: Perfil = this.mPerfilForm.value;
            this.maS.create(newPerfil).subscribe({
                next: () => {
                    this.isEditing = false;
                    this.mPerfilForm.reset();
                    this.mS.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro guardado',
                    });
                    this.loadPerfil();
                },
                error: (err) => {
                    console.error('Error al guardar:', err);
                    this.mS.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo guardar el registro',
                    });
                },
            });
        }
    }

    onCancel() {
        this.isEditing = false;
        this.mPerfilForm.reset();

    }

    onDelete(perfil: Perfil, index: number) {
        this.confirmationsService.confirm({
            message: `¿Está seguro que desea eliminar <b>${perfil.codigo}</b>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No, cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                this.maS.delete(perfil.codigo).subscribe({
                    next: () => {
                        this.mPerfilList.splice(index, 1);
                        this.mS.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Registro eliminado',
                        });
                    },
                });
            },
        });
    */}