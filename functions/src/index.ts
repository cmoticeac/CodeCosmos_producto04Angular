import {onValueCreated} from "firebase-functions/v2/database";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin SDK
admin.initializeApp();

// Función para manejar la creación de un nuevo usuario en la base de datos
export const onUserCreate = onValueCreated("/users/{userId}", (event) => {
  const userData = event.data.val(); // Obtener los datos del nuevo usuario

  console.log("Nuevo usuario creado:", userData);

  // Lógica adicional como enviar notificaciones o realizar más acciones aquí

  return null;
});
