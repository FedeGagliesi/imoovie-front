// SESIÓN SIMULADA
//
// Para saber "quién ingresó" desde cualquier página guardamos un dato en
// sessionStorage: una memoria del NAVEGADOR que dura mientras la pestaña
// está abierta y se borra al cerrarla. Sirve para esta simulación sin
// necesidad de Context ni de estado global.
//
// "usuario" guarda el EMAIL de la cuenta (es su identificador, como en el backend).
//
// Los try/catch evitan que la app se rompa si el navegador bloquea el
// almacenamiento (por ejemplo, en una ventana privada muy restrictiva).

const CLAVE = 'imoovie-sesion'

export function iniciarSesion(cuenta) {
  try {
    sessionStorage.setItem(
      CLAVE,
      JSON.stringify({ usuario: cuenta.email, rol: cuenta.rol, nombre: cuenta.nombre }),
    )
  } catch {
    // sin almacenamiento disponible: la sesión simplemente no se guarda
  }
}

// Devuelve { usuario, rol, nombre } o null si no hay nadie con sesión iniciada.
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
