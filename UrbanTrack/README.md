# EDGO 🚌

Aplicación móvil (Expo + React Native) para el monitoreo de unidades de transporte urbano. Proyecto pensado como trabajo universitario: los ciudadanos ven las unidades en un mapa y pueden reportar quejas; el administrador gestiona unidades y quejas.

## 1. Estructura del proyecto

```
EDGO/
├── App.js
├── app.json
├── babel.config.js
├── package.json
└── src/
    ├── components/       # Button, Input, Card, Loading, EmptyState, Header, BusMarker, ComplaintCard
    ├── screens/
    │   ├── auth/          # Splash, Login, Register, ForgotPassword
    │   ├── user/           # Home, Map, UnitDetail, NewComplaint, MyComplaints, Profile
    │   └── admin/          # Dashboard, UnitsList, UnitForm, ComplaintsList, ComplaintDetail
    ├── navigation/         # AppNavigator, AuthNavigator, UserNavigator, AdminNavigator
    ├── firebase/           # config.js, authService.js, firestoreService.js
    ├── context/            # AuthContext.js
    ├── hooks/              # useAuth, useUnits, useComplaints
    ├── styles/             # colors.js, globalStyles.js
    └── utils/              # constants.js, validators.js, seedData.js
```

Copia toda la carpeta `EDGO/` tal cual la recibes; cada archivo ya está en el lugar donde Expo lo espera (por ejemplo `App.js` en la raíz, y todo el código fuente dentro de `src/`).

## 2. Requisitos previos

- Node.js 18 o superior
- Cuenta de [Firebase](https://console.firebase.google.com/) (gratuita)
- Expo Go instalado en tu celular, o un emulador Android/iOS
- Una API Key de Google Maps (para que el mapa se vea correctamente en Android/iOS)

## 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Authentication → Método de acceso → Correo/contraseña**.
3. Crea una base de datos en **Firestore Database** (modo de prueba está bien para el proyecto universitario).
4. (Opcional) Habilita **Realtime Database** si quieres usarla en vez de/junto a Firestore para las ubicaciones.
5. (Opcional) Habilita **Storage** si vas a permitir fotos de perfil o evidencias de quejas.
6. Ve a **Configuración del proyecto → Tus apps → Web (</>)** y copia el objeto `firebaseConfig`.
7. Pega esos valores en `src/firebase/config.js`, reemplazando los placeholders (`TU_API_KEY`, etc).

### Reglas de Firestore sugeridas (modo desarrollo)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /unidades/{unidadId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // en producción, restringir a admins
    }
    match /quejas/{quejaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null; // en producción, restringir a admins
    }
  }
}
```

### Crear un usuario administrador

Firebase Authentication no diferencia roles por sí solo. Para convertir un usuario en administrador:

1. Regístrate normalmente desde la app (rol "usuario" por defecto).
2. En Firestore, abre la colección `usuarios`, busca el documento con tu `uid` y cambia el campo `rol` de `"usuario"` a `"admin"`.
3. Cierra sesión y vuelve a iniciar sesión en la app: ahora entrarás directo al Dashboard de administrador.

## 4. Instalación

```bash
cd EDGO
npm install
```

## 5. Configurar Google Maps (react-native-maps)

En `app.json` reemplaza:

- `ios.config.googleMapsApiKey`
- `android.config.googleMaps.apiKey`

con tus propias API Keys de Google Cloud Console (Maps SDK for Android / iOS habilitado).

## 6. Ejecutar el proyecto

```bash
npx expo start
```

Escanea el código QR con la app **Expo Go** (Android) o la cámara (iOS), o presiona `a`/`i` para abrir un emulador.

## 7. Generar datos de prueba

La app puede generar automáticamente 10 unidades de ejemplo:

1. Inicia sesión como administrador.
2. En el **Dashboard**, si no hay unidades registradas, aparecerá el botón **"Generar datos de prueba"**. Púlsalo una vez.
3. Para generar quejas de prueba, puedes llamar manualmente a `seedQuejas(usuarioId)` (definida en `src/utils/seedData.js`) pasando el `id` de un usuario ya registrado, por ejemplo agregando temporalmente una llamada en algún `useEffect`.

## 8. Rol de conductor (ubicación real en vivo)

Además de "usuario" y "admin", la app tiene un tercer rol: **conductor**. Es la persona que maneja físicamente una unidad y comparte su ubicación GPS en tiempo real para que los ciudadanos la vean moverse en el mapa.

### Cómo funciona

1. Al registrarse, la persona elige el tipo de cuenta **"Conductor"** en la pantalla de Registro.
2. Se le pide seleccionar a qué unidad (de las ya creadas por el admin) va a manejar.
3. Al iniciar sesión, un conductor entra a su propia sección con la pantalla **"Mi Recorrido"**.
4. Ahí presiona **"Iniciar recorrido"**: la app pide permiso de ubicación y comienza a enviar su posición GPS a Firestore cada pocos segundos (usando `expo-location`), actualizando la unidad asignada.
5. Mientras el recorrido está activo, cualquier usuario que abra el **Mapa** ve la unidad moviéndose en tiempo real (gracias a la suscripción `onSnapshot` de `subscribeUnidades`).
6. Al presionar **"Finalizar recorrido"**, se detiene el GPS y la unidad pasa a estado "Fuera de servicio".

### Requisito previo

Para que alguien pueda registrarse como conductor, **primero debe existir al menos una unidad creada** (por el admin, desde el Dashboard o manualmente). Si no hay unidades, el registro se lo indica y no deja continuar.

### Archivos relacionados

- `src/screens/conductor/DriverRouteScreen.js` — pantalla principal del conductor.
- `src/navigation/ConductorNavigator.js` — navegación exclusiva para el rol conductor.
- `src/firebase/firestoreService.js` → función `actualizarUbicacionUnidad()`.
- `src/screens/auth/RegisterScreen.js` — selector de rol y unidad al registrarse.

### Nota sobre la simulación de movimiento (alternativa sin GPS real)

Si para tu demo no quieres depender del GPS real, en `src/firebase/firestoreService.js` sigue existiendo la función `simularMovimiento(unidad)`, que mueve aleatoriamente la latitud/longitud de una unidad. Puedes invocarla con `setInterval` desde cualquier pantalla de administración como alternativa rápida de demostración.

## 9. Flujo de navegación

- **Splash** → mientras Firebase determina si hay sesión activa.
- Si no hay sesión → **Login / Registro / Recuperar contraseña**.
- Si el usuario tiene rol `"usuario"` → tabs de **Inicio, Mapa, Quejas, Perfil**.
- Si el usuario tiene rol `"admin"` → tabs de **Dashboard, Unidades, Quejas, Perfil**.

## 10. Tecnologías usadas

- Expo (React Native) + JavaScript
- React Navigation (bottom tabs + native stack)
- Firebase Authentication, Firestore, Storage, Realtime Database
- react-native-maps + expo-location
- react-native-toast-message para notificaciones
- Componentes propios reutilizables (Button, Input, Card, etc.)

---

Cualquier duda sobre dónde va cada archivo: respeta exactamente la estructura de carpetas mostrada arriba; todos los `import` del proyecto ya están escritos con esas rutas relativas.
