// USUARIOS SIMULADOS, solo para probar el login sin backend.
//
// OJO: en una aplicación real NUNCA se guardan contraseñas en el código
// del frontend. Esto es únicamente una simulación para la entrega.
//
// Igual que en el backend, el login se hace con EMAIL y contraseña, y el rol
// viene con la cuenta (no lo elige quien ingresa). "rol" coincide con el nombre
// de la ruta a la que se redirige después de ingresar: /cliente, /vendedor o /admin.
//
// Las cuentas de cliente que se registran en la pantalla de login se guardan en
// localStorage, junto con estas cuentas de prueba.

import { leer, guardar } from './almacenamiento'

const CLAVE_REGISTRADOS = 'imoovie-usuarios'

export const usuariosIniciales = [
  { email: 'cliente@imoovie.com', clave: 'cliente123', rol: 'cliente', nombre: 'Lucía', telefono: '1155550001' },
  { email: 'vendedor@imoovie.com', clave: 'vendedor123', rol: 'vendedor', nombre: 'Martín', telefono: '1155550002' },
  { email: 'admin@imoovie.com', clave: 'admin123', rol: 'admin', nombre: 'Camila', telefono: '1155550003' },
]

// Todas las cuentas: las de prueba más las que se registraron.
export function obtenerUsuarios() {
  return [...usuariosIniciales, ...leer(CLAVE_REGISTRADOS, [])]
}

// Busca una cuenta por email (sin distinguir mayúsculas).
export function buscarUsuarioPorEmail(email) {
  const buscado = email.trim().toLowerCase()
  return obtenerUsuarios().find((u) => u.email.toLowerCase() === buscado)
}

// Guarda una cuenta de cliente nueva. La validación se hace antes, en la pantalla.
export function registrarCliente({ email, clave, nombre, telefono }) {
  const registrados = leer(CLAVE_REGISTRADOS, [])
  const nueva = { email: email.trim(), clave, rol: 'cliente', nombre: nombre.trim(), telefono: telefono.trim() }
  guardar(CLAVE_REGISTRADOS, [...registrados, nueva])
  return nueva
}

// Cómo se llama la zona de cada rol en el menú y en el botón de la landing.
export const zonas = {
  cliente: { menu: 'Mi cine', boton: 'Ir a mi cine' },
  vendedor: { menu: 'Mostrador', boton: 'Ir al mostrador' },
  admin: { menu: 'Panel admin', boton: 'Ir al panel' },
}
