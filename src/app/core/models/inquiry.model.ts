export interface Inquiry {
  id: number;
  listingId: number;
  listingTitle: string;
  ownerId: number;
  fromUserId: number;
  fromUserName: string;
  fromEmail: string;
  message: string;
  createdAt: string;
}
