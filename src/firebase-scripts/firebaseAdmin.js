const admin = require('firebase-admin');

// Importa tu clave privada descargada desde Firebase Console
const serviceAccount = require('./clave.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
