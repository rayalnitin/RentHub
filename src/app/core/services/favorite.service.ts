import { Injectable } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { AuthService } from './auth.service';
import { Favorite } from '../models/favorite.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private storage: StorageService;
  private authService: AuthService;

  constructor(storage: StorageService, authService: AuthService) {
    this.storage = storage;
    this.authService = authService;
  }

  // The listing ids the current user has favourited
  getFavoriteListingIds(): number[] {
    const user = this.authService.getCurrentUser();
    const ids: number[] = [];
    if (user === null) {
      return ids;
    }
    const favorites = this.storage.getItems<Favorite>(STORAGE_KEYS.favorites);
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].userId === user.id) {
        ids.push(favorites[i].listingId);
      }
    }
    return ids;
  }

  // Adds or removes a favourite. Returns false if nobody is logged in.
  toggleFavorite(listingId: number): boolean {
    const user = this.authService.getCurrentUser();
    if (user === null) {
      return false;
    }

    const favorites = this.storage.getItems<Favorite>(STORAGE_KEYS.favorites);
    let foundIndex = -1;
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].userId === user.id && favorites[i].listingId === listingId) {
        foundIndex = i;
      }
    }

    if (foundIndex === -1) {
      favorites.push({ userId: user.id, listingId: listingId });
    } else {
      favorites.splice(foundIndex, 1);
    }

    this.storage.saveItems(STORAGE_KEYS.favorites, favorites);
    return true;
  }
}
