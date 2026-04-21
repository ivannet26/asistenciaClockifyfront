import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Miembros, RolNombre } from '../model/Miembro';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private userSubject = new BehaviorSubject<Miembros | null>(
        this.loadFromStorage()
    );

    constructor() {
    
    }

    currentUser$ = this.userSubject.asObservable();

    currentRole$ = this.currentUser$.pipe(
        map(u => u?.rol ?? null)
    );

    isLoggedIn$ = this.currentUser$.pipe(map(u => !!u));

    setUser(user: Miembros) {
        this.userSubject.next(user);
    }

    clearUser() {
        this.userSubject.next(null);
    }

    get currentRole(): RolNombre | null {
        return this.userSubject.value?.rol ?? null;
    }

    private loadFromStorage(): Miembros | null {
        const session = localStorage.getItem('userSession');
        if (!session) return null;
        const parsed = JSON.parse(session);
        return parsed.isAuthenticated ? parsed.userData : null;
    }
}