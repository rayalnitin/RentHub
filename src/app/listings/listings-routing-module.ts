import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { ListingDetails } from './listing-details/listing-details';
import { CreatePost } from './create-post/create-post';
import { PreviewSubmit } from './preview-submit/preview-submit';
import { authGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'new', component: CreatePost, canActivate: [authGuard] },
  { path: 'preview', component: PreviewSubmit, canActivate: [authGuard] },
  { path: ':id/edit', component: CreatePost, canActivate: [authGuard] },
  { path: ':id', component: ListingDetails },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListingsRoutingModule {}
