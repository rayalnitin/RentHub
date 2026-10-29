import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Listing } from '../../core/models/listing.model';
import { ListingDraft } from '../../core/models/lisiting-draft.model';
import { AMENITY_OPTIONS, PROPERTY_TYPES } from '../../core/data/options';
import { ListingService } from '../../core/services/listing.service';
import { DraftService } from '../../core/services/draft.service';
import { AuthService } from '../../core/services/auth.service';

// A custom validator: text that is empty OR only spaces counts as "required" error
function requiredText(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || String(value).trim() === '') {
    return { required: true };
  }
  return null;
}

@Component({
  selector: 'app-create-post',
  standalone: false,
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost implements OnInit {
  propertyTypes = PROPERTY_TYPES;
  amenityOptions = AMENITY_OPTIONS;

  isEditMode = false;
  editingId: number | null = null;
  submitted = false;
  photosError = false;

  selectedAmenities: string[] = [];
  photos: string[] = [];
  photoUrl = new FormControl('', { nonNullable: true });
  photoMessage = '';
  isCheckingPhoto = false;

  postForm = new FormGroup({
    propertyType: new FormControl('', [Validators.required]),
    buildingName: new FormControl('', [
      requiredText,
      Validators.minLength(2),
      Validators.maxLength(60),
    ]),
    isShared: new FormControl<boolean | null>(null, [Validators.required]),
    streetAddress: new FormControl('', [
      requiredText,
      Validators.minLength(5),
      Validators.maxLength(120),
    ]),
    squareFeet: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(50),
      Validators.max(100000),
    ]),
    beds: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(20),
      Validators.pattern(/^[0-9]+$/),
    ]),
    leaseType: new FormControl('', [Validators.required]),
    rent: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(1000000),
    ]),
    negotiable: new FormControl(false),
    priceMode: new FormControl('', [Validators.required]),
    furnished: new FormControl<boolean | null>(null, [Validators.required]),
    vegetarianOnly: new FormControl(false),
    title: new FormControl('', [requiredText, Validators.minLength(5), Validators.maxLength(80)]),
    description: new FormControl('', [
      requiredText,
      Validators.minLength(20),
      Validators.maxLength(1400),
    ]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactPhone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9+\-\s]{7,15}$/),
    ]),
  });

  private route: ActivatedRoute;
  private router: Router;
  private listingService: ListingService;
  private draftService: DraftService;
  private authService: AuthService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    listingService: ListingService,
    draftService: DraftService,
    authService: AuthService,
  ) {
    this.route = route;
    this.router = router;
    this.listingService = listingService;
    this.draftService = draftService;
    this.authService = authService;
  }

  ngOnInit(): void {
    // The edit route is /listings/:id/edit, the create route has no id
    const idText = this.route.snapshot.paramMap.get('id');
    if (idText !== null) {
      this.isEditMode = true;
      this.editingId = Number(idText);
    }

    // Did the user just come back from the preview screen?
    let draft: ListingDraft | null = null;
    if (this.draftService.isReturning()) {
      draft = this.draftService.getDraft();
    } else {
      this.draftService.clearDraft();
    }
    this.draftService.setReturning(false);

    if (draft !== null && draft.editingId === this.editingId) {
      this.fillForm(draft);
      return;
    }

    if (this.isEditMode) {
      const listing = this.listingService.getById(Number(this.editingId));
      const user = this.authService.getCurrentUser();
      // Only the owner may edit
      if (listing === null || user === null || listing.ownerId !== user.id) {
        this.router.navigate(['/listings']);
        return;
      }
      this.fillForm(this.listingToDraft(listing));
      return;
    }

    // A brand new post: start with the user's email filled in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser !== null) {
      this.postForm.controls.contactEmail.setValue(currentUser.email);
    }
    this.postForm.controls.priceMode.setValue('perMonth');
    this.postForm.controls.vegetarianOnly.setValue(false);
  }

  // ---------- Filling the form ----------

  listingToDraft(listing: Listing): ListingDraft {
    return {
      editingId: listing.id,
      propertyType: listing.propertyType,
      buildingName: listing.buildingName,
      isShared: listing.isShared,
      streetAddress: listing.streetAddress,
      squareFeet: listing.squareFeet,
      beds: listing.beds,
      leaseType: listing.leaseType,
      rent: listing.rent,
      negotiable: listing.negotiable,
      priceMode: listing.priceMode,
      furnished: listing.furnished,
      vegetarianOnly: listing.vegetarianOnly,
      amenities: listing.amenities.slice(),
      title: listing.title,
      description: listing.description,
      photos: listing.photos.slice(),
      contactEmail: listing.contactEmail,
      contactPhone: listing.contactPhone,
    };
  }

  fillForm(data: ListingDraft): void {
    this.postForm.patchValue({
      propertyType: data.propertyType,
      buildingName: data.buildingName,
      isShared: data.isShared,
      streetAddress: data.streetAddress,
      squareFeet: data.squareFeet,
      beds: data.beds,
      leaseType: data.leaseType,
      rent: data.rent,
      negotiable: data.negotiable,
      priceMode: data.priceMode,
      furnished: data.furnished,
      vegetarianOnly: data.vegetarianOnly,
      title: data.title,
      description: data.description,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    });
    this.selectedAmenities = data.amenities.slice();
    this.photos = data.photos.slice();
  }

  // ---------- Error helpers used by the HTML ----------

  showError(name: string): boolean {
    const control = this.postForm.get(name);
    if (control === null) {
      return false;
    }
    return control.invalid && control.touched;
  }

  hasError(name: string, errorKey: string): boolean {
    const control = this.postForm.get(name);
    if (control === null) {
      return false;
    }
    return control.hasError(errorKey);
  }

  borderClass(name: string): string {
    if (this.showError(name)) {
      return 'border-red-500';
    }
    return 'border-gray-300';
  }

  getDescriptionLength(): number {
    const text = this.postForm.controls.description.value;
    if (text === null) {
      return 0;
    }
    return text.length;
  }

  // ---------- Amenities ----------

  isAmenitySelected(name: string): boolean {
    return this.selectedAmenities.includes(name);
  }

  toggleAmenity(name: string, checked: boolean): void {
    if (checked) {
      if (this.selectedAmenities.includes(name) === false) {
        this.selectedAmenities.push(name);
      }
    } else {
      const remaining: string[] = [];
      for (let i = 0; i < this.selectedAmenities.length; i++) {
        if (this.selectedAmenities[i] !== name) {
          remaining.push(this.selectedAmenities[i]);
        }
      }
      this.selectedAmenities = remaining;
    }
  }

  // ---------- Photos ----------

  // Checks that the text is a complete web address, like https://example.com/photo.jpg
  isValidLink(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }
      // A real website name has at least one dot, like example.com
      if (parsed.hostname.includes('.') === false) {
        return false;
      }
      return true;
    } catch (error) {
      // new URL() throws an error when the text is not a proper address
      return false;
    }
  }

  addPhoto(): void {
    this.photoMessage = '';
    if (this.isCheckingPhoto) {
      return;
    }

    const url = this.photoUrl.value.trim();

    if (url === '') {
      this.photoMessage = 'Please paste an image link first';
      return;
    }
    if (this.photos.includes(url)) {
      this.photoMessage = 'This photo is already added';
      return;
    }
    if (this.photos.length >= 6) {
      this.photoMessage = 'You can add up to 6 photos';
      return;
    }
    if (this.isValidLink(url) === false) {
      this.photoMessage = 'Please enter a complete link, for example https://example.com/photo.jpg';
      return;
    }

    this.checkImageAndAdd(url);
  }

  // Asks the browser to load the link as an image. We add the photo only if it really loads.
  checkImageAndAdd(url: string): void {
    this.isCheckingPhoto = true;
    let finished = false;
    const testImage = new Image();

    // Runs once, when the image loads, fails, or takes too long
    const finish = (worked: boolean) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timer);
      this.isCheckingPhoto = false;

      if (worked) {
        this.photos.push(url);
        this.photoUrl.setValue('');
        this.photosError = false;
      } else {
        this.photoMessage = 'This link does not open as an image. Please check it and try again.';
      }
    };

    // Give up after 8 seconds
    const timer = setTimeout(() => {
      finish(false);
    }, 8000);

    testImage.onload = () => {
      finish(true);
    };
    testImage.onerror = () => {
      finish(false);
    };
    testImage.src = url;
  }

  addSamplePhotos(): void {
    this.photoMessage = '';
    const randomNumber = Math.floor(Math.random() * 1000);
    this.photos = [];
    for (let i = 1; i <= 3; i++) {
      this.photos.push('https://picsum.photos/seed/post' + randomNumber + '-' + i + '/800/600');
    }
    this.photosError = false;
  }

  removePhoto(index: number): void {
    const remaining: string[] = [];
    for (let i = 0; i < this.photos.length; i++) {
      if (i !== index) {
        remaining.push(this.photos[i]);
      }
    }
    this.photos = remaining;
  }

  // ---------- Submit ----------

  buildDraft(): ListingDraft {
    const value = this.postForm.value;

    let leaseType: 'long' | 'short' | 'both' = 'long';
    if (value.leaseType === 'short') {
      leaseType = 'short';
    } else if (value.leaseType === 'both') {
      leaseType = 'both';
    }

    let priceMode: 'perMonth' | 'utilitiesIncluded' = 'perMonth';
    if (value.priceMode === 'utilitiesIncluded') {
      priceMode = 'utilitiesIncluded';
    }

    return {
      editingId: this.editingId,
      propertyType: value.propertyType || '',
      buildingName: (value.buildingName || '').trim(),
      isShared: value.isShared === true,
      streetAddress: (value.streetAddress || '').trim(),
      squareFeet: Number(value.squareFeet),
      beds: Number(value.beds),
      leaseType: leaseType,
      rent: Number(value.rent),
      negotiable: value.negotiable === true,
      priceMode: priceMode,
      furnished: value.furnished === true,
      vegetarianOnly: value.vegetarianOnly === true,
      amenities: this.selectedAmenities.slice(),
      title: (value.title || '').trim(),
      description: (value.description || '').trim(),
      photos: this.photos.slice(),
      contactEmail: (value.contactEmail || '').trim(),
      contactPhone: (value.contactPhone || '').trim(),
    };
  }

  onPreview(): void {
    this.submitted = true;
    this.photosError = this.photos.length === 0;

    if (this.postForm.invalid || this.photosError) {
      this.postForm.markAllAsTouched();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.draftService.saveDraft(this.buildDraft());
    this.router.navigate(['/listings/preview']);
  }

  cancel(): void {
    this.draftService.clearDraft();
    if (this.isEditMode) {
      this.router.navigate(['/listings', this.editingId]);
    } else {
      this.router.navigate(['/listings']);
    }
  }
}
