const admin = require('./firebaseAdmin');

async function sendPushNotification(token, title, body) {
  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Mensaje enviado exitosamente:', response);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
}

// Token del dispositivo y datos de prueba
const deviceToken = 'cIcHFB2gOXcb8fth4b9ovs:APA91bE0Dq5MFkN6rFK9GgAz62Tisz7Rb8pRT5EeRpj15WusETWItYCwlcgSLlKvEqaVoh-7_E7unAl_x-OioEL28f1OeBHTK9RIVsJUxoQBJgOTenLCSrk';
sendPushNotification(deviceToken, 'Mensaje de Prueba', 'Notificación desde Firebase Admin SDK');

