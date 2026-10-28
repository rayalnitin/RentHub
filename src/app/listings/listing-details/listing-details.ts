import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Listing } from '../../core/models/listing.model';
import { Comment } from '../../core/models/comment.model';
import { ListingService } from '../../core/services/listing.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { CommentService } from '../../core/services/comment.service';
import { InquiryService } from '../../core/services/inquiry.service';
import { AuthService } from '../../core/services/auth.service';

// One top level comment together with its replies
interface CommentThread {
  comment: Comment;
  replies: Comment[];
}

@Component({
  selector: 'app-listing-details',
  standalone: false,
  templateUrl: './listing-details.html',
  styleUrl: './listing-details.css',
})
export class ListingDetails implements OnInit {
  listing: Listing | null = null;
  selectedPhoto = 0;
  isFavorite = false;
  threads: CommentThread[] = [];
  replyingToId: number | null = null;
  inquirySent = false;

  // nonNullable means the value is always a string, never null
  inquiryControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
  });

  commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)],
  });

  replyControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)],
  });

  private route: ActivatedRoute;
  private router: Router;
  private listingService: ListingService;
  private favoriteService: FavoriteService;
  private commentService: CommentService;
  private inquiryService: InquiryService;
  private authService: AuthService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    listingService: ListingService,
    favoriteService: FavoriteService,
    commentService: CommentService,
    inquiryService: InquiryService,
    authService: AuthService,
  ) {
    this.route = route;
    this.router = router;
    this.listingService = listingService;
    this.favoriteService = favoriteService;
    this.commentService = commentService;
    this.inquiryService = inquiryService;
    this.authService = authService;
  }

  ngOnInit(): void {
    // Read the :id part of the URL, for example /listings/3
    const idText = this.route.snapshot.paramMap.get('id');
    const id = Number(idText);
    if (isNaN(id)) {
      return;
    }

    this.listing = this.listingService.getById(id);
    if (this.listing === null) {
      return;
    }

    this.refreshFavorite();
    this.loadComments();
  }

  // ---------- Who is looking ----------

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isOwner(): boolean {
    const user = this.authService.getCurrentUser();
    if (user === null || this.listing === null) {
      return false;
    }
    return user.id === this.listing.ownerId;
  }

  getCurrentUrl(): string {
    return this.router.url;
  }

  // ---------- Small display helpers ----------

  getPriceNote(): string {
    if (this.listing !== null && this.listing.priceMode === 'utilitiesIncluded') {
      return '/month, utilities included';
    }
    return '/month';
  }

  getLeaseLabel(): string {
    if (this.listing === null) {
      return '';
    }
    if (this.listing.leaseType === 'long') {
      return 'Long term (6+ months)';
    }
    if (this.listing.leaseType === 'short') {
      return 'Short term';
    }
    return 'Long or short term';
  }

  selectPhoto(index: number): void {
    this.selectedPhoto = index;
  }

  // ---------- Favourite ----------

  refreshFavorite(): void {
    if (this.listing === null) {
      return;
    }
    const ids = this.favoriteService.getFavoriteListingIds();
    this.isFavorite = ids.includes(this.listing.id);
  }

  onFavoriteClick(): void {
    if (this.listing === null) {
      return;
    }
    if (this.isLoggedIn() === false) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.favoriteService.toggleFavorite(this.listing.id);
    this.refreshFavorite();
  }

  // ---------- Owner actions ----------

  deleteListing(): void {
    if (this.listing === null) {
      return;
    }
    const sure = confirm('Delete this listing? This cannot be undone.');
    if (sure === false) {
      return;
    }
    this.listingService.deleteListing(this.listing.id);
    this.router.navigate(['/listings']);
  }

  // ---------- Inquiry ----------

  sendInquiry(): void {
    if (this.listing === null) {
      return;
    }

    // trim() removes spaces at both ends, so a message of only spaces does not count
    const message = this.inquiryControl.value.trim();
    if (message.length < 10) {
      this.inquiryControl.setValue(message);
      this.inquiryControl.markAsTouched();
      return;
    }
    if (this.inquiryControl.invalid) {
      this.inquiryControl.markAsTouched();
      return;
    }

    this.inquiryService.addInquiry(this.listing, message);
    this.inquiryControl.reset('');
    this.inquirySent = true;
  }

  // ---------- Comments and replies ----------

  loadComments(): void {
    if (this.listing === null) {
      return;
    }
    const all = this.commentService.getForListing(this.listing.id);
    const newThreads: CommentThread[] = [];

    // First pass: the top level comments
    for (let i = 0; i < all.length; i++) {
      if (all[i].parentId === null) {
        newThreads.push({ comment: all[i], replies: [] });
      }
    }

    // Second pass: put every reply under its parent
    for (let i = 0; i < all.length; i++) {
      if (all[i].parentId !== null) {
        for (let t = 0; t < newThreads.length; t++) {
          if (newThreads[t].comment.id === all[i].parentId) {
            newThreads[t].replies.push(all[i]);
          }
        }
      }
    }

    this.threads = newThreads;
  }

  submitComment(): void {
    if (this.listing === null) {
      return;
    }
    const text = this.commentControl.value.trim();
    if (text === '') {
      this.commentControl.setValue('');
      this.commentControl.markAsTouched();
      return;
    }
    if (this.commentControl.invalid) {
      this.commentControl.markAsTouched();
      return;
    }

    this.commentService.addComment(this.listing.id, text, null);
    this.commentControl.reset('');
    this.loadComments();
  }

  openReply(commentId: number): void {
    this.replyingToId = commentId;
    this.replyControl.reset('');
  }

  cancelReply(): void {
    this.replyingToId = null;
  }

  submitReply(): void {
    if (this.listing === null || this.replyingToId === null) {
      return;
    }
    const text = this.replyControl.value.trim();
    if (text === '') {
      this.replyControl.setValue('');
      this.replyControl.markAsTouched();
      return;
    }
    if (this.replyControl.invalid) {
      this.replyControl.markAsTouched();
      return;
    }

    this.commentService.addComment(this.listing.id, text, this.replyingToId);
    this.replyingToId = null;
    this.loadComments();
  }
}
