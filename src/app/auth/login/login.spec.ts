import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthModule } from '../auth-module';
import { Login } from './login';
import { AuthService } from '../../core/services/auth.service';
import { StorageService, STORAGE_KEYS } from '../../core/services/storage.service';
import { SEED_USERS } from '../../core/data/seed-data';

describe('Login component', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    // We import the whole AuthModule, so Login gets everything it needs
    await TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [provideRouter([])],
    }).compileComponents();

    const storage = TestBed.inject(StorageService);
    storage.saveItems(STORAGE_KEYS.users, SEED_USERS);

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    // Replace navigate with a fake, so the test does not really change pages
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an invalid form', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('shows required errors when the form is submitted empty', () => {
    component.onSubmit();
    fixture.detectChanges();

    const pageText = fixture.nativeElement.textContent;
    expect(pageText).toContain('Email is required');
    expect(pageText).toContain('Password is required');
  });

  it('flags an email that is not valid', () => {
    component.loginForm.controls.email.setValue('not-an-email');

    expect(component.email.hasError('email')).toBe(true);
  });

  it('shows an error message for a wrong password and stays on the page', () => {
    component.loginForm.setValue({ email: 'demo@renthub.com', password: 'wrong' });
    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Invalid email or password');
    expect(fixture.nativeElement.textContent).toContain('Invalid email or password');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('logs in and goes to the home page with the right details', () => {
    component.loginForm.setValue({ email: 'demo@renthub.com', password: 'Demo@123' });
    component.onSubmit();

    expect(authService.isLoggedIn()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/listings']);
  });
});
