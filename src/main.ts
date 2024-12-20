import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import {provideDatabase, getDatabase } from '@angular/fire/database'; 
//import { provideStorage, getStorage } from '@angular/fire/storage';
import { firebaseConfig } from './environments/firebase.config';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Usa firebaseConfig aquí sin production
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    //provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    { provide: FIREBASE_OPTIONS, useValue: firebaseConfig }
  ]
}).catch(err => console.error(err));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch((error) => {
      console.error('Error al registrar el Service Worker:', error);
    });
}