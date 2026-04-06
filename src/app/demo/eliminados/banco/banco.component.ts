import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Banco } from '../../model/Banco';
import { BancoService } from '../../service/banco.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from '../../service/breadcrumb.service';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
//import { verMensajeInformativo } from '../utilities/funciones_utilitarias';
import { DropdownModule } from 'primeng/dropdown';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';


@Component({
    selector: 'app-banco',
    standalone: true,
    imports: [ToastModule, TableModule, ReactiveFormsModule, CommonModule, ButtonModule, 
        CardModule, InputTextModule, PanelModule, BreadcrumbModule, ConfirmDialogModule, FormsModule, DropdownModule,ContextMenuModule],
    templateUrl: './banco.component.html',
    styleUrl: './banco.component.css',
    providers: [MessageService, ConfirmationService]
})
export class BancoComponent implements OnInit {
    bancoForm: FormGroup;
    bancoList: Banco[]
    isEditing: boolean = false;
    editingRowIndex: number | null = null;
    editingBanco: Banco | null = null;
    editingRows: { [s: string]: boolean } = {};
    editingData: any = {};
    displayDialog: boolean = false;
    isNew: boolean = false;
    clonedBancos: { [s: string]: Banco } = {}
    items: any[] = [];
    isEditingAnyRow: boolean = false;
    rowsPerPage: number = 10; // Numero de filas por página
    selectedOption: Banco[] = []; // row selection multiple
    menuItems:MenuItem[] = []; //context menu

    unlockedOptions!: Banco[]; // filas normales
    lockedOptions!: Banco[]; // filas congeladas

    constructor(private bancoService: BancoService, private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private bS: BreadcrumbService, private router: Router, 
        private globalService: GlobalService, 
        private messageService: MessageService) {

    }


    ngOnInit(): void {
        this.bS.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/Home' },
            { label: 'Bancos', routerLink: '/Home/banco' }
        ]);
        this.bS.currentBreadcrumbs$.subscribe(bc => {
            this.items = bc;
        })

         this.menuItems = [
            { 
                label: 'Ver Cuenta Bancaria', 
                icon: 'pi pi-fw pi-search', 
                command: () => {
                    if(this.selectedOption.length===0) return;
                    const banco=this.selectedOption[0]; 
                    this.verCuentas(banco);
                } 
            },

            { 
                label: 'Eliminar', 
                icon: 'pi pi-fw pi-times', 
                command: () => {
                    if(this.selectedOption.length===0) return;
                    
                    this.selectedOption.forEach(banco=>{
                        const index=this.bancoList.findIndex(
                            b=>b.ban01IdBanco===banco.ban01IdBanco
                        );

                        if(index>=0){
                            this.onDelete(banco,index);
                        }
                    });
                } }
        ];

        this.initForm()
        this.cargarBancos()
    }

   
    //toggleLock(banco:Banco, freeze:boolean, index:number){}

    // Función para navegar a las cuentas del banco seleccionado
    verCuentas(banco): void {
        // Primero, actualiza las migas de pan antes de navegar
        this.bS.setBreadcrumbs([
            { icon: 'pi pi-home', routerLink: '/' },
            { label: 'Banco', routerLink: '/Home/banco' },
            { label: 'Ver Cuentas' }
        ]);
        this.bS.currentBreadcrumbs$.subscribe(bc => {
            this.items = bc;
        })
        const navigationExtras = {
            state: {
                idBanco: banco.ban01IdBanco,
                descripcion: banco.ban01Descripcion
            }
        }
        this.router.navigate(['Home/cuentas_bancarias'], navigationExtras);
        /*
        this.router.navigate(['/Home/banco/cuentas'], {
          queryParams: {
            idBanco: banco.ban01IdBanco,
            descripcion: banco.ban01Descripcion
          }
        });
        */
        // Luego, navega a la ruta correspondiente de "Ver Cuentas"
        //this.router.navigate([`/Home/banco/${banco.ban01IdBanco}/cuentas/${banco.ban01Descripcion}`]);
    }
    initForm() {
        this.bancoForm = this.fb.group({
            ban01Empresa: [this.globalService.getCodigoEmpresa(), Validators.required],
            ban01IdBanco: ['', Validators.required],
            ban01Descripcion: ['', Validators.required],
            ban01Prefijo: ['', Validators.required]
        })

    }

    // cargar data
    cargarBancos(): void {
        this.bancoService.GetBancos().subscribe({
            next: (data) => this.bancoList = data,
            error: (error) => {
                //verMensajeInformativo(this.messageService, 'error', 'Error', 'Error al cargar bancos');
            }
        });
    }
    //edicion
    onRowEditInit(banco: Banco): void {
        this.editingBanco = { ...banco }
        this.isEditingAnyRow = true;
    }
    onRowEditSave(banco: Banco): void {
        if (this.editingBanco) {
            this.bancoService.ActualizarBanco(banco).subscribe({
                next: () => {
                    this.editingBanco = null;
                    this.isEditingAnyRow = false;
                    //verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro actualizado');
                },
                error: () => {
                    //verMensajeInformativo(this.messageService, 'error', 'Error', 'Error al actualizar');
                }
            })
        }
    }
    onRowEditCancel(banco: Banco, index: number): void {
        if (this.editingBanco) {
            this.bancoList[index] = { ...this.editingBanco };
            this.editingBanco = null;
            this.isEditingAnyRow = false;
            this.cargarBancos();
        }
    }
    //crear banco
    showAddRow() {
        this.isEditing = true;
        this.isNew = true;
        this.bancoForm.reset({
            ban01Empresa: this.globalService.getCodigoEmpresa(),
        });
    }
    onSave() {
        if (this.bancoForm.valid) {
            const newBanco: Banco = this.bancoForm.value;
            this.bancoService.CrearBanco(newBanco).subscribe({
                next: () => {
                    this.isEditing = false;
                    this.isNew = false;
                    this.bancoForm.reset();
                    //verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro guardado');
                    this.cargarBancos();
                },
                error: (err) => {
                    console.error('Error al guardar:', err);
                    //verMensajeInformativo(this.messageService, 'error', 'Error', 'No se pudo guardar el registro');
                },
            })
        }
    }

    onCancel() {
        this.isEditing = false;
        this.isNew = false;
        this.bancoForm.reset({
            ban01Empresa: this.globalService.getCodigoEmpresa(),
        });
    }

    onDelete(banco: Banco, index: number) {
        this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el banco <b>${banco.ban01Descripcion}</b>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button',
            accept: () => {
                this.bancoService.EliminarBanco(banco.ban01Empresa, banco.ban01IdBanco).subscribe({
                    next: () => {
                        this.bancoList.splice(index, 1);
                        //verMensajeInformativo(this.messageService, 'success', 'Éxito', 'Registro Eliminado');
                        this.cargarBancos()
                    }
                })
            }
        })
    }
}
