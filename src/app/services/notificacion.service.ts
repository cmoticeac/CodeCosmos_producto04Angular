import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  // Solicitar permisos al usuario
  async requestPermission(): Promise<void> {
    const messaging = getMessaging();
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Permiso concedido para notificaciones');
        this.getDeviceToken(messaging);
      } else {
        console.error('Permiso denegado');
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  }

  // Obtener el token del dispositivo
  private async getDeviceToken(messaging: any): Promise<void> {
    try {
      const token = await getToken(messaging, {
        vapidKey: 'BCVruXR0pTgIqN7zIYCY_-ik6kTSuBOEOUVSBN-ChejltrmRAXN7_0SyZkMUjvHk6qbx5y39rYiwG9bJs3D9JBk', // Sustituye con tu clave VAPID de Firebase Cloud Messaging
      });
      if (token) {
        console.log('Token del dispositivo:', token);
      } else {
        console.warn('No se pudo obtener el token.');
      }
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }
  }

  // Escuchar notificaciones entrantes
  listenForMessages(): void {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      // Puedes mostrar una notificación aquí o manejar la lógica del mensaje
    });
  }
}