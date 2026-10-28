export interface Comment {
  id: number;
  listingId: number;
  userId: number;
  userName: string;
  text: string;
  parentId: number | null;
  createdAt: string;
}
