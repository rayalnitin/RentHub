import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SharedModule } from './shared-module';
import { Navbar } from './components/navbar/navbar';
import { ListingCard } from './components/listing-card/listing-card';
import { AuthService } from '../core/services/auth.service';
import { StorageService, STORAGE_KEYS } from '../core/services/storage.service';
import { SEED_USERS, SEED_LISTINGS } from '../core/data/seed-data';

describe('SharedModule', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideRouter([])],
    }).compileComponents();

    const storage = TestBed.inject(StorageService);
    storage.saveItems(STORAGE_KEYS.users, SEED_USERS);
  });

  it('lets a component use the Navbar and ListingCard by importing the module', () => {
    const navbarFixture = TestBed.createComponent(Navbar);
    const cardFixture = TestBed.createComponent(ListingCard);

    expect(navbarFixture.componentInstance).toBeTruthy();
    expect(cardFixture.componentInstance).toBeTruthy();
  });

  it('navbar shows Login and Register links when nobody is logged in', () => {
    const fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Login');
    expect(text).toContain('Register');
    expect(text).not.toContain('Logout');
  });

  it('navbar greets the user and shows Logout after login', () => {
    const authService = TestBed.inject(AuthService);
    authService.login('demo@renthub.com', 'Demo@123');

    const fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Hi, Demo Renter');
    expect(text).toContain('Logout');
  });

  it('listing card shows the listing details', () => {
    const listing = SEED_LISTINGS[0];
    const fixture = TestBed.createComponent(ListingCard);
    fixture.componentRef.setInput('listing', listing);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(listing.title);
    expect(text).toContain('$1,000');
    expect(text).toContain('View Details');
  });

  it('listing card tells its parent when the favourite button is clicked', () => {
    const fixture = TestBed.createComponent(ListingCard);
    fixture.componentRef.setInput('listing', SEED_LISTINGS[0]);
    fixture.detectChanges();

    let clicked = false;
    fixture.componentInstance.favoriteClick.subscribe(function () {
      clicked = true;
    });

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clicked).toBe(true);
  });
});
