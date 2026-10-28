import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ListingService } from './listing.service';
import { SeedService } from './seed.service';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { Listing } from '../models/listing.model';
import { Comment } from '../models/comment.model';
import { createEmptyFilters } from '../models/listing-filters.model';

// Collects the ids of a list of listings, in numeric order
function getIds(listings: Listing[]): number[] {
  const ids: number[] = [];
  for (let i = 0; i < listings.length; i++) {
    ids.push(listings[i].id);
  }
  ids.sort(function (a, b) {
    return a - b;
  });
  return ids;
}

describe('ListingService', () => {
  let listingService: ListingService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.inject(SeedService).seedIfEmpty();
    listingService = TestBed.inject(ListingService);
    storage = TestBed.inject(StorageService);
  });

  it('returns every listing when no filters are set', () => {
    const results = listingService.searchListings(createEmptyFilters());

    expect(results.length).toBe(7);
  });

  it('finds listings by search text, ignoring capital letters', () => {
    const filters = createEmptyFilters();
    filters.searchText = 'SEATTLE';

    const results = listingService.searchListings(filters);

    expect(getIds(results)).toEqual([2]);
  });

  it('filters by maximum rent', () => {
    const filters = createEmptyFilters();
    filters.maxRent = 1000;

    const results = listingService.searchListings(filters);

    expect(results.length).toBeGreaterThan(0);
    for (let i = 0; i < results.length; i++) {
      expect(results[i].rent).toBeLessThanOrEqual(1000);
    }
  });

  it('only returns listings that have every selected amenity', () => {
    const filters = createEmptyFilters();
    filters.amenities = ['Swimming Pool', 'Gym/Fitness Center'];

    const results = listingService.searchListings(filters);

    expect(getIds(results)).toEqual([1, 5]);
  });

  it('short term search also returns listings that offer both lease types', () => {
    const filters = createEmptyFilters();
    filters.leaseType = 'short';

    const results = listingService.searchListings(filters);

    expect(getIds(results)).toEqual([2, 4, 6, 7]);
  });

  it('sorts by price from low to high', () => {
    const filters = createEmptyFilters();
    filters.sortBy = 'priceLow';

    const results = listingService.searchListings(filters);

    expect(results[0].rent).toBe(450);
    expect(results[results.length - 1].rent).toBe(3200);
  });

  it('deleting a listing also deletes its comments', () => {
    listingService.deleteListing(1);

    expect(listingService.getById(1)).toBeNull();
    expect(listingService.getAll().length).toBe(6);

    const comments = storage.getItems<Comment>(STORAGE_KEYS.comments);
    for (let i = 0; i < comments.length; i++) {
      expect(comments[i].listingId).not.toBe(1);
    }
  });
});
