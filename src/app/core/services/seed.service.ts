import { Injectable } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { SEED_USERS, SEED_LISTINGS, SEED_COMMENTS } from '../data/seed-data';

@Injectable({
  providedIn: 'root',
})
export class SeedService {
  private storage: StorageService;

  // Angular sees StorageService in the brackets and passes it in
  constructor(storage: StorageService) {
    this.storage = storage;
  }

  // Puts the sample data into localStorage, but only the first time
  seedIfEmpty(): void {
    const alreadySeeded = this.storage.getValue<string>(STORAGE_KEYS.seeded);
    if (alreadySeeded === 'yes') {
      return;
    }

    this.storage.saveItems(STORAGE_KEYS.users, SEED_USERS);
    this.storage.saveItems(STORAGE_KEYS.listings, SEED_LISTINGS);
    this.storage.saveItems(STORAGE_KEYS.comments, SEED_COMMENTS);
    this.storage.saveItems(STORAGE_KEYS.inquiries, []);
    this.storage.saveItems(STORAGE_KEYS.favorites, []);
    this.storage.saveValue(STORAGE_KEYS.seeded, 'yes');
  }
}
