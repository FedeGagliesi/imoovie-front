// Página de una película (ruta "/pelicula/:id"), como la ficha de la cartelera de referencia.
//
// Izquierda: afiche, clasificación, sinopsis y datos (formatos, duración, clasificación).
// Derecha:   franja de fechas, filtros de formato e idioma, y los horarios agrupados por cine.
// Al elegir un horario se va a la compra de esa función (/comprar/:funcionId).

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { obtenerPeliculas, estadoEstreno, CLASIFICACION_TEXTO } from '../data/peliculas'
import { obtenerFunciones, funcionesVigentes, formatosDePelicula, inicioFuncion, IDIOMAS, FORMATOS } from '../data/funciones'
import { obtenerEntradas, butacasLibres } from '../data/entradas'
import { obtenerSalas } from '../data/salas'
import { obtenerSucursales } from '../data/sucursales'
import { nivelDisponibilidad } from '../data/compra'
import { horaDe } from '../data/formato'
import Afiche from '../components/Afiche'
import FranjaFechas from '../components/pelicula/FranjaFechas'
import HorariosPorCine, { LeyendaDisponibilidad } from '../components/pelicula/HorariosPorCine'

function Pelicula() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pelicula = obtenerPeliculas().find((p) => p.id === Number(id) && p.activa)

  // Lo que se lee del almacenamiento se pide en cada render, así siempre está al día.
  const funciones = obtenerFunciones()
  const entradas = obtenerEntradas()
  const salas = obtenerSalas()
  const sucursales = obtenerSucursales()

  const vigentes = pelicula ? funcionesVigentes(pelicula.id, funciones) : []
  const fechas = [...new Set(vigentes.map((f) => f.fecha))].sort()

  const [fechaElegida, setFechaElegida] = useState('')
  const [formato, setFormato] = useState('')
  const [idioma, setIdioma] = useState('')
  const [sucursalId, setSucursalId] = useState('') // '' = todos los cines

  if (!pelicula) {
    return (
      <section>
        <h1>Película no disponible</h1>
        <p><Link to="/" className="enlace-texto">Volver a la cartelera</Link></p>
      </section>
    )
  }

  // La fecha activa: la elegida, o la primera que haya.
  const fechaActiva = fechas.includes(fechaElegida) ? fechaElegida : fechas[0] ?? ''
  const estado = estadoEstreno(pelicula)
  const formatos = formatosDePelicula(pelicula.id, funciones)

  // Filtros de la página: día, formato e idioma.
  const filtradas = vigentes
    .filter((f) => f.fecha === fechaActiva)
    .filter((f) => formato === '' || (f.formato ?? '2D') === formato)
    .filter((f) => idioma === '' || f.idioma === idioma)
    .filter((f) => {
      if (sucursalId === '') return true
      const sala = salas.find((s) => s.id === f.salaId)
      return sala?.sucursalId === Number(sucursalId)
    })
    .sort((a, b) => inicioFuncion(a) - inicioFuncion(b))

  // Agrupamos por cine (sucursal) y, dentro de cada cine, por formato + idioma.
  const cines = []
  filtradas.forEach((funcion) => {
    const sala = salas.find((s) => s.id === funcion.salaId)
    const sucursal = sucursales.find((s) => s.id === sala?.sucursalId)
    if (!sala || !sucursal) return
    let cine = cines.find((c) => c.sucursal.id === sucursal.id)
    if (!cine) {
      cine = { sucursal, grupos: [] }
      cines.push(cine)
    }
    const clave = `${funcion.formato ?? '2D'} · ${funcion.idioma}`
    let grupo = cine.grupos.find((g) => g.clave === clave)
    if (!grupo) {
      grupo = { clave, horarios: [] }
      cine.grupos.push(grupo)
    }
    const libres = butacasLibres(funcion, sala, entradas).length
    grupo.horarios.push({
      funcion,
      sala: sala.nombre,
      hora: horaDe(inicioFuncion(funcion)),
      nivel: nivelDisponibilidad(libres, sala.butacas.length),
    })
  })

  return (
    <div className="pelicula-pagina">
      <aside className="pelicula-ficha" aria-label="Datos de la película">
        <h1 className="pelicula-ficha-titulo">{pelicula.titulo}</h1>
        <Afiche pelicula={pelicula} className="pelicula-ficha-afiche" />
        {estado && <p className="pelicula-estado">{estado}</p>}

        <p className="pelicula-genero-chip">{pelicula.genero}</p>
        {pelicula.sinopsis && <p className="pelicula-sinopsis-completa">{pelicula.sinopsis}</p>}

        <dl className="ficha-datos">
          <dt>Formatos disponibles</dt>
          <dd>{formatos.length > 0 ? formatos.join(' · ') : 'Sin funciones a la venta'}</dd>
          <dt>Duración</dt>
          <dd>{pelicula.duracion} min</dd>
          <dt>Clasificación</dt>
          <dd>{CLASIFICACION_TEXTO[pelicula.clasificacion] ?? pelicula.clasificacion}</dd>
        </dl>
      </aside>

      <section className="pelicula-horarios" aria-labelledby="titulo-horarios">
        <h2 id="titulo-horarios" className="titulo-seccion">Horarios</h2>

        {fechas.length === 0 ? (
          <p>Todavía no hay funciones a la venta para esta película.</p>
        ) : (
          <>
            <FranjaFechas fechas={fechas} seleccionada={fechaActiva} onElegir={setFechaElegida} />

            <div className="filtros-horarios">
              <div className="campo">
                <label htmlFor="hor-sucursal">Cine</label>
                <select id="hor-sucursal" value={sucursalId} onChange={(e) => setSucursalId(e.target.value)}>
                  <option value="">Todos los cines</option>
                  {sucursales.filter((c) => c.activa).map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="hor-formato">Formato</label>
                <select id="hor-formato" value={formato} onChange={(e) => setFormato(e.target.value)}>
                  <option value="">Todos</option>
                  {FORMATOS.filter((f) => formatos.includes(f)).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="hor-idioma">Idioma</label>
                <select id="hor-idioma" value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                  <option value="">Todos</option>
                  {IDIOMAS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <LeyendaDisponibilidad />

            <HorariosPorCine
              cines={cines}
              onElegir={(funcion) => navigate(`/comprar/${funcion.id}`)}
            />
          </>
        )}
      </section>
    </div>
  )
}

export default Pelicula
