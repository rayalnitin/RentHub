export interface ListingFilters {
  searchText: string;
  minRent: number | null;
  maxRent: number | null;
  propertyType: string; // empty string means any
  minBeds: number; // 0 means any
  furnished: 'any' | 'yes' | 'no';
  leaseType: 'any' | 'long' | 'short' | 'both';
  amenities: string[];
  sortBy: 'newest' | 'priceLow' | 'priceHigh';
}

// A fresh set of filters with nothing selected
export function createEmptyFilters(): ListingFilters {
  return {
    searchText: '',
    minRent: null,
    maxRent: null,
    propertyType: '',
    minBeds: 0,
    furnished: 'any',
    leaseType: 'any',
    amenities: [],
    sortBy: 'newest',
  };
}
