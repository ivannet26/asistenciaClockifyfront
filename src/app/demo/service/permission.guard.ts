import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from './permission.service';

export function permissionGuard(accion: string): CanActivateFn {
    return () => {
        const permission = inject(PermissionService);
        const router = inject(Router);

        const puede = permission.canDoSync(accion);
        if (!puede) router.navigate(['/menulayout']);
        return puede;
    };
}