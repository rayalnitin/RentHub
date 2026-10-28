import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ListingsRoutingModule } from './listings-routing-module';
import { SharedModule } from '../shared/shared-module';
import { Home } from './home/home';
import { ListingDetails } from './listing-details/listing-details';
import { CreatePost } from './create-post/create-post';
import { PreviewSubmit } from './preview-submit/preview-submit';

@NgModule({
  declarations: [Home, ListingDetails, CreatePost, PreviewSubmit],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, ListingsRoutingModule],
})
export class ListingsModule {}
