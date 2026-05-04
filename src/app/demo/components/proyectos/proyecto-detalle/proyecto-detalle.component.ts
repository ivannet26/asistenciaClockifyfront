import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessageService } from 'primeng/api';

import { Proyecto } from '../../../model/Proyecto';
import { Tarea } from '../../../model/Tarea';
import { ProyectosService } from '../../../service/proyectos.service';
import { TareasService } from '../../../service/tareas.service';
import { AppAjustes } from 'src/app/demo/service/appajustes.service';

@Component({
    selector: 'app-proyecto-detalle',
    standalone: true,
    imports: [
        CommonModule, FormsModule, OverlayPanelModule,
        ButtonModule, InputTextModule, DropdownModule,
        ToastModule, TooltipModule, CheckboxModule, DialogModule
    ],
    providers: [MessageService],
    templateUrl: './proyecto-detalle.component.html',
    styleUrl: './proyecto-detalle.component.css'
})
export class ProyectoDetalleComponent implements OnInit {

    proyecto: Proyecto | null = null;
    tareas: Tarea[] = [];
    miembros: any[] = [];

    nombreNuevaTarea: string = '';
    tareaSeleccionada: Tarea | null = null;
    mostrarDialogTarea: boolean = false;
    tareaMenuActual: Tarea | null = null;

    tabActivo: string = 'tareas';
    busquedaTarea: string = '';
    filtroActivo: string = 'activo';
    filtroPrioridad: string = 'todas';

    jerarquia3Nombre = 'Tarea';

    // Encargados panel
    busquedaEncargado: string = '';
    filtroEncargado: string = 'todo';
    tareaEncargadoActual: Tarea | null = null;

    prioridades = [
        { label: 'Ninguna', value: 'ninguna' },
        { label: 'Baja', value: 'baja' },
        { label: 'Media', value: 'media' },
        { label: 'Alta', value: 'alta' },
    ];

    opcionesFiltro = [
        { label: 'Mostrar activo', value: 'activo' },
        { label: 'Mostrar completado', value: 'completado' },
        { label: 'Mostrar todo', value: 'todo' },
    ];

    opcionesPrioridad = [
        { label: 'Todas las prioridades', value: 'todas' },
        { label: 'Alta', value: 'alta' },
        { label: 'Media', value: 'media' },
        { label: 'Baja', value: 'baja' },
        { label: 'Ninguna', value: 'ninguna' },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private proyectosService: ProyectosService,
        private tareasService: TareasService,
        private appAjustes: AppAjustes,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        const todos = this.proyectosService.getProyectos();
        this.proyecto = todos.find(p => p.id === id) ?? null;
        if (!this.proyecto) {
            this.router.navigate(['/menu-layout/proyectos']);
            return;
        }
        this.appAjustes.config$.subscribe(config => {
            this.jerarquia3Nombre = config.espacioTrabajo.jerarquia3Nombre;
        });
        this.cargarTareas();
        this.cargarMiembros();
    }

    cargarTareas(): void {
        if (!this.proyecto) return;
        this.tareas = this.tareasService.getTareasPorProyecto(this.proyecto.id!);
    }

    cargarMiembros(): void {
        const data = localStorage.getItem('miembros');
        this.miembros = data ? JSON.parse(data).map((m: any) => ({
            label: m.nombre,
            value: m.id,
            nombre: m.nombre
        })) : [];
    }

    get tareasFiltradas(): Tarea[] {
        const ordenPrioridad: any = { alta: 0, media: 1, baja: 2, ninguna: 3 };
        return this.tareas
            .filter(t => {
                const cumpleFiltro = this.filtroActivo === 'todo' ? true :
                    this.filtroActivo === 'activo' ? !t.completada : t.completada;
                const cumpleBusqueda = !this.busquedaTarea ||
                    t.nombre.toLowerCase().includes(this.busquedaTarea.toLowerCase());
                const cumplePrioridad = this.filtroPrioridad === 'todas' ||
                    t.prioridad === this.filtroPrioridad;
                return cumpleFiltro && cumpleBusqueda && cumplePrioridad;
            })
            .sort((a, b) =>
                (ordenPrioridad[a.prioridad] ?? 3) - (ordenPrioridad[b.prioridad] ?? 3)
            );
    }

