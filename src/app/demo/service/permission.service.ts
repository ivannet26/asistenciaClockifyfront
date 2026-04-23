import { Injectable } from '@angular/core';
import { map, Observable, combineLatest } from 'rxjs';
import { SessionService } from './session.service';
import { AppAjustes } from './appajustes.service';
import { RolNombre } from '../model/Miembro';

const ROL_NIVEL: Record<RolNombre, number> = {
    [RolNombre.DUENO]: 4,
    [RolNombre.ADMINISTRADOR]: 3,
    [RolNombre.GERENTE]: 2,
    [RolNombre.EMPLEADO]: 1,
};

const REGLAS: Record<string, {
    configCheck: (cfg: ReturnType<AppAjustes['getConfig']>) => boolean;
    getRolMinimo: (cfg: ReturnType<AppAjustes['getConfig']>) => RolNombre;
}> = {
    createProject: {
        configCheck: cfg => {
            const p = cfg.espacioTrabajo.projectCreationPermission;
            return p === 'all' || p === RolNombre.ADMINISTRADOR || p === RolNombre.GERENTE;
        },
        getRolMinimo: cfg => {
            const p = cfg.espacioTrabajo.projectCreationPermission;
            if (p === 'all') return RolNombre.EMPLEADO;
            if (p === RolNombre.GERENTE) return RolNombre.GERENTE;
            return RolNombre.ADMINISTRADOR;
        },
    },
    createEtiqueta: {
        configCheck: cfg => {
            const p = cfg.espacioTrabajo.etiquetaCreationPermission;
            return p === 'all' || p === RolNombre.ADMINISTRADOR || p === RolNombre.GERENTE;
        },
        getRolMinimo: cfg => {
            const p = cfg.espacioTrabajo.etiquetaCreationPermission;
            if (p === 'all') return RolNombre.EMPLEADO;
            return RolNombre.ADMINISTRADOR;
        },
    },
    forceTimer: {
        configCheck: cfg => cfg.espacioTrabajo.forceTimer,
        getRolMinimo: () => RolNombre.EMPLEADO,
    },
    soloAdminODueno: {
        configCheck: () => true,
        getRolMinimo: () => RolNombre.ADMINISTRADOR,
    },
    activeFavorito: {
        configCheck: cfg => cfg.usuario.favoritesEnabled,
        getRolMinimo: () => RolNombre.EMPLEADO,
    },
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
    constructor(
        private session: SessionService,
        private config: AppAjustes,
    ) { }

    canDo(accion: string): Observable<boolean> {
        return combineLatest([
            this.session.currentRole$,
            this.config.config$,
        ]).pipe(
            map(([rol, cfg]) => {
                const regla = REGLAS[accion];
                if (!regla || !rol) return false;

                const configActiva = regla.configCheck(cfg);
                const rolMinimo = regla.getRolMinimo(cfg);
                const rolSuficiente = ROL_NIVEL[rol] >= ROL_NIVEL[rolMinimo];

                return configActiva && rolSuficiente;
            })
        );
    }

    canDoSync(accion: string): boolean {
        const rol = this.session.currentRole;
        const cfg = this.config.getConfig();
        const regla = REGLAS[accion];
        if (!regla || !rol) return false;

        const rolMinimo = regla.getRolMinimo(cfg);
        return regla.configCheck(cfg) && ROL_NIVEL[rol] >= ROL_NIVEL[rolMinimo];
    }
}