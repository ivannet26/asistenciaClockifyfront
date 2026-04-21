export interface UsuarioConfig {
    grouping: {
        primary: 'cliente' | 'proyecto' | 'tarea';
        secondary: 'cliente' | 'proyecto' | 'tarea';
        tertiary: 'cliente' | 'proyecto' | 'tarea';
    };
    durationFormat: 'hh:mm' | 'hh:mm:ss';
    favoritesEnabled: boolean;
}

export interface EspacioTrabajoConfig {
    projectCreationPermission: 'admin' | 'admin_manager' | 'all';
    forceTimer: boolean;
}

export interface AppConfig {
    usuario: UsuarioConfig;
    espacioTrabajo: EspacioTrabajoConfig;
}

export const DEFAULT_CONFIG: AppConfig = {
    usuario: {
        grouping: {
            primary: 'cliente',
            secondary: 'proyecto',
            tertiary: 'tarea',
        },
        durationFormat: 'hh:mm:ss',
        favoritesEnabled: false,
    },
    espacioTrabajo: {
        projectCreationPermission: 'admin',
        forceTimer: false,
    },
};