import { Injectable } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { Listing } from '../models/listing.model';
import { ListingFilters } from '../models/listing-filters.model';
import { Comment } from '../models/comment.model';
import { Inquiry } from '../models/inquiry.model';
import { Favorite } from '../models/favorite.model';
import { ListingDraft } from '../models/lisiting-draft.model';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  getAll(): Listing[] {
    return this.storage.getItems<Listing>(STORAGE_KEYS.listings);
  }

  getById(id: number): Listing | null {
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      if (all[i].id === id) {
        return all[i];
      }
    }
    return null;
  }

  // The newest listings, used for the featured carousel
  getNewest(count: number): Listing[] {
    const all = this.getAll();
    all.sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return all.slice(0, count);
  }

  // Deletes a listing and everything attached to it
  deleteListing(id: number): void {
    const listings = this.getAll();
    const keptListings: Listing[] = [];
    for (let i = 0; i < listings.length; i++) {
      if (listings[i].id !== id) {
        keptListings.push(listings[i]);
      }
    }
    this.storage.saveItems(STORAGE_KEYS.listings, keptListings);

    const comments = this.storage.getItems<Comment>(STORAGE_KEYS.comments);
    const keptComments: Comment[] = [];
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].listingId !== id) {
        keptComments.push(comments[i]);
      }
    }
    this.storage.saveItems(STORAGE_KEYS.comments, keptComments);

    const inquiries = this.storage.getItems<Inquiry>(STORAGE_KEYS.inquiries);
    const keptInquiries: Inquiry[] = [];
    for (let i = 0; i < inquiries.length; i++) {
      if (inquiries[i].listingId !== id) {
        keptInquiries.push(inquiries[i]);
      }
    }
    this.storage.saveItems(STORAGE_KEYS.inquiries, keptInquiries);

    const favorites = this.storage.getItems<Favorite>(STORAGE_KEYS.favorites);
    const keptFavorites: Favorite[] = [];
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].listingId !== id) {
        keptFavorites.push(favorites[i]);
      }
    }
    this.storage.saveItems(STORAGE_KEYS.favorites, keptFavorites);
  }

  // Turns a draft into a real listing and saves it
  createListing(draft: ListingDraft, ownerId: number, ownerName: string): Listing {
    const all = this.getAll();

    const newListing: Listing = {
      id: this.storage.getNextId(all),
      ownerId: ownerId,
      ownerName: ownerName,
      propertyType: draft.propertyType,
      buildingName: draft.buildingName,
      isShared: draft.isShared,
      streetAddress: draft.streetAddress,
      squareFeet: draft.squareFeet,
      beds: draft.beds,
      leaseType: draft.leaseType,
      rent: draft.rent,
      negotiable: draft.negotiable,
      priceMode: draft.priceMode,
      furnished: draft.furnished,
      vegetarianOnly: draft.vegetarianOnly,
      amenities: draft.amenities,
      title: draft.title,
      description: draft.description,
      photos: draft.photos,
      contactEmail: draft.contactEmail,
      contactPhone: draft.contactPhone,
      createdAt: new Date().toISOString(),
    };

    all.push(newListing);
    this.storage.saveItems(STORAGE_KEYS.listings, all);
    return newListing;
  }

  // Copies the draft values onto an existing listing. Owner and created date stay the same.
  updateListing(id: number, draft: ListingDraft): boolean {
    const all = this.getAll();

    for (let i = 0; i < all.length; i++) {
      if (all[i].id === id) {
        all[i].propertyType = draft.propertyType;
        all[i].buildingName = draft.buildingName;
        all[i].isShared = draft.isShared;
        all[i].streetAddress = draft.streetAddress;
        all[i].squareFeet = draft.squareFeet;
        all[i].beds = draft.beds;
        all[i].leaseType = draft.leaseType;
        all[i].rent = draft.rent;
        all[i].negotiable = draft.negotiable;
        all[i].priceMode = draft.priceMode;
        all[i].furnished = draft.furnished;
        all[i].vegetarianOnly = draft.vegetarianOnly;
        all[i].amenities = draft.amenities;
        all[i].title = draft.title;
        all[i].description = draft.description;
        all[i].photos = draft.photos;
        all[i].contactEmail = draft.contactEmail;
        all[i].contactPhone = draft.contactPhone;

        this.storage.saveItems(STORAGE_KEYS.listings, all);
        return true;
      }
    }
    return false;
  }

  // All listings posted by one owner, newest first
  getByOwner(ownerId: number): Listing[] {
    const all = this.getAll();
    const result: Listing[] = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].ownerId === ownerId) {
        result.push(all[i]);
      }
    }
    result.sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }
  // Applies the search text and filters, then sorts
  searchListings(filters: ListingFilters): Listing[] {
    const all = this.getAll();
    const results: Listing[] = [];
    const text = filters.searchText.trim().toLowerCase();

    for (let i = 0; i < all.length; i++) {
      const item = all[i];

      // Search text looks in the title, address, building and property type
      if (text !== '') {
        const searchable = (
          item.title +
          ' ' +
          item.streetAddress +
          ' ' +
          item.buildingName +
          ' ' +
          item.propertyType
        ).toLowerCase();
        if (searchable.includes(text) === false) {
          continue;
        }
      }

      if (filters.minRent !== null && item.rent < filters.minRent) {
        continue;
      }
      if (filters.maxRent !== null && item.rent > filters.maxRent) {
        continue;
      }
      if (filters.propertyType !== '' && item.propertyType !== filters.propertyType) {
        continue;
      }
      if (item.beds < filters.minBeds) {
        continue;
      }
      if (filters.furnished === 'yes' && item.furnished === false) {
        continue;
      }
      if (filters.furnished === 'no' && item.furnished === true) {
        continue;
      }

      // A listing that offers "both" lease types matches long term and short term
      if (filters.leaseType !== 'any') {
        if (item.leaseType !== filters.leaseType && item.leaseType !== 'both') {
          continue;
        }
      }

      // The listing must have every amenity the user ticked
      let hasAllAmenities = true;
      for (let a = 0; a < filters.amenities.length; a++) {
        if (item.amenities.includes(filters.amenities[a]) === false) {
          hasAllAmenities = false;
        }
      }
      if (hasAllAmenities === false) {
        continue;
      }

      results.push(item);
    }

    this.sortListings(results, filters.sortBy);
    return results;
  }

  private sortListings(list: Listing[], sortBy: string): void {
    if (sortBy === 'priceLow') {
      list.sort(function (a, b) {
        return a.rent - b.rent;
      });
    } else if (sortBy === 'priceHigh') {
      list.sort(function (a, b) {
        return b.rent - a.rent;
      });
    } else {
      list.sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  }
}
