import { Injectable } from '@angular/core';

export const STORAGE_KEYS = {
  users: 'renthub_users',
  listings: 'renthub_listings',
  comments: 'renthub_comments',
  inquiries: 'renthub_inquiries',
  favorites: 'renthub_favorites',
  currentUser: 'renthub_current_user',
  seeded: 'renthub_seeded',
};

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Read a list (like all users) from localStorage
  getItems<T>(key: string): T[] {
    const text = localStorage.getItem(key);
    if (text === null) {
      return [];
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      return [];
    }
  }

  // Save a list into localStorage
  saveItems<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Read one single object (like the logged in user)
  getValue<T>(key: string): T | null {
    const text = localStorage.getItem(key);
    if (text === null) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  // Save one single object
  saveValue<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeValue(key: string): void {
    localStorage.removeItem(key);
  }

  // Find the next free id for a list of items
  getNextId(items: { id: number }[]): number {
    let highest = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].id > highest) {
        highest = items[i].id;
      }
    }
    return highest + 1;
  }
}
