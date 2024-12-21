import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Database, onValue, push, ref, remove, set, update } from '@angular/fire/database';
import { Storage, ref as storageRef, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Player } from '../app/models/players.model';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

import { ref as dbRef, update as dbUpdate } from "firebase/database";
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private collectionPath = 'jugadores'; // Ruta en Realtime Database

  constructor(private db: Database, private storage: Storage) {}

  // Obtener todos los jugadores
  getPlayers(): Observable<Player[]> {
    const playersRef = ref(this.db, this.collectionPath);
    return new Observable(subscriber => {
      onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const players: Player[] = Object.keys(data).map(key => ({
            ...data[key],
            firestoreId: key, // Clave como identificador único
          }));
          subscriber.next(players);
        } else {
          subscriber.next([]);
        }
      }, error => {
        console.error('Error al obtener jugadores:', error);
        subscriber.error(error);
      });
    });
  }
  
  // Agregar un nuevo jugador
  async addPlayer(player: Player): Promise<void> {
    const playersRef = ref(this.db, this.collectionPath); // Referencia a la colección
    const newPlayerRef = push(playersRef); // Crea un nodo único
    await set(newPlayerRef, player); // Guarda los datos del jugador
  }  
 
  // Actualizar un jugador existente
  async updatePlayer(player: Player): Promise<void> {
    if (!player.firestoreId) {
      console.error('firestoreId es undefined');
      return;
    }
    const playerRef = ref(this.db, `${this.collectionPath}/${player.firestoreId}`);
    await set(playerRef, player);
  }

  // Eliminar un jugador
  async deletePlayer(playerId: string): Promise<void> {
    if (!playerId) {
      console.error('Error: playerId es undefined');
      return;
    }
    const playerRef = ref(this.db, `${this.collectionPath}/${playerId}`);
    await remove(playerRef);
  }  

  async uploadFileAndUpdateDatabase(playerId: string, file: File, type: 'image' | 'video'): Promise<void> {
    // Lógica para subir archivos (sin modificar, ya que está comentada en tu código).
  }


  // Escuchar cambios en la base de datos y distinguir entre añadir y modificar
  listenForPlayerChanges() {
    const playersRef = ref(this.db, this.collectionPath);

    // Mantener un estado local de jugadores
    let currentPlayers: Record<string, any> = {};

    onValue(playersRef, (snapshot) => {
      const newData = snapshot.val();
      console.log('Datos cambiados en jugadores:', newData);

      // Convertir los nuevos datos en un objeto para comparación
      const newPlayers = newData || {};

      // Comparar los nuevos datos con los actuales
      for (const playerId in newPlayers) {
        if (!currentPlayers[playerId]) {
          // Si el jugador no existía antes, es un nuevo jugador
          const newPlayer = newPlayers[playerId];
          this.sendNotification(
            'Nuevo jugador añadido',
            `Se ha añadido un nuevo jugador: ${newPlayer.nombre} ${newPlayer.apellido}`
          );
        } else if (
          JSON.stringify(currentPlayers[playerId]) !== JSON.stringify(newPlayers[playerId])
        ) {
          // Si el jugador existía pero cambió, es una modificación
          const updatedPlayer = newPlayers[playerId];
          this.sendNotification(
            'Jugador modificado',
            `Se ha actualizado el jugador: ${updatedPlayer.nombre} ${updatedPlayer.apellido}`
          );
        }
      }

      // Actualizar el estado local
      currentPlayers = newPlayers;
    });
  }


  // Enviar notificación push
  sendNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'ruta/a/tu/icono.png', // Opcional: añade una URL de icono
      });
    } else {
      console.warn('Notificaciones no permitidas por el usuario.');
    }
  }
}
