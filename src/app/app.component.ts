import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayersComponent } from './players-component/players-component.component';
import { DetailComponent } from './detail-component/detail-component.component';
import { MediaComponent } from './media-component/media-component.component';
import { InicioComponent } from './inicio/inicio.component';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './services/notificacion.service';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { firebaseConfig } from '../environments/firebase.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    PlayersComponent,
    DetailComponent,
    MediaComponent,
    InicioComponent,
  ],
  providers: [FirebaseService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  playersData: any[] = [];
  private app = initializeApp(firebaseConfig);
  private db = getDatabase(this.app);

  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en la base de datos Realtime Database
    this.listenToPlayersData();

    // Configurar notificaciones push
    this.setupPushNotifications();
  }

  /**
   * Escucha los datos en tiempo real desde la base de datos.
   */
  private listenToPlayersData(): void {
    const playersRef = ref(this.db, 'jugadores');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      this.playersData = data ? Object.values(data) : [];
      console.log('Datos de jugadores:', this.playersData);
    });
  }

  /**
   * Configura notificaciones push y obtiene el token del dispositivo.
   */
  private setupPushNotifications(): void {
    this.notificationService.requestPermission();
    this.notificationService.listenForMessages();
  }

  /**
   * Añade un jugador directamente desde el cliente a la base de datos.
   */
  addPlayer(player: any): void {
    const newPlayerRef = ref(this.db, `jugadores/${player.id}`);
    set(newPlayerRef, player)
      .then(() => console.log('Jugador añadido:', player))
      .catch((error) => console.error('Error al añadir jugador:', error));
  }
}
