import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { SEED_USERS } from '../data/seed-data';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let authService: AuthService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    storage = TestBed.inject(StorageService);
    storage.saveItems(STORAGE_KEYS.users, SEED_USERS);
    authService = TestBed.inject(AuthService);
  });

  it('starts with nobody logged in', () => {
    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('logs in with the correct email and password', () => {
    const result = authService.login('demo@renthub.com', 'Demo@123');

    expect(result.success).toBe(true);
    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.getCurrentUser()?.name).toBe('Demo Renter');
  });

  it('ignores capital letters and extra spaces in the email', () => {
    const result = authService.login('  DEMO@renthub.com ', 'Demo@123');

    expect(result.success).toBe(true);
  });

  it('rejects a wrong password', () => {
    const result = authService.login('demo@renthub.com', 'wrong-password');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
    expect(authService.isLoggedIn()).toBe(false);
  });

  it('registers a new user, saves them and logs them in', () => {
    const result = authService.register('New Person', 'new@renthub.com', 'Secret123');

    expect(result.success).toBe(true);
    expect(authService.isLoggedIn()).toBe(true);

    const users = storage.getItems<User>(STORAGE_KEYS.users);
    expect(users.length).toBe(SEED_USERS.length + 1);
  });

  it('does not allow two accounts with the same email', () => {
    const result = authService.register('Copy Cat', 'priya@renthub.com', 'Secret123');

    expect(result.success).toBe(false);
    const users = storage.getItems<User>(STORAGE_KEYS.users);
    expect(users.length).toBe(SEED_USERS.length);
  });

  it('logs out', () => {
    authService.login('demo@renthub.com', 'Demo@123');
    authService.logout();

    expect(authService.isLoggedIn()).toBe(false);
  });

  it('remembers the logged in user after a page refresh', () => {
    authService.login('demo@renthub.com', 'Demo@123');

    // Throw away the whole test app, like closing the browser tab, and start again
    TestBed.resetTestingModule();
    const freshAuthService = TestBed.inject(AuthService);

    expect(freshAuthService.isLoggedIn()).toBe(true);
    expect(freshAuthService.getCurrentUser()?.email).toBe('demo@renthub.com');
  });
});
