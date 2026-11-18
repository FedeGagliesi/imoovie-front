# i-Moovie · Frontend

Aplicación web de un cine hecha con **React** (Vite + react-router-dom). Es solo frontend: replica las funcionalidades de la API del backend (`i-Moovie - Entrega`), pero los datos son simulados y se guardan en el navegador (`localStorage`); no hay llamadas HTTP.

## Cómo correrlo

```bash
npm install     # una sola vez
npm run dev     # abrir http://localhost:5173
```

Otros comandos: `npm run build` (versión final) y `npm run lint` (revisión de código).

## Usuarios de prueba

El login se hace con **email y contraseña**; el rol viene con la cuenta.

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | `cliente@imoovie.com` | `cliente123` |
| Vendedor | `vendedor@imoovie.com` | `vendedor123` |
| Administrador | `admin@imoovie.com` | `admin123` |

Desde la pantalla de login también se puede **crear una cuenta de cliente**.

## Documentación

Todo está explicado en **[DOCUMENTACION.md](DOCUMENTACION.md)**: arquitectura, rutas, componentes, conceptos de React usados y cómo se construyó cada parte.
