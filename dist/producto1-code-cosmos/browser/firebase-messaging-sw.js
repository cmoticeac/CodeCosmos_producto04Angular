try {
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

  const firebaseConfig = {
    apiKey: "AIzaSyBW2TZzcM7tAAiS2zsBGvev4sPBdYnTkrw",
    authDomain: "producto2-63d62.firebaseapp.com",
    databaseURL: "https://producto2-63d62-default-rtdb.firebaseio.com/",
    projectId: "producto2-63d62",
    storageBucket: "producto2-63d62.firebasestorage.app",
    messagingSenderId: "549088204019",
    appId: "1:549088204019:web:65790dda1e88fda43b1386",
    measurementId: "G-70LBQTLNL1"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || '/assets/default-icon.png',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('Error al ejecutar el Service Worker:', error);
}
