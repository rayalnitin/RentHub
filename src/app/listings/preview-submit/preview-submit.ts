import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingDraft } from '../../core/models/lisitng-draft.model';
import { ListingService } from '../../core/services/listing.service';
import { DraftService } from '../../core/services/draft.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-preview-submit',
  standalone: false,
  templateUrl: './preview-submit.html',
  styleUrl: './preview-submit.css',
})
export class PreviewSubmit implements OnInit {
  draft: ListingDraft | null = null;

  private router: Router;
  private listingService: ListingService;
  private draftService: DraftService;
  private authService: AuthService;

  constructor(
    router: Router,
    listingService: ListingService,
    draftService: DraftService,
    authService: AuthService,
  ) {
    this.router = router;
    this.listingService = listingService;
    this.draftService = draftService;
    this.authService = authService;
  }

  ngOnInit(): void {
    this.draft = this.draftService.getDraft();

    // Nothing to preview (for example after a page refresh), so go back to the form
    if (this.draft === null) {
      this.router.navigate(['/listings/new']);
    }
  }

  getLeaseLabel(): string {
    if (this.draft === null) {
      return '';
    }
    if (this.draft.leaseType === 'long') {
      return 'Long term (6+ months)';
    }
    if (this.draft.leaseType === 'short') {
      return 'Short term';
    }
    return 'Long or short term';
  }

  getPriceNote(): string {
    if (this.draft !== null && this.draft.priceMode === 'utilitiesIncluded') {
      return '/month, utilities included';
    }
    return '/month';
  }

  backToEdit(): void {
    if (this.draft === null) {
      return;
    }
    this.draftService.setReturning(true);
    if (this.draft.editingId === null) {
      this.router.navigate(['/listings/new']);
    } else {
      this.router.navigate(['/listings', this.draft.editingId, 'edit']);
    }
  }

  submit(): void {
    const user = this.authService.getCurrentUser();
    if (this.draft === null || user === null) {
      return;
    }

    let savedId: number;
    if (this.draft.editingId === null) {
      const created = this.listingService.createListing(this.draft, user.id, user.name);
      savedId = created.id;
    } else {
      this.listingService.updateListing(this.draft.editingId, this.draft);
      savedId = this.draft.editingId;
    }

    this.draftService.clearDraft();
    this.router.navigate(['/listings', savedId]);
  }
}
