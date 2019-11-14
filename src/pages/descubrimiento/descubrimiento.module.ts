import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DescubrimientoPage } from './descubrimiento';

@NgModule({
  declarations: [
    DescubrimientoPage,
  ],
  imports: [
    IonicPageModule.forChild(DescubrimientoPage),
  ],
  exports: [
    DescubrimientoPage
  ]
})
export class DescubrimientoPageModule {}
