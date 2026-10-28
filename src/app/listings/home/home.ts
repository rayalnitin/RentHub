import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Listing } from '../../core/models/listing.model';
import { ListingFilters, createEmptyFilters } from '../../core/models/listing-filters.model';
import { AMENITY_OPTIONS, PROPERTY_TYPES } from '../../core/data/options';
import { ListingService } from '../../core/services/listing.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  amenityOptions = AMENITY_OPTIONS;
  propertyTypes = PROPERTY_TYPES;

  filters: ListingFilters = createEmptyFilters();
  showFilters = false;

  results: Listing[] = [];
  pagedListings: Listing[] = [];
  featuredListings: Listing[] = [];
  favoriteIds: number[] = [];

  slideIndex = 0;
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  pageNumbers: number[] = [];

  private listingService: ListingService;
  private favoriteService: FavoriteService;
  private authService: AuthService;
  private router: Router;

  constructor(
    listingService: ListingService,
    favoriteService: FavoriteService,
    authService: AuthService,
    router: Router,
  ) {
    this.listingService = listingService;
    this.favoriteService = favoriteService;
    this.authService = authService;
    this.router = router;
  }

  // Runs once when the page opens (like useEffect with an empty array)
  ngOnInit(): void {
    this.featuredListings = this.listingService.getNewest(3);
    this.favoriteIds = this.favoriteService.getFavoriteListingIds();
    this.applyFilters();
  }

  // ---------- Filters ----------

  applyFilters(): void {
    this.results = this.listingService.searchListings(this.filters);
    this.currentPage = 1;
    this.updatePage();
  }

  clearFilters(): void {
    this.filters = createEmptyFilters();
    this.applyFilters();
  }

  isAmenitySelected(name: string): boolean {
    for (let i = 0; i < this.filters.amenities.length; i++) {
      if (this.filters.amenities[i] === name) {
        return true;
      }
    }
    return false;
  }

  toggleAmenity(name: string, checked: boolean): void {
    if (checked) {
      this.filters.amenities.push(name);
    } else {
      const remaining: string[] = [];
      for (let i = 0; i < this.filters.amenities.length; i++) {
        if (this.filters.amenities[i] !== name) {
          remaining.push(this.filters.amenities[i]);
        }
      }
      this.filters.amenities = remaining;
    }
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // ---------- Pagination ----------

  updatePage(): void {
    this.totalPages = Math.ceil(this.results.length / this.pageSize);
    if (this.totalPages < 1) {
      this.totalPages = 1;
    }
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedListings = this.results.slice(start, start + this.pageSize);

    this.pageNumbers = [];
    for (let p = 1; p <= this.totalPages; p++) {
      this.pageNumbers.push(p);
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePage();
  }

  // ---------- Carousel ----------

  getCurrentFeatured(): Listing | null {
    if (this.featuredListings.length === 0) {
      return null;
    }
    return this.featuredListings[this.slideIndex];
  }

  nextSlide(): void {
    this.slideIndex = this.slideIndex + 1;
    if (this.slideIndex >= this.featuredListings.length) {
      this.slideIndex = 0;
    }
  }

  previousSlide(): void {
    this.slideIndex = this.slideIndex - 1;
    if (this.slideIndex < 0) {
      this.slideIndex = this.featuredListings.length - 1;
    }
  }

  goToSlide(index: number): void {
    this.slideIndex = index;
  }

  // ---------- Favourites ----------

  isFavorite(listingId: number): boolean {
    for (let i = 0; i < this.favoriteIds.length; i++) {
      if (this.favoriteIds[i] === listingId) {
        return true;
      }
    }
    return false;
  }

  onFavoriteClick(listingId: number): void {
    if (this.authService.isLoggedIn() === false) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/listings' } });
      return;
    }
    this.favoriteService.toggleFavorite(listingId);
    this.favoriteIds = this.favoriteService.getFavoriteListingIds();
  }
}
