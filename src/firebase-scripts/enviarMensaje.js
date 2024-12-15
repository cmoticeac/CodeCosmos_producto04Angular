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
  token: 'AQUI_TU_TOKEN_DEL_DISPOSITIVO', // Reemplaza con tu token del dispositivo
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Mensaje enviado con éxito:', response);
  })
  .catch((error) => {
    console.log('Error al enviar el mensaje:', error);
  });
