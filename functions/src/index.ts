import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.sendNotificationOnWrite = functions.database.ref("/users/{userId}")
  .onWrite(async (change: functions.Change<functions.database.DataSnapshot>) => {
    const afterData = change.after.val();

    const payload = {
      notification: {
        title: "Actualización en la Base de Datos",
        body: `Se actualizó el usuario: ${afterData?.name || "Desconocido"}`,
      },
      topic: "general",
    };

    try {
      await admin.messaging().send(payload);
      console.log("Notificación enviada con éxito.");
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  });
