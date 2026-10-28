export interface Listing {
  id: number;
  ownerId: number;
  ownerName: string;

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
  createdAt: string;
}
