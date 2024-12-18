const admin = require('firebase-admin');
const serviceAccount = require('./clave.json'); // Ajusta la ruta de tu clave privada JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const message = {
  notification: {
    title: 'Hola!',
    body: 'Este es un mensaje de prueba desde Firebase.',
  },
  token: 'fr5TVpOALxsfGvrKVVjF-V:APA91bG6uNM8bYvaxfxfoAuQospllDZ4X_tRZEJOkHuRwliPMEO4JzNjVTTvnFp_ejPifa8A-PIf9vdblvhXuT4pzBdzF7XpFN_o3K0yXCTjYxJBjrmM-H0', // Reemplaza con tu token del dispositivo
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Mensaje enviado con éxito:', response);
  })
  .catch((error) => {
    console.log('Error al enviar el mensaje:', error);
  });
