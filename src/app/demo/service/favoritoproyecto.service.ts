import { FavoritoProyecto } from "../model/Favorito";

export class FavoritosService {

    private storageKey = 'favoritos';

    getFavoritos(): FavoritoProyecto[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    esFavorito(usuarioId: number, proyectoId: number): boolean {
        return this.getFavoritos().some(
            f => f.usuarioId === usuarioId && f.proyectoId === proyectoId
        );
    }

    toggleFavorito(usuarioId: number, proyectoId: number): void {
    const favoritos = this.getFavoritos();
    const index = favoritos.findIndex(
        f => f.usuarioId === usuarioId && f.proyectoId === proyectoId
    );

    if (index === -1) {
        favoritos.push({ usuarioId, proyectoId });
    } else {
        favoritos.splice(index, 1);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(favoritos));
}

    getFavoritosDeUsuario(usuarioId: number): number[] {
        return this.getFavoritos()
            .filter(f => f.usuarioId === usuarioId)
            .map(f => f.proyectoId);
    }
}