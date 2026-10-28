import { Injectable } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { AuthService } from './auth.service';
import { Inquiry } from '../models/inquiry.model';
import { Listing } from '../models/listing.model';

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private storage: StorageService;
  private authService: AuthService;

  constructor(storage: StorageService, authService: AuthService) {
    this.storage = storage;
    this.authService = authService;
  }

  addInquiry(listing: Listing, message: string): boolean {
    const user = this.authService.getCurrentUser();
    if (user === null) {
      return false;
    }

    const all = this.storage.getItems<Inquiry>(STORAGE_KEYS.inquiries);
    const newInquiry: Inquiry = {
      id: this.storage.getNextId(all),
      listingId: listing.id,
      listingTitle: listing.title,
      ownerId: listing.ownerId,
      fromUserId: user.id,
      fromUserName: user.name,
      fromEmail: user.email,
      message: message,
      createdAt: new Date().toISOString(),
    };

    all.push(newInquiry);
    this.storage.saveItems(STORAGE_KEYS.inquiries, all);
    return true;
  }

  // Inquiries other people sent about this owner's listings (for the profile page later)
  getReceived(ownerId: number): Inquiry[] {
    const all = this.storage.getItems<Inquiry>(STORAGE_KEYS.inquiries);
    const result: Inquiry[] = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].ownerId === ownerId) {
        result.push(all[i]);
      }
    }
    return result;
  }

  // Inquiries this user has sent
  getSent(userId: number): Inquiry[] {
    const all = this.storage.getItems<Inquiry>(STORAGE_KEYS.inquiries);
    const result: Inquiry[] = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].fromUserId === userId) {
        result.push(all[i]);
      }
    }
    return result;
  }
}
