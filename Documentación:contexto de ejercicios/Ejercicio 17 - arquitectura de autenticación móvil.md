# Ejercicio 17 — Arquitectura de autenticación móvil

La app móvil separa las rutas de navegación, las pantallas de autenticación y los
servicios que conectan con la API. El backend y la app viven en carpetas distintas:
`backend/` y `mobile/`.

## Estructura

```text
mobile/src/
├── app/                         # Rutas y layouts de Expo Router
│   ├── (auth)/
│   │   ├── _layout.tsx          # Navegación del grupo
│   │   ├── login.tsx            # Ruta /login
│   │   └── register.tsx         # Ruta /register
│   ├── dashboard.tsx            # Ruta del dashboard
│   └── index.tsx                # Redirección inicial
├── features/
│   ├── auth/
│   │   ├── api/                 # Login y registro
│   │   ├── components/          # Campos reutilizables de autenticación
│   │   ├── context/             # Estado global y AuthProvider
│   │   ├── hooks/               # Hook useAuth
│   │   ├── screens/             # Login y registro
│   │   ├── services/            # Orquestación de la sesión
│   │   ├── storage/             # Persistencia segura del JWT
│   │   └── types/               # Tipos de autenticación
│   └── dashboard/
│       ├── api/                 # Consulta del resumen
│       ├── screens/             # Pantalla principal
│       └── types/               # Tipos del dashboard
└── shared/
    ├── api/                     # Axios e interceptor JWT
    └── constants/               # Tema visual compartido
```

Las rutas de Expo Router permanecen en `src/app/`. El grupo `(auth)` organiza login y
registro sin agregar un segmento a sus URLs; sus archivos conectan cada URL con la
pantalla correspondiente. La lógica y las vistas están fuera de esa carpeta, dentro
de su funcionalidad.

## Responsabilidades

| Módulo | Responsabilidad |
|---|---|
| `shared/api/http.ts` | Configura Axios, toma la URL de `EXPO_PUBLIC_API_URL` y agrega el JWT como Bearer. |
| `features/auth/api/authApi.ts` | Envía las solicitudes de login y registro al backend. |
| `features/auth/storage/secureStore.ts` | Guarda, lee y elimina el access token con Expo SecureStore. |
| `features/auth/services/authService.ts` | Coordina API y almacenamiento para iniciar, restaurar o cerrar sesión. |
| `features/auth/context/AuthContext.tsx` | Mantiene el estado global y expone `signIn`, `signUp` y `signOut`. |
| `features/auth/hooks/useAuth.ts` | Permite consumir el contexto desde las pantallas. |
| `features/auth/screens/` | Presenta los formularios y conecta sus acciones con el contexto. |
| `features/dashboard/` | Solicita y muestra la información protegida del dashboard. |

## Flujo de sesión

1. `AuthProvider` revisa SecureStore al iniciar y publica `checking` mientras lo hace.
2. El formulario llama a `signIn` o `signUp` desde `useAuth`.
3. El contexto delega la operación a `authService`; este llama a `authApi` y guarda el access token recibido.
4. Axios adjunta el token a las solicitudes protegidas.
5. El contexto cambia el estado a `authenticated` y Expo Router muestra el dashboard.
6. Al salir, `authService` elimina el token y el contexto vuelve a `not-authenticated`.

## Estado actual y alcance

El backend devuelve un access token JWT con vigencia de 60 minutos. La app lo conserva
en SecureStore y lo envía en solicitudes protegidas. El backend actual no ofrece un
endpoint de renovación ni emite refresh tokens; por eso esta implementación no
renueva automáticamente una sesión vencida.

El `AuthProvider` envuelve el Stack de Expo Router en `src/app/_layout.tsx`. La ruta
raíz redirige según el estado, y la pantalla del dashboard vuelve al login si no hay
sesión autenticada.
