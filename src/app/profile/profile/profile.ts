import { Component, OnInit } from '@angular/core';
import { User } from '../../core/models/user.model';
import { Listing } from '../../core/models/listing.model';
import { Inquiry } from '../../core/models/inquiry.model';
import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { InquiryService } from '../../core/services/inquiry.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: User | null = null;
  activeTab: 'listings' | 'favorites' | 'received' | 'sent' = 'listings';

  myListings: Listing[] = [];
  favoriteListings: Listing[] = [];
  receivedInquiries: Inquiry[] = [];
  sentInquiries: Inquiry[] = [];
  favoriteIds: number[] = [];

  private authService: AuthService;
  private listingService: ListingService;
  private favoriteService: FavoriteService;
  private inquiryService: InquiryService;

  constructor(
    authService: AuthService,
    listingService: ListingService,
    favoriteService: FavoriteService,
    inquiryService: InquiryService,
  ) {
    this.authService = authService;
    this.listingService = listingService;
    this.favoriteService = favoriteService;
    this.inquiryService = inquiryService;
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadAll();
  }

  // Reads everything again from localStorage
  loadAll(): void {
    if (this.user === null) {
      return;
    }

    this.myListings = this.listingService.getByOwner(this.user.id);

    this.favoriteIds = this.favoriteService.getFavoriteListingIds();
    const favorites: Listing[] = [];
    for (let i = 0; i < this.favoriteIds.length; i++) {
      const listing = this.listingService.getById(this.favoriteIds[i]);
      if (listing !== null) {
        favorites.push(listing);
      }
    }
    this.favoriteListings = favorites;

    this.receivedInquiries = this.inquiryService.getReceived(this.user.id);
    this.sentInquiries = this.inquiryService.getSent(this.user.id);

    // Newest inquiries first
    this.receivedInquiries.sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    this.sentInquiries.sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  selectTab(tab: 'listings' | 'favorites' | 'received' | 'sent'): void {
    this.activeTab = tab;
  }

  removeFavorite(listingId: number): void {
    this.favoriteService.toggleFavorite(listingId);
    this.loadAll();
  }

  deleteListing(listingId: number): void {
    const sure = confirm('Delete this listing? This cannot be undone.');
    if (sure === false) {
      return;
    }
    this.listingService.deleteListing(listingId);
    this.loadAll();
  }
}
