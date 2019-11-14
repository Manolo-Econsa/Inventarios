import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BarcodeScanner } from "@ionic-native/barcode-scanner";

import { MyApp } from './app.component';
import { ServiciosProvider } from '../providers/servicios/servicios';
import { HttpModule } from '@angular/http';
//import { Camera } from '@ionic-native/camera';
import { IonicStorageModule } from "@ionic/storage";

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpModule,
    IonicModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner, //scaner de qr
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ServiciosProvider,
    //Camera
  ]
})
export class AppModule {}
