import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  async requestPermission(): Promise<void> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Permiso concedido para notificaciones');
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: 'BCVruXR0pTgIqN7zIYCY_-ik6kTSuBOEOUVSBN-ChejltrmRAXN7_0SyZkMUjvHk6qbx5y39rYiwG9bJs3D9JBk',
        });
        if (token) {
          console.log('Token del dispositivo:', token);
        } else {
          console.warn('No se pudo obtener el token.');
        }
      } else {
        console.error('Permiso denegado para notificaciones');
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  }

  listenForMessages(): void {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
    });
  }
}
