// SESIÓN SIMULADA
//
// Para saber "quién ingresó" desde cualquier página guardamos un dato en
// sessionStorage: una memoria del NAVEGADOR que dura mientras la pestaña
// está abierta y se borra al cerrarla. Sirve para esta simulación sin
// necesidad de Context ni de estado global.
//
// sessionStorage solo guarda TEXTO, por eso convertimos el objeto con
// JSON.stringify (objeto → texto) y JSON.parse (texto → objeto).
//
// Los try/catch evitan que la app se rompa si el navegador bloquea el
// almacenamiento (por ejemplo, en una ventana privada muy restrictiva).

const CLAVE = 'imoovie-sesion'

export function iniciarSesion(usuario) {
  try {
    sessionStorage.setItem(
      CLAVE,
      JSON.stringify({ usuario: usuario.usuario, rol: usuario.rol, nombre: usuario.nombre }),
    )
  } catch {
    // sin almacenamiento disponible: la sesión simplemente no se guarda
  }
}

// Devuelve { usuario, rol } o null si no hay nadie con sesión iniciada.
export function obtenerSesion() {
  try {
    const guardado = sessionStorage.getItem(CLAVE)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export function cerrarSesion() {
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {
    // nada que borrar
  }
}
