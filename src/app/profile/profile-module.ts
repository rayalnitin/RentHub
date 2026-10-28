import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing-module';
import { SharedModule } from '../shared/shared-module';
import { Profile } from './profile/profile';

@NgModule({
  declarations: [Profile],
  imports: [CommonModule, SharedModule, ProfileRoutingModule],
})
export class ProfileModule {}
