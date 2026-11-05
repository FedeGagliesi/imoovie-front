// Logo de i-Moovie: un símbolo (cuadrado naranja con un "play") y el nombre
// escrito con letras. Se usa en la barra de navegación y en el pie de página.
//
// Es un componente SIMPLE: no recibe nada y dibuja siempre lo mismo.
//
// El símbolo se arma con CSS (un cuadrado con degradé y un triángulo recortado
// con clip-path), sin imágenes. Es decorativo (aria-hidden): para un lector de
// pantalla el logo es simplemente el texto "i-Moovie".

function Logo() {
  return (
    <span className="logo">
      <span className="logo-simbolo" aria-hidden="true">
        <span className="logo-play" />
      </span>
      <span className="logo-texto">
        <span className="logo-i">i-</span>Moovie
      </span>
    </span>
  )
}

export default Logo
