import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExtraordinarioPage } from './extraordinario';

@NgModule({
  declarations: [
    ExtraordinarioPage,
  ],
  imports: [
    IonicPageModule.forChild(ExtraordinarioPage),
  ],
  exports: [
    ExtraordinarioPage
  ]
})
export class ExtraordinarioPageModule {}
