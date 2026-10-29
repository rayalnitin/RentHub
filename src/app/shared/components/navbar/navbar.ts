import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DraftService } from '../../../core/services/draft.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  menuOpen = false;
  private authService: AuthService;
  private draftService: DraftService;
  private router: Router;

  constructor(authService: AuthService, draftService: DraftService, router: Router) {
    this.authService = authService;
    this.draftService = draftService;
    this.router = router;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user === null) {
      return '';
    }
    return user.name;
  }

  logout(): void {
    // Throw away any half finished post so the next user cannot see it
    this.draftService.clearDraft();
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/auth/login']);
  }
}
