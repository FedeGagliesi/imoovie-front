// ALMACENAMIENTO LOCAL
//
// Cuando navegamos entre páginas, React destruye el componente anterior y
// su useState se pierde. Para que algo (como el historial de calificaciones)
// sobreviva, lo guardamos en localStorage: una memoria del navegador que
// NO se borra al cerrar la pestaña (a diferencia de sessionStorage).
//
// Igual que sessionStorage, guarda solo texto: usamos JSON para convertir.
// Los try/catch evitan errores si el navegador bloquea el almacenamiento.

// Lee un valor guardado. Si no hay nada (o falla), devuelve "porDefecto".
export function leer(clave, porDefecto) {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado ? JSON.parse(guardado) : porDefecto
  } catch {
    return porDefecto
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // sin almacenamiento disponible: el dato solo dura mientras la página esté abierta
  }
}
