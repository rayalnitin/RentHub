import { Component, signal } from '@angular/core';
import { SeedService } from './core/services/seed.service';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('rent-hub');
  constructor(seedService: SeedService) {
    seedService.seedIfEmpty();
  }
}
