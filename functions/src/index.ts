import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Inicializa la app de Firebase Admin
admin.initializeApp();

// Función para manejar eventos onWrite
exports.onUserWrite = functions.database.ref("/users/{userId}")
  .onWrite(async (change, context) => {
    const afterData = change.after.exists() ? change.after.val() : null;
    const beforeData = change.before.exists() ? change.before.val() : null;

    console.log("Datos anteriores:", beforeData);
    console.log("Datos nuevos:", afterData);

    if (afterData) {
      const payload = {
        notification: {
          title: "Cambio en Usuario",
          body: `Se actualizó el usuario: ${afterData.name || "Desconocido"}`,
        },
        topic: "general",
      };

      try {
        await admin.messaging().send(payload);
        console.log("Notificación enviada.");
      } catch (error) {
        console.error("Error al enviar la notificación:", error);
      }
    }
  });
