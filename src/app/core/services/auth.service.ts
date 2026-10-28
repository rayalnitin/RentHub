import { Injectable } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { User } from '../models/user.model';

// What login() and register() give back
export interface AuthResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storage: StorageService;
  private currentUser: User | null = null;

  constructor(storage: StorageService) {
    this.storage = storage;
    this.loadSavedUser();
  }

  // If someone was logged in before a page refresh, restore them
  private loadSavedUser(): void {
    const savedId = this.storage.getValue<number>(STORAGE_KEYS.currentUser);
    if (savedId === null) {
      return;
    }
    const users = this.storage.getItems<User>(STORAGE_KEYS.users);
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === savedId) {
        this.currentUser = users[i];
      }
    }
  }

  private setCurrentUser(user: User): void {
    this.currentUser = user;
    this.storage.saveValue(STORAGE_KEYS.currentUser, user.id);
  }

  register(name: string, email: string, password: string): AuthResult {
    const users = this.storage.getItems<User>(STORAGE_KEYS.users);
    const cleanEmail = email.trim().toLowerCase();

    for (let i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === cleanEmail) {
        return { success: false, message: 'An account with this email already exists' };
      }
    }

    const newUser: User = {
      id: this.storage.getNextId(users),
      name: name.trim(),
      email: cleanEmail,
      password: password,
    };

    users.push(newUser);
    this.storage.saveItems(STORAGE_KEYS.users, users);
    this.setCurrentUser(newUser); // log the user in right after registering
    return { success: true, message: 'Account created' };
  }

  login(email: string, password: string): AuthResult {
    const users = this.storage.getItems<User>(STORAGE_KEYS.users);
    const cleanEmail = email.trim().toLowerCase();

    for (let i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === cleanEmail && users[i].password === password) {
        this.setCurrentUser(users[i]);
        return { success: true, message: 'Logged in' };
      }
    }
    return { success: false, message: 'Invalid email or password' };
  }

  logout(): void {
    this.currentUser = null;
    this.storage.removeValue(STORAGE_KEYS.currentUser);
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
