import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: false,
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.css',
})
export class ListingCard {
  // The "!" tells TypeScript the parent will always supply this
  @Input() listing!: Listing;
  @Input() isFavorite = false;
  @Output() favoriteClick = new EventEmitter<void>();

  onFavoriteClick(): void {
    this.favoriteClick.emit();
  }

  getPriceNote(): string {
    if (this.listing.priceMode === 'utilitiesIncluded') {
      return '/month, utilities included';
    }
    return '/month';
  }

  getLeaseLabel(): string {
    if (this.listing.leaseType === 'long') {
      return 'Long term';
    }
    if (this.listing.leaseType === 'short') {
      return 'Short term';
    }
    return 'Long or short term';
  }
}
