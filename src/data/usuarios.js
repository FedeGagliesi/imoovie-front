// USUARIOS SIMULADOS, solo para probar el login sin backend.
//
// OJO: en una aplicación real NUNCA se guardan contraseñas en el código
// del frontend. Esto es únicamente una simulación para la entrega.
//
// "rol" coincide con el nombre de la ruta a la que se redirige después
// de ingresar: /cliente, /vendedor o /admin.

// "usuario" y "clave" sirven para ingresar; "nombre" es lo que se muestra
// en pantalla ("Hola, Lucía").
export const usuarios = [
  { usuario: 'cliente', clave: 'cliente123', rol: 'cliente', nombre: 'Lucía' },
  { usuario: 'vendedor', clave: 'vendedor123', rol: 'vendedor', nombre: 'Martín' },
  { usuario: 'admin', clave: 'admin123', rol: 'admin', nombre: 'Camila' },
]

// Cómo se llama la zona de cada rol en el menú y en el botón de la landing.
export const zonas = {
  cliente: { menu: 'Mi cine', boton: 'Ir a mi cine' },
  vendedor: { menu: 'Mostrador', boton: 'Ir al mostrador' },
  admin: { menu: 'Panel admin', boton: 'Ir al panel' },
}

// Lista de roles para armar el <select> del login.
export const roles = [
  { valor: 'cliente', nombre: 'Cliente' },
  { valor: 'vendedor', nombre: 'Vendedor' },
  { valor: 'admin', nombre: 'Administrador' },
]
