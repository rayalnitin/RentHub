import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ListingCard } from './components/listing-card/listing-card';

@NgModule({
  declarations: [Navbar, ListingCard],
  imports: [CommonModule, RouterModule],
  exports: [Navbar, ListingCard],
})
export class SharedModule {}
