import { Injectable } from '@angular/core';
import { ListingDraft } from '../models/lisiting-draft.model';

// Holds the half finished post while the user moves between the form and the preview
@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private draft: ListingDraft | null = null;
  private returningFromPreview = false;

  saveDraft(draft: ListingDraft): void {
    this.draft = draft;
  }

  getDraft(): ListingDraft | null {
    return this.draft;
  }

  clearDraft(): void {
    this.draft = null;
  }

  // The preview page sets this to true when the user clicks "Back to Edit",
  // so the form knows to refill itself instead of starting empty
  setReturning(value: boolean): void {
    this.returningFromPreview = value;
  }

  isReturning(): boolean {
    return this.returningFromPreview;
  }
}
