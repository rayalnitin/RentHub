import { Injectable } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { AuthService } from './auth.service';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private storage: StorageService;
  private authService: AuthService;

  constructor(storage: StorageService, authService: AuthService) {
    this.storage = storage;
    this.authService = authService;
  }

  // All comments (and replies) of one listing, oldest first
  getForListing(listingId: number): Comment[] {
    const all = this.storage.getItems<Comment>(STORAGE_KEYS.comments);
    const result: Comment[] = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].listingId === listingId) {
        result.push(all[i]);
      }
    }
    result.sort(function (a, b) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    return result;
  }

  // parentId is null for a normal comment, or the id of the comment being replied to
  addComment(listingId: number, text: string, parentId: number | null): boolean {
    const user = this.authService.getCurrentUser();
    if (user === null) {
      return false;
    }

    const all = this.storage.getItems<Comment>(STORAGE_KEYS.comments);
    const newComment: Comment = {
      id: this.storage.getNextId(all),
      listingId: listingId,
      userId: user.id,
      userName: user.name,
      text: text,
      parentId: parentId,
      createdAt: new Date().toISOString(),
    };

    all.push(newComment);
    this.storage.saveItems(STORAGE_KEYS.comments, all);
    return true;
  }
}
