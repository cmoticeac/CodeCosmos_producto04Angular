import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerFilterPipe } from './pipes/player-filter.pipe';
import { PlayersComponent } from './players-component/players-component.component';
import { DetailComponent } from './detail-component/detail-component.component';
import { MediaComponent } from './media-component/media-component.component';
import { InicioComponent } from './inicio/inicio.component';
import { CommonModule } from '@angular/common';
import { PLAYER_DATA } from '../data/data';
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../environments/firebase.config";
import { getDatabase, ref, onValue } from "firebase/database";
import { FirebaseService } from './firebase.service';
import { get } from "firebase/database";
import { NotificationService } from '../app/services/notificacion.service';
import { getMessaging, getToken } from 'firebase/messaging'; // Importar FCM

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    RouterOutlet,  
    PlayersComponent,    
    DetailComponent,  
    MediaComponent, 
    InicioComponent,  
    CommonModule,  
    PlayerFilterPipe, 
  ],
  providers: [FirebaseService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  playersData: any[] = [];
  app = initializeApp(firebaseConfig);
  db: any;
  fcmToken: string | null = null; // Para almacenar el token

  constructor(private notificationService: NotificationService) {
    this.db = getDatabase(this.app);
    this.generarConexion();
  }

  ngOnInit(): void {
    // Solicitar permisos para notificaciones y escuchar mensajes
    this.notificationService.requestPermission();
    this.notificationService.listenForMessages();

    // Obtener el token FCM al iniciar
    this.getFCMToken();
  }

  generarConexion(): void {
    const playersRef = ref(this.db, 'jugadores');
    get(playersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const playersData = snapshot.val(); 
          this.playersData = playersData ? Object.values(playersData) : [];
          console.log("Jugadores data:", this.playersData);
        } else {
          console.log("No hay datos disponibles.");
          this.playersData = [];
        }
      })
      .catch((error) => {
        console.error("Error al obtener datos de jugadores:", error);
      });
  }

  // Función para obtener el token FCM
  getFCMToken() {
    const messaging = getMessaging();
    // Asegúrate de reemplazar 'TU_CLAVE_VAPID' con tu clave VAPID obtenida desde Firebase
    getToken(messaging, { vapidKey: 'BCVruXR0pTgIqN7zIYCY_-ik6kTSuBOEOUVSBN-ChejltrmRAXN7_0SyZkMUjvHk6qbx5y39rYiwG9bJs3D9JBk' })
      .then((currentToken) => {
        if (currentToken) {
          this.fcmToken = currentToken; // Guarda el token
          console.log('Token de FCM obtenido:', currentToken); // Puedes usar este token para enviar mensajes
        } else {
          console.log('No se pudo obtener el token');
        }
      })
      .catch((err) => {
        console.log('Error al obtener el token FCM:', err);
      });
  }
}