    get miembrosFiltrados(): any[] {
        const b = this.busquedaEncargado.toLowerCase();
        return this.miembros.filter(m =>
            !b || m.label.toLowerCase().includes(b)
        );
    }

    abrirMenuTarea(event: any, tarea: Tarea, panel: any): void {
        event.stopPropagation();
        this.tareaMenuActual = tarea;
        panel.toggle(event);
    }

    toggleCompletadaMenu(): void {
        if (!this.tareaMenuActual) return;
        this.toggleCompletada(this.tareaMenuActual);
    }

    abrirPanelEncargado(event: any, tarea: Tarea, panel: any): void {
        event.stopPropagation();
        this.tareaEncargadoActual = tarea;
        this.busquedaEncargado = '';
        panel.toggle(event);
    }

    asignarEncargado(miembro: any, panel: any): void {
        if (!this.tareaEncargadoActual) return;
        this.tareaEncargadoActual.asignadoA = miembro.value;
        this.tareaEncargadoActual.asignadoNombre = miembro.label;
        this.onCambioAsignado(this.tareaEncargadoActual);
        panel.hide();
    }

    limpiarAsignado(tarea: Tarea, event: any): void {
        event.stopPropagation();
        tarea.asignadoA = undefined;
        tarea.asignadoNombre = undefined;
        this.tareasService.actualizarTarea(tarea.id, {
            asignadoA: undefined,
            asignadoNombre: undefined
        });
        this.cargarTareas();
    }

    getNombreMiembro(id: number): string {
        return this.miembros.find(m => m.value === id)?.label ?? 'Sin asignar';
    }

    guardarNuevaTarea(): void {
        if (!this.nombreNuevaTarea.trim()) return;
        this.tareasService.agregarTarea(this.proyecto!.id!, this.nombreNuevaTarea.trim());
        this.messageService.add({
            severity: 'success',
            summary: 'Tarea creada',
            detail: `"${this.nombreNuevaTarea}" fue agregada correctamente`
        });
        this.nombreNuevaTarea = '';
        this.cargarTareas();
    }

    seleccionarTarea(tarea: Tarea): void {
        this.tareaSeleccionada = { ...tarea };
        this.mostrarDialogTarea = true;
    }

    cerrarDetalle(): void {
        this.tareaSeleccionada = null;
        this.mostrarDialogTarea = false;
    }

    guardarCambiosTarea(): void {
        if (!this.tareaSeleccionada) return;
        const miembro = this.miembros.find(m => m.value === this.tareaSeleccionada!.asignadoA);
        if (miembro) this.tareaSeleccionada.asignadoNombre = miembro.nombre;
        this.tareasService.actualizarTarea(this.tareaSeleccionada.id, this.tareaSeleccionada);
        this.messageService.add({
            severity: 'success',
            summary: 'Tarea actualizada',
            detail: `"${this.tareaSeleccionada.nombre}" fue actualizada`
        });
        this.cargarTareas();
        this.mostrarDialogTarea = false;
    }

    toggleCompletada(tarea: Tarea): void {
        this.tareasService.actualizarTarea(tarea.id, { completada: !tarea.completada });
        this.cargarTareas();
    }

    eliminarTarea(tarea: Tarea): void {
        this.tareasService.eliminarTarea(tarea.id);
        if (this.tareaSeleccionada?.id === tarea.id) this.cerrarDetalle();
        this.cargarTareas();
        this.messageService.add({
            severity: 'warn',
            summary: 'Tarea eliminada',
            detail: `"${tarea.nombre}" fue eliminada`
        });
    }

    onCambioAsignado(tarea: Tarea): void {
        const miembro = this.miembros.find(m => m.value === tarea.asignadoA);
        if (miembro) tarea.asignadoNombre = miembro.nombre;
        this.tareasService.actualizarTarea(tarea.id, {
            asignadoA: tarea.asignadoA,
            asignadoNombre: tarea.asignadoNombre
        });
        this.messageService.add({
            severity: 'success',
            summary: 'Tarea actualizada',
            detail: `Encargado asignado correctamente`
        });
    }

    colorPrioridad(prioridad: string): string {
        const map: any = {
            alta: '#ef4444', media: '#f59e0b',
            baja: '#3b82f6', ninguna: '#94a3b8'
        };
        return map[prioridad] ?? '#94a3b8';
    }

    volver(): void {
        this.router.navigate(['/menu-layout/proyectos']);
    }
}
