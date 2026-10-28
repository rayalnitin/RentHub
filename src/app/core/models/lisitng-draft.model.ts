// The data of the form, before it becomes a real listing
export interface ListingDraft {
  editingId: number | null; // null when creating, the listing id when editing

  propertyType: string;
  buildingName: string;
  isShared: boolean;
  streetAddress: string;
  squareFeet: number;
  beds: number;

  leaseType: 'long' | 'short' | 'both';
  rent: number;
  negotiable: boolean;
  priceMode: 'perMonth' | 'utilitiesIncluded';

  furnished: boolean;
  vegetarianOnly: boolean;
  amenities: string[];

  title: string;
  description: string;
  photos: string[];

  contactEmail: string;
  contactPhone: string;
}
