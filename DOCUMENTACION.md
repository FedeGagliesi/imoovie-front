# i-Moovie · Documentación del Frontend (React)

Aplicación web de un cine, hecha con **React** para la materia *Aplicaciones Interactivas*. Es **solo frontend**: no se conecta a ningún backend y trabaja con datos simulados que se guardan en el navegador.

Este documento explica cómo está armado el proyecto para que cualquier compañero pueda entenderlo, correrlo y modificarlo. Está organizado así:

1. [Qué es i-Moovie](#1-qué-es-i-moovie)
2. [Cómo correrlo y probarlo](#2-cómo-correrlo-y-probarlo)
3. [Tecnologías](#3-tecnologías)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Mapa de rutas y pantallas](#5-mapa-de-rutas-y-pantallas)
6. [Arquitectura: cómo se conectan las piezas](#6-arquitectura-cómo-se-conectan-las-piezas)
7. [Los datos](#7-los-datos)
8. [Índice de conceptos de React](#8-índice-de-conceptos-de-react)
9. [Accesibilidad y adaptabilidad](#9-accesibilidad-y-adaptabilidad)
10. [Cómo se cumple la rúbrica](#10-cómo-se-cumple-la-rúbrica)
11. [Limitaciones conocidas y mejoras posibles](#11-limitaciones-conocidas-y-mejoras-posibles)
12. [Calidad técnica](#12-calidad-técnica)
13. [Bitácora de construcción (parte por parte)](#bitácora-de-construcción)

---

## 1. Qué es i-Moovie

Un cine con **tres tipos de usuario**, cada uno con su propia zona:

| Rol | Qué hace |
|---|---|
| **Cliente** | Busca funciones con filtros (sucursal, película, día, horario, butacas libres, precio), elige sus butacas en un mapa, suma candy, confirma la compra y recibe un comprobante con su **código QR**. Después puede calificar películas y ver su historial de calificaciones. |
| **Vendedor** | Trabaja en una sucursal: **vende entradas en el mostrador** a quien no compró online (elige función, fila y asiento, y cobra), vende candy sin cuenta de cliente, entrega los pedidos de candy que los clientes hicieron online y ve lo vendido en el día. |
| **Administrador** | Gestiona películas, funciones, sucursales y productos de candy. |

Además hay una **landing pública** con una carta de presentación de la plataforma y la cartelera, una página **Quiénes somos** con los integrantes del grupo y un formulario de **contacto**.

---

## 2. Cómo correrlo y probarlo

```bash
npm install     # una sola vez: instala las dependencias
npm run dev     # levanta el servidor de desarrollo
```

Abrir `http://localhost:5173` (Vite avisa en la terminal si usa otro puerto). Otros comandos: `npm run build` (versión final) y `npm run lint` (revisión de código).

### Usuarios de prueba

| Rol | Usuario | Contraseña | Nombre que se muestra |
|---|---|---|---|
| Cliente | `cliente` | `cliente123` | Lucía |
| Vendedor | `vendedor` | `vendedor123` | Martín |
| Administrador | `admin` | `admin123` | Camila |

En el login hay que elegir también el rol que corresponde al usuario.

### Recorrido sugerido para mostrar el proyecto (5 minutos)

1. **Landing:** mirar la cartelera; entrar como `cliente`.
2. **Comprar entradas:** usar los filtros del buscador, elegir una función, elegir butacas, sumar candy y confirmar.
3. **Mis calificaciones:** calificar la película con estrellas y un comentario; ver el historial.
4. **Salir** y entrar como `vendedor`: elegir la sucursal, **vender una entrada en el mostrador** (función, fila y asiento), entregar el pedido de candy que dejó el cliente y registrar una venta de candy.
5. **Salir** y entrar como `admin`: programar una función y agregar un producto de candy; después volver a entrar como cliente y comprobar que ya se pueden buscar y comprar.

### Reiniciar los datos

Todo lo que se carga (compras, ventas, películas nuevas, calificaciones) queda guardado en el navegador. Para empezar de cero, abrir la consola del navegador (F12) y ejecutar:

```js
localStorage.clear(); sessionStorage.clear()
```

---

## 3. Tecnologías

| Herramienta | Para qué sirve |
|---|---|
| **Node.js** | Ejecuta JavaScript fuera del navegador; se usa solo durante el desarrollo. |
| **Vite** | Levanta el servidor de desarrollo, recarga la página al guardar y genera la versión final. |
| **React 19** | Librería para armar la interfaz con componentes. |
| **react-router-dom** | Manejo de rutas (`/`, `/login`, `/admin`, ...). Se usa en toda la aplicación. |
| **qrcode.react** | Dibuja el **código QR** de la entrada (componente `<QRCodeSVG>`). Es la segunda y última librería extra. |
| **Oxlint** | Revisa el código buscando errores y malas prácticas. |
| **Google Fonts** | Tipografías *Big Shoulders Display* (títulos) y *DM Sans* (texto). Sin conexión se usa la del sistema. |

**No se usan:** Context API, Redux ni TypeScript, ni librerías de formularios o de componentes visuales. Toda la interfaz está hecha a mano con HTML y CSS. Las **únicas librerías extra** son `react-router-dom` (las rutas) y `qrcode.react` (el QR de la entrada): armar un QR a mano exige programar su corrección de errores y es muy fácil de equivocar, así que se usa una librería probada.

---

## 4. Estructura de carpetas

```
imoovie-front/
├── index.html          → la única página HTML; tiene un <div id="root">, el idioma y las tipografías
├── package.json        → dependencias y scripts
├── DOCUMENTACION.md    → este documento
├── public/
│   └── favicon.svg     → ícono de la pestaña (el símbolo del logo)
└── src/
    ├── main.jsx        → punto de entrada: monta <App /> dentro de #root
    ├── App.jsx         → componente raíz: define todas las rutas
    ├── index.css       → estilos globales: paleta (fondo negro, texto blanco y detalles naranjas), tipografías, títulos
    ├── App.css         → estilos de toda la interfaz
    │
    ├── pages/          → UNA página por cada ruta
    │   ├── Landing.jsx     (/)
    │   ├── Contacto.jsx    (/contacto)
    │   ├── Nosotros.jsx    (/nosotros)
    │   ├── Login.jsx       (/login)
    │   ├── Cliente.jsx     (/cliente)    → contenedor con pestañas
    │   ├── Vendedor.jsx    (/vendedor)
    │   ├── Admin.jsx       (/admin)      → contenedor con pestañas
    │   └── NotFound.jsx    (cualquier otra URL → 404)
    │
    ├── components/     → piezas reutilizables
    │   ├── NavBar.jsx, Footer.jsx, Logo.jsx, IntegranteCard.jsx, RutaProtegida.jsx, TituloDePagina.jsx
    │   ├── Afiche.jsx, PeliculaCard.jsx, FichaPelicula.jsx   → cartelera: el afiche, la tarjeta y la ventana con la información
    │   ├── CompraEntradas.jsx   → el flujo de compra por pasos
    │   ├── BuscadorFunciones.jsx, MapaButacas.jsx, ProductoCandy.jsx, EntradaQR.jsx
    │   ├── MisCalificaciones.jsx, Estrellas.jsx, EstrellasFijas.jsx
    │   ├── vendedor/    → MostradorEntradas, MostradorCandy (las dos pestañas del vendedor)
    │   └── admin/       → una pestaña del panel por archivo:
    │                      AdminPeliculas, AdminFunciones, AdminSucursales,
    │                      AdminCandy
    │
    └── data/           → datos y lógica SIN pantalla (funciones comunes de JavaScript)
        ├── peliculas.js, funciones.js, sucursales.js, candy.js, usuarios.js, integrantes.js
        ├── compras.js, ventas.js, calificaciones.js → registros de lo que se vendió y calificó
        ├── sesion.js, almacenamiento.js → sesión y acceso al navegador
        ├── busqueda.js                  → cálculos del buscador (filtros y butacas libres)
        └── formato.js                   → precios, fechas, número de entrada
```

La regla es simple: **`pages/`** arma cada pantalla, **`components/`** son las piezas reutilizables y **`data/`** guarda los datos y los cálculos. Ningún archivo de `data/` dibuja nada.

---

## 5. Mapa de rutas y pantallas

| Ruta | Página | Quién puede entrar | Qué tiene |
|---|---|---|---|
| `/` | Landing | Todos | Hero, carta de presentación de la plataforma y cartelera de películas activas con afiches. Al tocar un afiche se abre la ficha (género, duración, edad, sinopsis) con el botón que corresponde: **Ingresar para comprar entradas** sin sesión, o **Comprar entradas** y **★ Calificar** con sesión de cliente |
| `/contacto` | Contacto | Todos | Formulario con validación y confirmación |
| `/nosotros` | Quiénes somos | Todos | Presentación del grupo, tarjetas de los integrantes y enlace a Contacto. Su enlace en el menú se ve siempre, con o sin sesión |
| `/login` | Login | Todos | Usuario, contraseña y rol; redirige a la zona del rol |
| `/cliente` | Mi cine | Solo clientes | Pestañas: **Comprar entradas** (buscador → butacas → candy → confirmar → comprobante con QR), **Mis calificaciones** |
| `/vendedor` | Mostrador | Solo vendedores | Sucursal y pestañas: **Vender entradas** (función, fila y asiento, cobro con comprobante y QR, entradas vendidas hoy) y **Candy y pedidos** (venta de candy, pedidos online por retirar, ventas de hoy) |
| `/admin` | Panel admin | Solo administradores | Pestañas: **Películas**, **Funciones**, **Sucursales**, **Candy** |
| cualquier otra | Página 404 | Todos | Mensaje y botones para volver |

Las tres rutas de zona están **protegidas**: sin la sesión del rol correcto redirigen a `/login` (componente `RutaProtegida`). Dentro de `/cliente` y `/admin` las pestañas **no son rutas**: se resuelven con un estado y renderizado condicional.

---

## 6. Arquitectura: cómo se conectan las piezas

### El camino de los datos

```
          data/  (datos y cálculos)
            │   leen y escriben en el navegador (localStorage / sessionStorage)
            ▼
   pages/ y components/   ← aquí viven los estados (useState) y los eventos
            │   pasan datos hacia abajo con props
            ▼
   componentes chicos que solo dibujan (MapaButacas, ProductoCandy, EstrellasFijas...)
```

- **El navegador hace de "base de datos".** `almacenamiento.js` envuelve `localStorage` (datos que perduran) y `sesion.js` envuelve `sessionStorage` (la sesión, que dura mientras la pestaña está abierta).
- **Cada tipo de dato tiene sus funciones** `obtenerX()` y `guardarX()` (películas, funciones, sucursales, candy, compras, ventas). Los componentes nunca tocan `localStorage` directamente.
- **Los estados viven en el componente que los necesita**, y se bajan a los hijos por props. Cuando dos partes necesitan lo mismo, el estado sube al padre común ("levantar el estado").
- **Como no hay estado global**, lo que tiene que compartirse entre páginas (por ejemplo, el catálogo que carga el admin y compra el cliente) se guarda en `localStorage`: cada página lo lee al abrirse.

### Qué se guarda y dónde

| Clave en el navegador | Qué contiene | Quién escribe | Quién lee |
|---|---|---|---|
| `imoovie-peliculas` | Películas (con estado activa/baja) | Admin | Landing, compra, calificaciones |
| `imoovie-sucursales` | Sucursales | Admin | Compra, vendedor |
| `imoovie-funciones` | Funciones (película + sucursal + día + hora + sala + precio) | Admin | Buscador, mapa de butacas |
| `imoovie-candy` | Productos de candy y sus precios | Admin | Compra del cliente, vendedor |
| `imoovie-compras` | Compras confirmadas (entradas + candy), tanto online como de mostrador | Cliente (online) y vendedor (entradas de mostrador; marca los pedidos entregados) | Butacas ocupadas, vendedor |
| `imoovie-ventas` | Ventas de candy del mostrador | Vendedor | Vendedor |
| `imoovie-calificaciones-<usuario>` | Calificaciones de cada cliente | Cliente | Calificaciones |
| `imoovie-sesion` *(sessionStorage)* | Quién ingresó (usuario, rol, nombre) | Login | Barra de navegación, rutas protegidas, todas las zonas |

### Patrones que se repiten en el proyecto

- **Contenedor con pestañas:** `Cliente` y `Admin` solo guardan cuál pestaña está activa y muestran el componente que corresponde.
- **Componentes "tontos" y reutilizables:** reciben todo por props y no guardan estado propio (`ProductoCandy` se usa en el cliente y en el vendedor; `MapaButacas` se usa en la compra online y en la venta de mostrador).
- **Separar el cálculo del dibujo:** `armarResultados` y `filtrarResultados` (en `data/busqueda.js`) son funciones comunes que devuelven los datos ya listos; el componente solo los dibuja.
- **Datos derivados:** lo que se puede calcular a partir de otro estado no se guarda en un estado propio (totales, listas filtradas, butacas libres).
- **Formularios iguales:** un estado `datos`, un `handleChange` genérico por `name`, una función `validar` que devuelve un objeto de errores.
- **Baja lógica:** películas, sucursales y productos no se borran: se marcan como inactivos y se pueden reactivar.

---

## 7. Los datos

### Entidades y relaciones

```
Película 1 ──── * Función * ──── 1 Sucursal
                    │
Compra ─ funcionId ─┘     (película y sucursal también quedan en la compra)
Venta de mostrador ─ sucursalId
Calificación ─ peliculaId   (una por película y por cliente)
```

- **Película:** `id`, `titulo`, `genero`, `duracion`, `clasificacion`, `sinopsis`, `color`, `activa`.
- **Función:** `id`, `peliculaId`, `sucursalId`, `fecha` ("AAAA-MM-DD"), `hora` ("HH:MM"), `sala`, `precio`.
- **Sucursal:** `id`, `nombre`, `direccion`, `activa`.
- **Producto de candy:** `id`, `nombre`, `descripcion`, `precio`, `activo`.
- **Compra:** `id`, `fecha`, `numero`, `usuario`, `sucursalId`, `peliculaId`, `funcionId`, `butacas`, `totalEntradas`, `lineasCandy`, `totalCandy`, `retirado`. Las entradas vendidas en el mostrador son una compra más, con `origen: 'mostrador'`, `usuario: 'mostrador'`, el nombre del `cliente` (opcional), el `vendedor` y el medio de `pago`.
- **Venta de mostrador:** `id`, `fecha`, `sucursalId`, `pago`, `total`, `lineas`.
- **Calificación:** `id`, `peliculaId`, `estrellas`, `comentario`, `fecha`.

Las compras y ventas guardan **una copia** del nombre y el precio de cada producto: si el precio cambia mañana, el registro sigue mostrando lo que realmente se pagó.

### Cómo se calcula la disponibilidad de butacas

Todas las salas tienen 6 filas (A a F) y 8 butacas por fila (48). Una butaca no está disponible si:

1. Es una de las "ocupadas simuladas" de esa función (se calculan con una cuenta fija, sin números al azar, para que siempre sean las mismas), **o**
2. Ya se vendió: un cliente la compró online **o** el vendedor la vendió en el mostrador (figura en `imoovie-compras`).

---

## 8. Índice de conceptos de React

Cada concepto se explica en la parte de la bitácora donde apareció por primera vez.

| Concepto | Dónde se explica |
|---|---|
| Componente, JSX, `{ }`, `export default` | Parte 1 |
| Rutas: `BrowserRouter`, `Routes`, `Route`, `Link` | Parte 2 |
| Props y listas con `.map()` + `key` | Parte 3 |
| `useState`, inputs controlados, `onSubmit` + `preventDefault`, validación | Parte 4 |
| `useNavigate` y `.find()` | Parte 5 |
| Renderizado condicional (`&&`, ternario, `if` + `return`), datos derivados, `.filter()` | Parte 6 |
| Estado con arrays sin mutarlos, levantar el estado, funciones como props | Parte 6b |
| Estado con objetos, `.reduce()` | Parte 6c |
| `sessionStorage`, `useLocation`, prop `children`, `<Navigate>` | Parte 7 |
| `localStorage`, `useState` con función, `Link` con `state`, atributo `hidden` | Parte 8a |
| Reutilizar componentes en otra pantalla, `.some()` | Partes 9 y 10 |
| Modificar un elemento de una lista, baja lógica | Parte 10 |
| Relaciones entre listas, pestañas con montaje condicional | Parte 11 |
| Edición de una fila en una tabla | Parte 12 |
| Combinar muchos filtros, funciones de comparación para `.sort`, `Set`, `flatMap`, separar cálculo y dibujo | Parte 13 |
| `useEffect` (título de la pestaña), ruta comodín | Parte 14 |
| `key` para reiniciar un componente, dos formas de elegir lo mismo (mapa y selectores), revalidar antes de guardar | Parte 15 |
| Ninguno nuevo: reutiliza componente, props y `.map()` + `key` | Parte 16 |
| Ninguno nuevo: diseño con variables CSS, un componente sin props (`Logo`) y `aria-current` con `useLocation` (que ya se usaba) | Parte 17 |
| Usar un componente de una librería externa pasándole props (`<QRCodeSVG>`) | Parte 18 |
| Ninguno nuevo: cambiar una paleta entera modificando solo los valores de las variables CSS | Partes 19, 20 y 23 |
| Una idea nueva y chica: `ref` con función para abrir un `<dialog>` nativo con `showModal()` | Parte 21 |

---

## 9. Accesibilidad y adaptabilidad

### Accesibilidad

- **Estructura semántica:** `header`, `nav`, `main`, `footer`, `section` con `aria-labelledby`, `article`, `table` con `caption` y `th scope`, `dl` para resúmenes, `fieldset` con `legend` para grupos de opciones.
- **Un solo `<h1>` por página** y sin saltos de nivel de encabezado (se comprobó pantalla por pantalla).
- **Formularios:** cada campo tiene su `label` vinculado; los errores llevan `role="alert"`, `aria-invalid` y `aria-describedby`; las confirmaciones usan `role="status"`.
- **Botones que solo muestran un símbolo** (`−`, `+`, estrellas) tienen `aria-label`; los botones de las tablas dicen sobre qué elemento actúan.
- **El estado no depende solo del color:** las butacas ocupadas tienen rayas, la disponibilidad se escribe en texto, las bajas dicen "Dada de baja".
- **Cambios dinámicos anunciados** con `aria-live="polite"` (totales de la venta, contador de funciones encontradas, resumen de las butacas elegidas).
- **Teclado:** todo es operable con teclado, el foco es visible y hay un enlace **"Saltar al contenido"**.
- **Contraste de colores medido** con la fórmula de las pautas WCAG: el texto blanco da entre 14:1 y 21:1 según la capa de fondo, el texto secundario 9,7:1 o más, el texto tenue 6:1 o más y el naranja de títulos y enlaces entre 6:1 y 9:1 (el mínimo exigido es 4,5:1). Los bordes de campos y botones dan 3,4:1 o más, que es lo que piden las pautas para que se distingan. Además un script midió el contraste **real** de todo el texto visible en cada pantalla (1113 textos en 24 estados de pantalla): el peor caso da 7,1:1, que supera incluso el nivel AAA.
- **Página actual marcada** en el menú con `aria-current="page"` (se anuncia en lectores de pantalla y se resalta en pantalla). Hay dos `<nav>` (menú y pie de página), cada una con su propio `aria-label`.
- **El QR no es la única fuente de información:** los mismos datos de la entrada están escritos en el comprobante, y el QR lleva un `title` ("Código QR de la entrada IM-123456") para los lectores de pantalla.
- **Título de pestaña** distinto en cada página, e idioma de la página declarado (`lang="es"`).
- **Movimiento reducido:** las animaciones (la barra de disponibilidad y las tarjetas y botones que se elevan al pasar el mouse) se desactivan si el sistema lo pide (`prefers-reduced-motion`).

### Adaptabilidad

- Diseño pensado para celular y escritorio: grillas con `repeat(auto-fit, minmax(...))`, `flex-wrap`, tamaños de letra con `clamp()` y una media query para el mostrador del vendedor.
- Las tablas y el mapa se desplazan dentro de su contenedor sin romper el ancho de la página.
- La barra de navegación pasa a dos líneas cuando no entra en una.
- **Se comprobó con una auditoría automática en 375 px de ancho: las 20 pantallas y pestañas no tienen desborde horizontal.**

---

## 10. Cómo se cumple la rúbrica

| Criterio (puntos) | Cómo se cumple |
|---|---|
| **Adecuación al negocio (15)** | Los tres roles tienen su zona completa: el cliente compra entradas con butacas y candy y recibe su entrada con código QR; el vendedor atiende el mostrador (vende entradas con fila y asiento y vende candy) y entrega pedidos; el administrador gestiona películas, funciones, sucursales y candy. Las acciones de un rol se reflejan en los demás (lo que el admin carga lo compra el cliente y lo que compra el cliente lo entrega el vendedor). |
| **Estructura (10)** | Carpetas `pages/`, `components/` y `data/` con responsabilidades separadas; un componente por archivo; piezas reutilizables; cálculos fuera de los componentes. Ver [sección 4](#4-estructura-de-carpetas). |
| **Semántica y accesibilidad (15)** | Ver [sección 9](#9-accesibilidad-y-adaptabilidad): etiquetas semánticas, ARIA, teclado, foco, saltar al contenido, títulos por página, `lang`, movimiento reducido, auditoría automática sin hallazgos pendientes. |
| **Diseño visual (15)** | Paleta propia en tres familias, todas como variables CSS: **6 negros** (del fondo más profundo a las tarjetas elevadas), **texto blanco**, **4 grises neutros** para bordes y textos secundarios y **4 naranjas** (la marca es `#FF8C12`), más colores de estado. Logo propio (símbolo "play" + "i-Moovie"), barra de navegación fija con la página actual resaltada, carta de presentación en la landing, pie de página, tipografías Big Shoulders y DM Sans, y tarjetas, tablas, mapa de butacas y barras de disponibilidad con estilo coherente. Contraste verificado. |
| **Adaptabilidad (10)** | Ver [sección 9](#9-accesibilidad-y-adaptabilidad): sin desborde en 375 px en las 20 pantallas auditadas. |
| **Interacción (15)** | Pestañas, buscador con 7 filtros combinables, mapa de butacas, botones `−`/`+`, estrellas, edición de precios en la fila y venta de entradas en el mostrador por mapa o por fila y asiento. |
| **Formularios y validación (10)** | Contacto, login, alta de película, de función (con regla de sala ocupada), de sucursal, de producto, cambio de precio y calificación. Todos validan en el cliente, muestran errores junto al campo y confirman el resultado. |
| **Calidad técnica (10)** | `npm run lint` sin avisos, `npm run build` sin errores, dos dependencias extra (`react-router-dom` y `qrcode.react`), comentarios explicativos en el código, funciones puras en `data/`, sin datos repetidos. |

---

## 11. Limitaciones conocidas y mejoras posibles

- **No hay backend.** Los datos viven en el navegador: solo existen en esa computadora y ese navegador, y se pierden si se borran los datos del sitio.
- **El login es una simulación.** Los usuarios y contraseñas están en el código (`data/usuarios.js`) y la sesión puede alterarse desde las herramientas del navegador. En una aplicación real, la autenticación la hace el servidor.
- **Las butacas "ocupadas simuladas"** son un patrón fijo, no ventas reales (las ventas reales sí se descuentan).
- **No hay pagos:** la compra se confirma directamente.
- **El QR solo se muestra, no se valida:** la aplicación no tiene una pantalla de escaneo, así que nadie comprueba la entrada al ingresar. Además los datos viajan en texto plano, sin firma. En un sistema real el QR llevaría un código que el servidor verifica.
- **Concurrencia limitada:** dos personas en distintos navegadores no se ven entre sí. Dentro de un mismo navegador, antes de cobrar una entrada de mostrador se vuelve a comprobar que las butacas sigan libres.
- **Las funciones de ejemplo** son de noviembre de 2026; con el tiempo el admin puede programar funciones nuevas.
- **Mejoras posibles:** conectar con el backend Spring Boot, cargar afiches reales de las películas, paginar las tablas y agregar pruebas automáticas, y una pantalla de escaneo de QR para que el vendedor valide las entradas.

---

## 12. Calidad técnica

- `npm run lint` → sin avisos.
- `npm run build` → compila sin errores.
- **Auditoría automática** (script que recorre cada pantalla y pestaña, en escritorio y en celular): un solo `h1`, encabezados sin saltos, todos los campos con etiqueta, botones y enlaces con nombre, sin `id` repetidos y sin desborde horizontal. Resultado final: **sin hallazgos pendientes** en las 20 pantallas y pestañas (durante las pruebas se detectaron y corrigieron un salto de encabezado, botones sin borde y una barra de navegación que se apretaba en celular).
- **Contraste de colores:** se calculó con la fórmula de las pautas WCAG para cada pareja de texto y fondo de la paleta. Todo el texto supera el nivel AA (4,5:1) y los bordes de campos superan 3:1 (el chequeo detectó un borde de campos en 2,3:1 y se corrigió). Con la paleta final se repitió midiendo el texto **real** de cada pantalla (1113 textos, incluidos los que están sobre degradés): el peor caso es 7,1:1.
- **Prueba de punta a punta** con almacenamiento vacío: el admin programa una función y un producto → el cliente los busca y los compra → el vendedor entrega el pedido y hace una venta. Los datos coinciden entre los tres roles.

---

# Bitácora de construcción

El proyecto se construyó **parte por parte**, explicando cada concepto de React cuando aparecía. Las partes están en orden cronológico: algunas decisiones se reemplazaron más adelante (por ejemplo, el primer paso de la compra pasó de tres selectores a un buscador con filtros en la Parte 13). Las secciones de arriba describen cómo quedó el proyecto **al final**.

## Parte 1 · Primer componente

**Qué se hizo:** se borró el contenido de ejemplo de Vite y se escribió un componente `App` mínimo.

**Conceptos de React:**

- **Componente:** una función que devuelve JSX. Su nombre empieza con mayúscula.
- **JSX:** HTML escrito dentro de JavaScript. Todo componente devuelve un solo elemento padre.
- **Llaves `{ }`:** dentro del JSX permiten usar JavaScript (por ejemplo `{nombre}`).
- **`export default` / `import`:** forma de compartir un componente entre archivos.
- **`main.jsx`:** conecta React con la página: `createRoot(...).render(<App />)` dibuja `App` dentro del `<div id="root">` de `index.html`.

**Archivos tocados:** `src/App.jsx`, `src/index.css`, `src/App.css`.

---

## Parte 2 · Rutas y barra de navegación

**Qué se hizo:** se crearon las 6 páginas (vacías, solo con título), un componente `NavBar` y se definieron las rutas en `App.jsx`.

**Conceptos de React:**

- **Aplicación de una sola página (SPA):** hay un único HTML. Al navegar, no se pide otra página al servidor: React dibuja otro componente.
- **`BrowserRouter`, `Routes`, `Route`:** `BrowserRouter` activa las rutas; `Routes` elige la `Route` que coincide con la URL; cada `Route` asocia un `path` con un `element` (un componente).
- **`Link`:** reemplaza al `<a href>`. Cambia la URL sin recargar la página.
- **Componente reutilizable:** `NavBar` está fuera de `<Routes>`, así que aparece en todas las páginas sin repetir código.
- **`import` / `export default`:** cada componente vive en su archivo y `App.jsx` los importa.
- **Etiquetas semánticas** (`header`, `nav`, `main`, `section`) y `aria-label`: ayudan a la accesibilidad (lectores de pantalla). Cuenta para el criterio de semántica de la rúbrica.

**Archivos nuevos:** `src/components/NavBar.jsx`, `src/pages/*.jsx` (6 archivos).
**Archivos tocados:** `src/App.jsx`, `src/App.css`.

---

## Parte 3 · Datos simulados, props y cartelera

**Qué se hizo:** se creó la lista de películas simuladas, un componente `PeliculaCard` y se armó la Landing con un hero y la cartelera.

**Conceptos de React:**

- **Datos simulados (mock):** como no hay backend, `src/data/peliculas.js` exporta un array de objetos. Cada objeto es una película (`id`, `titulo`, `genero`, `duracion`, `clasificacion`, `sinopsis`, `color`, `activa`).
- **Props:** los "parámetros" de un componente. Landing escribe `<PeliculaCard pelicula={pelicula} />` y la tarjeta recibe ese objeto. Así una sola tarjeta dibuja cualquier película.
- **Listas con `.map()`:** `peliculas.map(...)` recorre el array y devuelve un componente por película. Es el "for" de React dentro del JSX.
- **`key`:** cada elemento de una lista necesita una `key` única y estable (usamos el `id`) para que React sepa cuál es cuál.
- **Fragmento `<> </>`:** permite devolver varios elementos hermanos sin agregar un `div` extra.
- **`style={{ ... }}`:** estilo en línea con un objeto de JavaScript; lo usamos para el color de cada afiche.

**Accesibilidad y adaptabilidad:**

- `<section aria-labelledby="...">` vincula cada sección con su título; `<article>` marca cada tarjeta como contenido independiente.
- El afiche es decorativo, por eso lleva `aria-hidden="true"`.
- La cartelera usa `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`: se adapta de 1 columna (celular) a 4 (PC) sin media queries.
- El título del hero usa `clamp()` para escalar con el ancho de pantalla.

**Archivos nuevos:** `src/data/peliculas.js`, `src/components/PeliculaCard.jsx`.
**Archivos tocados:** `src/pages/Landing.jsx`, `src/App.css`.

---

## Parte 4 · Formulario de contacto (useState)

**Qué se hizo:** se escribió el formulario de `/contacto` con validación del lado del cliente y confirmación simulada.

**Conceptos de React:**

- **`useState`:** la memoria del componente. `const [valor, setValor] = useState(inicial)`. Al llamar a `setValor`, React vuelve a ejecutar el componente y actualiza la pantalla. Acá hay tres estados: `datos` (lo escrito), `errores` y `enviado`.
- **Inputs controlados:** cada campo tiene `value={datos.campo}` y `onChange={handleChange}`. React es la "fuente de verdad" de lo que hay escrito.
- **`handleChange` genérico:** `setDatos({ ...datos, [e.target.name]: e.target.value })`. El `name` de cada input indica qué campo actualizar; `...datos` copia los demás campos.
- **`onSubmit` + `e.preventDefault()`:** evita que el navegador recargue la página al enviar.
- **Validación:** la función `validar(datos)` devuelve un objeto de errores; si queda vacío, el formulario es válido. Reglas: nombre de al menos 2 letras, email con formato válido y mensaje de al menos 10 caracteres.
- **Renderizado condicional:** `if (enviado)` muestra la confirmación en lugar del formulario; `{errores.nombre && (...)}` muestra el error solo si existe.

**Accesibilidad:**

- `<label htmlFor>` unido al `id` de cada input.
- `aria-invalid` marca el campo con error y `aria-describedby` lo vincula con su mensaje.
- `role="alert"` y `role="status"` hacen que los lectores de pantalla anuncien errores y confirmación.
- `noValidate` desactiva los carteles del navegador para mostrar los nuestros.

**Archivos tocados:** `src/pages/Contacto.jsx`, `src/App.css` (estilos de formulario reutilizables).

---

## Parte 5 · Login simulado (useNavigate)

**Qué se hizo:** se escribió `/login`: pide usuario, contraseña y rol, valida contra una lista de usuarios de prueba y redirige a la página del rol.

**Usuarios de prueba** (definidos en `src/data/usuarios.js`):

| Usuario | Contraseña | Rol | Va a |
|---|---|---|---|
| `cliente` | `cliente123` | Cliente | `/cliente` |
| `vendedor` | `vendedor123` | Vendedor | `/vendedor` |
| `admin` | `admin123` | Administrador | `/admin` |

> Es solo una simulación. En una aplicación real nunca se guardan contraseñas en el código del frontend: la validación la hace el backend.

**Conceptos de React:**

- **`useNavigate`:** devuelve una función `navigate('/ruta')` para cambiar de página desde el código. `<Link>` es para que el usuario haga clic; `navigate()` es para cuando decidimos redirigir nosotros (por ejemplo, después de validar).
- **`.find()`:** recorre un array y devuelve el primer elemento que cumple una condición, o `undefined` si ninguno. Lo usamos para buscar al usuario.
- **`<select>` controlado:** igual que un input (`value` + `onChange`), con sus `<option>` generadas con `.map()`.
- **`return` temprano:** si una validación falla, se muestra el error y se sale de la función con `return`.
- **Reutilización del patrón de Contacto:** un solo estado `datos` y un `handleChange` genérico basado en el `name` de cada campo.

**Accesibilidad:** `label` + `htmlFor`, `autoComplete="username"` / `"current-password"`, `role="alert"` en el error y `<aside aria-label>` para la ayuda de prueba.

**Archivos nuevos:** `src/data/usuarios.js`.
**Archivos tocados:** `src/pages/Login.jsx`, `src/App.css`.

---

## Parte 6 · Zona cliente (flujo en 3 pasos)

**Qué se hizo:** `/cliente` permite elegir película, función y cantidad de entradas, confirmar la compra y ver un comprobante con un número de entrada simulado. Todo ocurre dentro de una sola ruta.

**Cómo funciona:** un estado `paso` vale `'elegir'`, `'confirmar'` o `'listo'`, y el componente muestra una pantalla distinta según su valor. Resolver los pasos así evita crear una ruta por cada uno.

**Conceptos de React:**

- **Varios `useState` coordinados:** `paso`, `peliculaId`, `funcionId`, `cantidad`, `error` y `numeroEntrada`.
- **Renderizado condicional por pasos:** `if (paso === 'listo') return (...)`, y lo mismo para `'confirmar'`.
- **Datos derivados:** `pelicula`, `funcionesDeLaPelicula`, `funcion` y `total` se calculan en cada render con `.find()` y `.filter()` a partir del estado. No se guardan con `useState` porque se pueden deducir; guardarlos dos veces puede dejarlos desincronizados.
- **`.filter()`:** devuelve un array nuevo solo con los elementos que cumplen la condición (películas activas, funciones de la película elegida).
- **Inputs de tipo radio y number controlados:** `checked={funcionId === f.id}` para los radios; `Number(e.target.value)` porque los inputs entregan texto.
- **Reiniciar estado dependiente:** al cambiar de película se vuelve a `null` la función elegida, porque ya no corresponde.
- **Número de entrada simulado:** se genera dentro de un manejador de evento (`handleConfirmar`) y no durante el render, porque si no cambiaría en cada render.

**Accesibilidad:** `fieldset` + `legend` para el grupo de funciones, `label` envolviendo cada radio, `dl/dt/dd` para el resumen, `role="status"` en el número de entrada y `role="alert"` en los errores.

**Nueva data simulada:** `src/data/funciones.js`, con 2 funciones por película y su `peliculaId` (la relación entre ambas listas).

**Archivos nuevos:** `src/data/funciones.js`.
**Archivos tocados:** `src/pages/Cliente.jsx`, `src/App.css`.

---

## Parte 6b · Elección de butacas

**Qué se hizo:** el flujo de `/cliente` ahora tiene un paso con el mapa de la sala. Se elige película y función, después las butacas (hasta 6), y recién ahí se confirma. La cantidad de entradas ya no es un campo: es la cantidad de butacas elegidas, y el total sale de `precio × butacas`.

**Pasos de `/cliente`:** `elegir` → `butacas` → `confirmar` → `listo`.

**Conceptos de React:**

- **Levantar el estado:** las butacas elegidas viven en `Cliente` (el padre), no en `MapaButacas`. Así el padre puede usarlas para el total, el resumen y el comprobante. El mapa solo recibe props: `ocupadas`, `seleccionadas` y `onToggle`.
- **Funciones como props:** `onToggle` es una función que el padre le pasa al hijo; el hijo la llama cuando se hace clic en una butaca.
- **Arrays en el estado sin mutarlos:** nunca se usa `.push`. Para agregar se crea un array nuevo (`[...butacas, id]`) y para quitar se usa `.filter(...)`. React detecta el cambio solo si el array es uno nuevo.
- **Listas anidadas con `.map()`:** una fila por cada letra y, dentro, una butaca por cada número (`Array.from({ length: 8 }, ...)`).
- **Estados que dependen de otros:** al cambiar de película o de función se vacían las butacas, porque cada función tiene su propia sala.
- **`includes()`:** pregunta si un array contiene un valor (`ocupadas.includes('C4')`).

**Datos simulados:** `src/data/funciones.js` suma la sala (6 filas × 8 butacas) y la función `butacasOcupadas(funcionId)`, que simula butacas ocupadas con una cuenta fija (usa `%`, el resto de la división). Así cada función siempre muestra las mismas ocupadas y no hace falta guardarlas.

**Accesibilidad:**

- Cada butaca es un `<button>` (se usa con teclado) con `aria-label` que dice fila, número y estado ("Fila C, butaca 4, libre") y `aria-pressed` para indicar si está elegida.
- El estado no depende solo del color: las ocupadas tienen rayas y están deshabilitadas; las elegidas se ven rellenas y con texto en el `aria-label`.
- Un `aria-live="polite"` anuncia las butacas elegidas y el total en cada cambio.
- Foco visible con `:focus-visible`.

**Adaptabilidad:** el mapa mide 28rem como máximo y cada butaca 2,1rem; entra en pantallas de celular.

**Archivos nuevos:** `src/components/MapaButacas.jsx`.
**Archivos tocados:** `src/pages/Cliente.jsx`, `src/data/funciones.js`, `src/App.css`.

> Cambio respecto de la Parte 6: se quitó el campo "Cantidad de entradas".

---

## Parte 6c · Candy y salida de la compra

**Qué se hizo:** `/cliente` suma un paso de **candy** (opcional) entre las butacas y la confirmación. El total combina entradas + candy. También se agregó un botón **Cancelar compra** en cada paso, **Volver al inicio** en el comprobante y un indicador "Paso X de 4".

**Pasos de `/cliente`:** `elegir` → `butacas` → `candy` → `confirmar` → `listo`.

**Conceptos de React:**

- **Estado con un objeto:** el candy se guarda como `{ idProducto: cantidad }`, por ejemplo `{ 3: 2, 4: 1 }`. Para cambiar una cantidad se crea un objeto nuevo: `setCandy({ ...candy, [id]: nueva })`. Igual que con los arrays, nunca se modifica el objeto del estado directamente.
- **`.reduce()`:** recorre un array acumulando un resultado. Lo usamos para sumar `precio × cantidad` de cada línea de candy.
- **Cadena `.filter().map()`:** primero se queda con los productos con al menos 1 unidad y después les agrega su cantidad.
- **Valores por defecto con `||`:** `candy[p.id] || 0` da 0 si el producto todavía no está en el objeto.
- **Límites con `Math.min` / `Math.max`:** mantienen la cantidad entre 0 y 10.
- **`useNavigate` para salir:** `handleCancelar` limpia todo (`reiniciar()`) y navega a `/`.
- **Elementos JSX guardados en variables:** `indicadorPaso` y `botonCancelar` se definen una vez y se usan en varios pasos, para no repetir código.
- **Reutilización de componentes:** `ProductoCandy` recibe `producto`, `cantidad` y `onCambiar` por props; se vuelve a usar en el mostrador del vendedor.

**Accesibilidad:**

- Los botones `−` y `+` llevan `aria-label` ("Quitar Gaseosa 500 cc", "Agregar Gaseosa 500 cc"), porque su texto visible es solo un símbolo.
- El botón `−` se deshabilita cuando la cantidad es 0.
- `<output>` muestra la cantidad y `aria-live="polite"` anuncia los cambios del total.
- El candy es una lista (`<ul>`/`<li>`) y el indicador de paso da contexto de dónde está la persona.

**Datos simulados:** `src/data/candy.js` con 8 productos (nombre, descripción, precio).

**Archivos nuevos:** `src/data/candy.js`, `src/components/ProductoCandy.jsx`.
**Archivos tocados:** `src/pages/Cliente.jsx`, `src/App.css`.

---

## Parte 7 · Sesión iniciada y rutas protegidas

**Qué se hizo:**

- Al ingresar, el login guarda la sesión (`usuario` y `rol`). La barra de navegación y la landing la leen y cambian: con sesión muestran "Hola, usuario", **Mi zona** y **Salir**; sin sesión muestran **Contacto** e **Ingresar**. El botón del hero pasa a **Ir a mi zona**.
- **Cancelar compra** ahora deja a la persona dentro de `/cliente`, en el primer paso. **Volver al inicio** (en el comprobante) lleva a la landing, pero con la sesión iniciada.
- `/cliente`, `/vendedor` y `/admin` están **protegidas**: sin la sesión del rol correcto, redirigen a `/login`. Esto resuelve la limitación anotada en la Parte 5.

**Conceptos de React:**

- **`sessionStorage`:** memoria del navegador que dura mientras la pestaña está abierta. Guarda solo texto, por eso se usa `JSON.stringify` (objeto → texto) y `JSON.parse` (texto → objeto). Evita tener que usar Context o estado global. El módulo `src/data/sesion.js` tiene tres funciones: `iniciarSesion`, `obtenerSesion` y `cerrarSesion`.
- **`useLocation`:** "suscribe" a `NavBar` a los cambios de ruta. Cada vez que cambia la URL, la barra se vuelve a dibujar y vuelve a leer la sesión. Sin eso no se enteraría de que alguien ingresó.
- **Prop `children`:** es todo lo que se escribe entre las etiquetas de un componente. En `<RutaProtegida rol="admin"><Admin /></RutaProtegida>`, `children` es `<Admin />`.
- **`<Navigate>`:** redirige desde el JSX (como `useNavigate`, pero para usar dentro del `return`). Con `replace`, el botón "atrás" del navegador no vuelve a la página prohibida.
- **Ternario en JSX:** `sesion ? (...) : (...)` muestra una versión u otra.
- **Un componente que protege a otros:** `RutaProtegida` es un componente "envoltorio", un patrón muy común.

> Es una simulación: cualquiera podría escribir `sessionStorage` desde las herramientas del navegador. En una aplicación real, la sesión la valida el backend.

**Archivos nuevos:** `src/data/sesion.js`, `src/components/RutaProtegida.jsx`.
**Archivos tocados:** `src/components/NavBar.jsx`, `src/pages/Login.jsx`, `src/pages/Landing.jsx`, `src/pages/Cliente.jsx`, `src/App.jsx`, `src/App.css`.

---

## Parte 8a · Calificaciones e historial (y nombres propios)

**Qué se hizo:**

- **Nombres:** los usuarios de prueba ahora tienen un nombre para mostrar (`Lucía`, `Martín`, `Camila`) y cada rol tiene el nombre de su zona en el menú: **Mi cine**, **Mostrador** y **Panel admin**. La landing muestra "Ir a mi cine", "Ir al mostrador" o "Ir al panel" según quién ingresó.
- **`/cliente` pasó a ser un contenedor con dos pestañas:** *Comprar entradas* (el flujo por pasos, que se movió a `components/CompraEntradas.jsx`) y *Mis calificaciones*.
- **Calificar películas:** se elige película, estrellas de 1 a 5 y un comentario opcional (máx. 300 caracteres). Hay **una calificación por película**: si se vuelve a calificar, reemplaza la anterior (y avisa).
- **Historial:** lista de las calificaciones, de más nueva a más vieja, con estrellas, comentario, fecha y botón **Eliminar**. Se guarda en `localStorage` por usuario, así que sobrevive aunque se recargue la página o se cierre la pestaña.
- **Dónde se califica:** en la pestaña *Mis calificaciones* de `/cliente`, o con el botón **★ Calificar** que aparece en cada película de la cartelera cuando hay un cliente con sesión (abre esa pestaña con la película ya elegida).

**Conceptos de React:**

- **`localStorage`:** memoria del navegador que no se borra al cerrar la pestaña. Se necesita porque, al cambiar de página, React destruye los componentes y su `useState` se pierde. `src/data/almacenamiento.js` tiene `leer` y `guardar` (con `JSON.parse` / `JSON.stringify`).
- **Inicialización perezosa de `useState`:** `useState(() => leer(clave, []))`. Pasar una función hace que solo se ejecute en el primer render, en vez de leer `localStorage` en cada render.
- **Actualizar estado y guardar juntos:** la función `actualizarHistorial(nuevo)` hace `setHistorial` y `guardar` a la vez, para que nunca queden distintos.
- **Un componente contenedor con pestañas:** `Cliente` guarda cuál pestaña está activa (`vista`) y muestra el componente que corresponde.
- **Atributo `hidden`:** oculta un bloque pero lo deja montado. Así una compra a medio hacer sigue donde estaba al cambiar de pestaña y volver. Si en cambio se "desmontara" (`{vista === 'comprar' && <CompraEntradas />}`), se perdería el estado.
- **`Link` con `state` + `useLocation`:** el botón *Calificar* manda datos a la otra página sin ponerlos en la URL: `<Link to="/cliente" state={{ vista: 'calificaciones', peliculaId }}>`. La página destino los lee con `const { state } = useLocation()`.
- **Encadenamiento opcional `?.`:** `sesion?.rol` devuelve `undefined` en lugar de dar error cuando `sesion` es `null`.
- **Datos derivados otra vez:** `previa` (¿ya la calificó?) se calcula con `.find()` en cada render.
- **Reemplazar un elemento de una lista:** `[nueva, ...historial.filter(h => h.peliculaId !== peliculaId)]`: la nueva primero y el resto sin la anterior de esa película.
- **`'★'.repeat(n)`:** repite un texto n veces; se usa para dibujar las estrellas fijas.

**Accesibilidad:**

- El selector de estrellas son 5 botones de radio dentro de un `fieldset` con `legend`; funciona con las flechas del teclado. Cada estrella tiene un texto solo para lectores de pantalla ("4 estrellas", clase `solo-lectores`).
- Las estrellas guardadas usan `role="img"` con `aria-label="4 de 5 estrellas"`.
- Las pestañas son botones con `aria-pressed`, y ese mismo atributo se usa en el CSS para darles estilo.
- Mensajes con `role="alert"` (error) y `role="status"` (guardado).
- Solo hay un `<h1>` por página: los títulos de cada paso pasaron a `<h2>`.

**Archivos nuevos:** `src/data/almacenamiento.js`, `src/components/CompraEntradas.jsx`, `src/components/MisCalificaciones.jsx`, `src/components/Estrellas.jsx`, `src/components/EstrellasFijas.jsx`.
**Archivos tocados:** `src/pages/Cliente.jsx`, `src/data/usuarios.js`, `src/data/sesion.js`, `src/components/NavBar.jsx`, `src/components/PeliculaCard.jsx`, `src/pages/Landing.jsx`, `src/App.css`.

---

## Parte 9 · Mostrador del vendedor

**Qué se hizo:** `/vendedor` permite vender candy en el mostrador, sin cuenta de cliente: se agregan productos con **−** y **+**, se elige el medio de pago (Efectivo, Débito, Crédito, QR) y se toca **Registrar venta**. La venta pasa a la lista **Ventas de hoy**, que muestra cuántas ventas hay y el total recaudado. Las ventas se guardan en `localStorage` (clave `imoovie-ventas`).

**Conceptos de React:**

- **Reutilización de componentes:** `ProductoCandy` (hecho para el cliente) se usa también acá, sin cambiarlo. Es la ventaja de que reciba todo por props.
- **Estado con objeto:** la venta actual es `{ idProducto: cantidad }`, igual que el candy del cliente.
- **Datos derivados:** `lineas`, `total`, `ventasHoy` y `recaudadoHoy` se calculan en cada render con `.filter()`, `.map()` y `.reduce()`; no se guardan con `useState`.
- **Copia de datos en la venta:** cada venta guarda el nombre, la cantidad y el precio de cada producto. Si el precio cambiara mañana, la venta de hoy seguiría mostrando lo que se cobró.
- **Fechas:** `new Date(v.fecha).toDateString()` compara solo el día; `toLocaleTimeString('es-AR', ...)` da la hora.
- **Funciones auxiliares en `data/formato.js`:** `formatearPrecio` (antes estaba repetida en un componente) y `ahora()`, que da el momento actual. `ahora()` solo se llama dentro de manejadores de eventos, nunca mientras se dibuja el componente, porque su resultado cambia en cada llamada.

**Adaptabilidad:** `.dos-columnas` es una sola columna en celular y, desde 800 px de ancho (media query), pasa a dos: productos a la izquierda y "Venta actual" a la derecha, que queda fija (`position: sticky`) al desplazarse.

**Accesibilidad:** cada `<section>` está vinculada a su título con `aria-labelledby`; el total usa `aria-live="polite"` para que se anuncie al cambiar; los mensajes usan `role="alert"` / `role="status"`.

**Archivos nuevos:** `src/data/formato.js`.
**Archivos tocados:** `src/pages/Vendedor.jsx`, `src/components/CompraEntradas.jsx` (usa `formatearPrecio` compartido), `src/components/MisCalificaciones.jsx`, `src/App.css`.

---

## Parte 10 · Administración de películas

**Qué se hizo:** `/admin` es un ABM simple de películas:

- **Listar:** tabla con título, género, duración, clasificación y estado.
- **Alta:** formulario con validación (título de al menos 2 caracteres y sin repetir, duración entera entre 30 y 300 minutos, sinopsis de al menos 10 caracteres).
- **Baja / reactivar:** un botón alterna el estado de la película. Una película dada de baja desaparece de la cartelera, de la compra y del selector de calificaciones, pero no se borra: se puede reactivar. No se permite dar de baja la última película activa.

**Cambio importante en los datos:** `src/data/peliculas.js` ahora tiene `peliculasIniciales` (la lista de arranque) y dos funciones: `obtenerPeliculas()` y `guardarPeliculas(lista)`, que leen y escriben `localStorage`. Todas las páginas piden las películas con `obtenerPeliculas()`, así los cambios del admin se ven en la landing, en la compra y en las calificaciones.

**Conceptos de React:**

- **Formulario con alta en una lista:** el mismo patrón de Contacto (un estado `datos`, `handleChange` por `name`, función `validar`) aplicado a un alta.
- **`.some()`:** devuelve `true` si al menos un elemento cumple la condición. Se usa para detectar títulos repetidos.
- **Nuevo id:** `Math.max(0, ...lista.map(p => p.id)) + 1`. Los `...` reparten el array como argumentos sueltos.
- **Agregar a una lista sin mutar:** `[...lista, nueva]`.
- **Modificar UN elemento de una lista:** `lista.map(p => p.id === pelicula.id ? { ...p, activa: !p.activa } : p)`. Se recorre, y solo esa película se devuelve cambiada (copia); las demás pasan igual.
- **Baja lógica (soft delete):** en lugar de borrar, se marca `activa: false`. Es lo habitual en sistemas reales para no perder historial (las calificaciones de una película dada de baja siguen mostrando su título).
- **Regla de negocio en el manejador:** no se puede dejar la cartelera sin películas activas.
- **Un mismo estado en varias páginas con `localStorage`:** como cada página es un componente distinto, el dato compartido vive en el navegador.

**Accesibilidad:**

- Tabla semántica: `<caption>` (solo para lectores de pantalla), `<th scope="col">` en los encabezados y `<th scope="row">` en el título de cada fila.
- El estado se dice con texto ("Activa" / "Dada de baja"), no solo con color.
- Cada botón de la tabla tiene `aria-label` con el nombre de la película ("Dar de baja Órbita Cero").
- Mismos `label`, `aria-invalid`, `aria-describedby` y `role="alert"` que en el formulario de contacto.

**Adaptabilidad:** la tabla está dentro de un contenedor con `overflow-x: auto`, que se desplaza hacia el costado en celulares y también se puede mover con el teclado (`tabIndex={0}`).

**Limitación conocida:** las películas nuevas no tienen funciones cargadas (las funciones siguen siendo datos fijos). En la compra se avisa "Esta película todavía no tiene funciones programadas". Cargar funciones desde el admin queda como mejora futura.

**Archivos tocados:** `src/pages/Admin.jsx`, `src/data/peliculas.js`, `src/pages/Landing.jsx`, `src/components/CompraEntradas.jsx`, `src/components/MisCalificaciones.jsx`, `src/App.css`.

---

## Parte 11 · Sucursales y funciones

**Qué se hizo:**

- **Sucursales:** hay dos de ejemplo (Centro y Norte). El admin puede agregar sucursales y darlas de baja o reactivarlas. Siempre tiene que quedar al menos una activa.
- **Funciones:** cada función une una película, una sucursal, un día, una hora, una sala y un precio. El admin puede programar funciones nuevas y eliminarlas, y ver la lista filtrada por sucursal.
- **Compra de entradas:** el primer paso ahora pide **sucursal**, después película y función. Solo se ofrecen las funciones de esa película *en esa sucursal*. La sucursal aparece en el resumen y en el comprobante.
- **`/admin` pasó a ser un panel con pestañas:** Películas, Funciones y Sucursales (cada una es un componente en `src/components/admin/`).

**Reglas de negocio validadas en "Programar función":**

- El día es obligatorio y no puede ser anterior a hoy.
- La hora es obligatoria.
- El precio es un número entero entre 1.000 y 50.000.
- **Una sala no puede tener dos funciones al mismo día y hora en la misma sucursal.**

**Conceptos de React:**

- **Relaciones entre listas:** `peliculaId` y `sucursalId` apuntan a otras listas (como una clave foránea). Para mostrar el nombre se busca con `.find()`.
- **Filtrar por dos condiciones:** `funciones.filter(f => f.peliculaId === peliculaId && f.sucursalId === sucursalId)`.
- **Estados que dependen de otros:** al cambiar de sucursal se reinician la función y las butacas elegidas.
- **Pestañas con `hidden` vs. con renderizado condicional:** en la zona del cliente se usa `hidden` para que una compra a medias no se pierda. En el panel admin se hace lo contrario a propósito (`{vista === 'x' && <Componente />}`): cada pestaña se monta de nuevo y vuelve a leer los datos. Si no, "Funciones" podría ofrecer una película que se acaba de dar de baja en otra pestaña.
- **Lista de pestañas como dato:** `PESTANAS` es un array y los botones se generan con `.map()`; agregar una pestaña nueva es agregar un elemento.
- **Ordenar sin modificar el estado:** `[...lista].sort(...)` ordena una copia (`.sort()` modifica el array que recibe). Como la fecha es "AAAA-MM-DD" y la hora "HH:MM", ordenar como texto equivale a ordenar cronológicamente.
- **Inputs de fecha y hora:** `<input type="date">` y `<input type="time">` devuelven texto en esos formatos. `toLocaleDateString('sv-SE')` da la fecha de hoy en el mismo formato, así se pueden comparar directamente.
- **Operador `??`:** `a ?? b` devuelve `b` solo si `a` es `null` o `undefined` (junto con `?.`, evita errores cuando algo no se encuentra).
- **Fechas legibles:** `formatearDia('2026-11-06')` devuelve "Vie 6/11".

**Accesibilidad:** mismas tablas semánticas, `label` + `aria-invalid` + `aria-describedby` en cada campo, y botones de la tabla con `aria-label` descriptivo ("Eliminar función de La Última Función, Vie 6/11 18:30, Centro").

**Archivos nuevos:** `src/data/sucursales.js`, `src/components/admin/AdminFunciones.jsx`, `src/components/admin/AdminSucursales.jsx`.
**Archivos movidos:** `AdminPeliculas.jsx` (antes era `pages/Admin.jsx`).
**Archivos tocados:** `src/pages/Admin.jsx`, `src/data/funciones.js`, `src/data/formato.js`, `src/components/CompraEntradas.jsx`, `src/App.css`.

---

## Parte 12 · Candy editable y panel del vendedor completo

**Qué se hizo:**

- **Candy administrable:** una pestaña nueva **Candy** en el panel admin. Permite agregar productos (con validación), **cambiar el precio** de un producto directamente en su fila de la tabla y darlo de baja o reactivarlo. El cliente y el vendedor solo ven los productos activos, con los precios vigentes.
- **Se guardan las compras:** al confirmar una compra, el cliente deja un registro (sucursal, película, función, butacas, total de entradas, candy y total del candy). Estos registros alimentan el panel del vendedor y marcan qué butacas ya se vendieron. Están en `src/data/compras.js`.
- **El vendedor trabaja en una sucursal:** la elige arriba. Las ventas de mostrador quedan registradas con esa sucursal y "Ventas de hoy" muestra solo las de la sucursal elegida.
- **Pedidos online por retirar:** el vendedor ve los pedidos de candy que los clientes hicieron al comprar su entrada en *su* sucursal, y los marca como **entregados**. Así se conecta lo que compra el cliente con lo que entrega el vendedor.

**Flujo completo para probar:**

1. El admin agrega un producto o cambia un precio en *Candy*.
2. El cliente compra una entrada en una sucursal y pide candy: ve los productos y precios nuevos.
3. El vendedor, en esa sucursal, ve el pedido en *Pedidos online por retirar* y lo marca como entregado.

**Conceptos de React:**

- **Edición en la misma fila (renderizado condicional en una tabla):** un estado `editandoId` guarda qué producto se edita (`null` = ninguno). Si `editandoId === p.id`, la celda muestra un campo numérico y los botones *Guardar* / *Cancelar*; si no, muestra el precio y *Cambiar precio*. Solo una fila puede estar en edición a la vez.
- **Reutilizar una regla de validación:** `validarPrecio(texto)` se usa tanto en el alta como en el cambio de precio.
- **Modificar un elemento de la lista:** el mismo patrón `lista.map(p => p.id === id ? { ...p, campo: nuevo } : p)` sirve para cambiar un precio, para dar de baja y para marcar un pedido como entregado.
- **Datos compartidos entre roles con `localStorage`:** el admin escribe el catálogo; el cliente y el vendedor lo leen. El vendedor lee además las compras que escribió el cliente.
- **Copia de datos en el registro:** cada compra y cada venta guardan nombre, cantidad y precio del candy en ese momento. Si el precio cambia después, el registro conserva lo que realmente se pagó.
- **Filtrar con varias condiciones:** `compras.filter(c => c.sucursalId === sucursalId && c.lineasCandy.length > 0 && !c.retirado)`.
- **Helpers para valores impuros:** `ahora()` y `generarNumeroEntrada()` (en `data/formato.js`) se llaman solo desde manejadores de eventos, nunca mientras se dibuja el componente.

**Accesibilidad:** el campo de precio en edición tiene `aria-label` ("Nuevo precio de Pochoclo grande"); los botones de la tabla dicen sobre qué producto actúan; el contador de pedidos pendientes usa `aria-live="polite"`; mensajes con `role="status"` / `role="alert"`.

**Archivos nuevos:** `src/data/compras.js`, `src/components/admin/AdminCandy.jsx`.
**Archivos tocados:** `src/data/candy.js`, `src/data/formato.js`, `src/pages/Admin.jsx`, `src/pages/Vendedor.jsx`, `src/components/CompraEntradas.jsx`, `src/App.css`.

---

## Parte 13 · Buscador de funciones con filtros

**Qué se hizo:** el primer paso de la compra (antes: elegir sucursal, película y función en tres controles separados) pasó a ser un **buscador**. La persona filtra y ve las funciones que cumplen, con su disponibilidad, y al elegir una pasa directo al mapa de butacas.

**Filtros:**

| Filtro | Opciones |
|---|---|
| Sucursal | Todas o una |
| Película | Todas o una |
| Día | Los días en los que hay funciones |
| Horario | Mañana (antes de las 12), Tarde (12 a 18:59), Noche (19 en adelante) |
| Butacas libres | Cualquiera, con lugar, 2, 4 o 6 o más (para ir en grupo) |
| Precio máximo | Un número; vacío = sin límite |
| Ordenar por | Más próximas, precio de menor a mayor, más butacas libres |

Los filtros se combinan: una función tiene que cumplirlos **todos**. Un contador anuncia cuántas funciones hay y el botón **Limpiar filtros** aparece cuando hay alguno aplicado.

**Cada resultado muestra:** película, género, duración, clasificación, sucursal, día, hora, sala, precio y **cuántas butacas quedan libres** (con una barra: verde si hay lugar, naranja y "¡Últimas!" si queda menos del 25 %, y "Agotada" con el botón deshabilitado si no queda ninguna).

**Las butacas vendidas ahora cuentan:** una función ocupa las butacas "simuladas" **más las que ya compraron clientes**. Si alguien compra, la disponibilidad baja y esa butaca aparece ocupada en el mapa para el siguiente cliente (no se puede comprar dos veces).

**Conceptos de React y de programación:**

- **Levantar el estado (otra vez):** los filtros viven en `CompraEntradas`, no dentro de `BuscadorFunciones`, que los recibe por props (`filtros`, `onCambiar`, `onElegir`). Por eso, si la persona entra al mapa de butacas y toca *Volver*, sus filtros siguen como los dejó.
- **Un solo `handleChange` para todos los filtros:** el `name` de cada control indica cuál cambió, igual que en los formularios anteriores.
- **Filtrar con varias condiciones:** `filtrarResultados` usa `.filter()` con una serie de `if (...) return false`; si la función pasa todos, queda. Es la forma más legible de combinar muchos criterios.
- **Funciones de comparación para ordenar:** un objeto `comparar` guarda una función por criterio (`horario`, `precio`, `asientos`); `.sort(comparar[orden])` usa la que corresponde. Una función de comparación devuelve un número negativo si "a" va antes que "b".
- **Cálculo separado del dibujo:** `armarResultados`, `diasDisponibles` y `filtrarResultados` (en `data/busqueda.js`) son funciones comunes; el componente solo dibuja.
- **`Set` y `flatMap`:** `new Set([...])` elimina repetidos; `.flatMap()` hace un `.map()` y junta todas las listas resultantes en una sola. Se usan para reunir las butacas vendidas de todas las compras de una función.
- **Datos derivados:** los resultados y la disponibilidad se recalculan en cada render a partir de los filtros y del almacenamiento.
- **Elegir una función ya trae todo:** `handleElegirFuncion(f)` guarda sucursal, película y función de una vez (todas salen del mismo objeto), y pasa al paso siguiente.

**Accesibilidad:**

- El formulario de filtros tiene `role="search"` y `aria-label="Buscar funciones"`, para que los lectores de pantalla lo reconozcan como buscador.
- El contador de resultados usa `aria-live="polite"`: al cambiar un filtro se anuncia cuántas funciones hay.
- La disponibilidad se escribe en texto ("38 de 48 butacas libres", "Agotada"); la barra es decorativa (`aria-hidden`). No se depende solo del color.
- Cada botón *Elegir butacas* tiene un `aria-label` que dice de qué función se trata.

**Adaptabilidad:** la grilla de filtros usa `repeat(auto-fit, minmax(12rem, 1fr))` (3 columnas en PC, 1 en celular) y las tarjetas de resultado pasan de dos columnas a una con `flex-wrap`. Se comprobó que en 375 px no hay desborde horizontal.

**Archivos nuevos:** `src/data/busqueda.js`, `src/components/BuscadorFunciones.jsx`.
**Archivos tocados:** `src/components/CompraEntradas.jsx` (el paso 1 ahora es el buscador; se quitaron los selectores y radios anteriores), `src/data/funciones.js` (`butacasNoDisponibles`, `TOTAL_BUTACAS`) y `src/App.css`.

---

## Parte 14 · Cierre: 404, accesibilidad, diseño y documentación

**Qué se hizo:**

- **Página 404** (`pages/NotFound.jsx`): cualquier URL que no exista (por ejemplo `/hola`) muestra un mensaje y botones para volver al inicio o, si hay sesión, a la zona de la persona. Se logra con una última ruta `path="*"`.
- **Título de pestaña por página** (`components/TituloDePagina.jsx`): cada página pone su propio título ("Mi cine · i-Moovie", "Panel admin · i-Moovie", etc.).
- **Enlace "Saltar al contenido"**: queda oculto hasta que se lo enfoca con la tecla Tab y lleva el foco directo al `<main>`, salteando el menú.
- **`index.html`:** idioma `es`, título, descripción, color de tema y las tipografías *Big Shoulders Display* (títulos) y *DM Sans* (texto), que ya estaban definidas en el diseño. Nuevo `favicon.svg` propio.
- **Limpieza:** se borraron los archivos sobrantes de la plantilla de Vite (`src/assets/`, `public/icons.svg`) y se reemplazó el `README.md` genérico.
- **Calificaciones en su propio módulo** (`data/calificaciones.js`): la clave del almacenamiento estaba escrita a mano en dos componentes; ahora está en un solo lugar, igual que el resto de los datos.
- **Documentación final:** las secciones 1 a 12 de este documento.

**Conceptos de React:**

- **`useEffect`:** ejecuta código *después* de que React dibujó la pantalla, para tocar algo que está **fuera de React** (acá, `document.title`). La lista del final (`[pathname]`) indica cuándo volver a ejecutarlo: solo cuando cambia la ruta, no en cada dibujo. Es la primera vez que se usa en el proyecto.
- **Componente que no dibuja nada:** `TituloDePagina` devuelve `null`; existe solo por su efecto.
- **Ruta comodín:** `<Route path="*">` coincide con cualquier URL que no coincidió antes; por eso va **al final**.
- **Enlace de salto:** un `<a href="#contenido">` común más un `<main id="contenido" tabIndex={-1}>` alcanzan; no hace falta JavaScript.

**Auditoría de accesibilidad y adaptabilidad.** Se escribió un script que recorre cada pantalla y pestaña (18 en total) y revisa: un solo `h1`, encabezados sin saltos de nivel, todos los campos con etiqueta, botones y enlaces con nombre, sin `id` repetidos, `lang`, `<main>`, título de la pestaña y desborde horizontal. Se ejecutó en escritorio y en celular (375 px).

- **Hallazgo 1:** en el buscador, el título de cada función era un `h4` justo debajo de un `h2` (se salteaba el nivel). Se cambió a `h3`.
- **Hallazgo 2** (de pruebas anteriores): los botones secundarios no tenían borde y la barra de navegación se apretaba en celular. Ya estaban corregidos.
- **Resultado final:** sin hallazgos pendientes en las 18 pantallas.

**Prueba de punta a punta** (con el almacenamiento vacío, usando los tres roles): el admin programa una función en la sucursal Norte y agrega el producto "Brownie" → el cliente filtra por sucursal, película y horario, compra la función nueva con 2 brownies ($ 12.000) → el vendedor ve el pedido, lo entrega y vende otro brownie. Los datos coincidieron entre los tres roles.

**Archivos nuevos:** `src/pages/NotFound.jsx`, `src/components/TituloDePagina.jsx`, `src/data/calificaciones.js`, `public/favicon.svg` (reemplazado), `README.md` (reemplazado).
**Archivos tocados:** `src/App.jsx`, `index.html`, `src/index.css`, `src/App.css`, `src/components/BuscadorFunciones.jsx`, `src/components/MisCalificaciones.jsx`.
**Archivos borrados:** `src/assets/*`, `public/icons.svg` (sin uso).

---

## Parte 15 · El vendedor vende entradas en el mostrador

**Qué se hizo:** hasta acá el vendedor solo vendía candy y entregaba pedidos online. Ahora también puede **vender una entrada a alguien que llega al cine sin haber comprado online**, eligiendo la función, la fila y el asiento. El panel del vendedor quedó con dos pestañas: **Vender entradas** y **Candy y pedidos**, y la sucursal elegida arriba vale para las dos.

**Cómo se vende una entrada:**

1. El vendedor elige una **función** de su sucursal (la lista muestra película, día, hora, sala, precio y cuántas butacas quedan; las agotadas aparecen deshabilitadas).
2. Elige las **butacas** de dos formas, a gusto: escribiendo **fila y asiento** (selectores + *Agregar butaca*) o **tocándolas en el mapa**. Se puede sacar una butaca volviendo a tocarla. Máximo 6 por venta.
3. Opcionalmente anota el **nombre del cliente** y elige el **medio de pago**.
4. Toca **Cobrar y emitir entrada** y aparece el comprobante con el número de entrada. *Nueva venta* deja todo vacío.

Abajo, **Entradas vendidas hoy** lista lo cobrado en el mostrador de esa sucursal, con el total recaudado.

**Validaciones:** hay que elegir una función y al menos una butaca; no se puede agregar una butaca ocupada ni repetida; el máximo es de 6; y **antes de cobrar se vuelve a comprobar** que las butacas sigan libres (si alguna se ocupó mientras tanto, se la saca de la venta y se avisa).

**Cómo se conecta con el resto:** la venta se guarda como una **compra más** (`origen: 'mostrador'`). Por eso, sin escribir nada extra:

- La butaca queda **ocupada para todos**: el cliente online la ve ocupada en el mapa y las "butacas libres" del buscador bajan.
- No aparece como pedido de candy pendiente (no lleva candy).

**Conceptos de React y de programación:**

- **Reutilizar lógica ya hecha:** la lista de funciones de la sucursal sale de `armarResultados` + `filtrarResultados` (los mismos cálculos del buscador del cliente), y el mapa es el mismo `MapaButacas`. Reutilizar evita escribir dos veces lo mismo.
- **Levantar el estado:** la sucursal vive en `pages/Vendedor.jsx` y baja por props a las dos pestañas.
- **`key` para reiniciar un componente:** `<MostradorEntradas key={sucursalId} ... />`. Cuando la `key` cambia, React descarta el componente y crea uno nuevo, así la venta arranca vacía (las funciones y butacas de una sucursal no sirven en otra). Es la forma de decirle a React: "esto ya es otra cosa, empezá de cero".
- **`hidden` para conservar una venta a medias** al mirar la otra pestaña.
- **Dos formas de elegir lo mismo:** el mapa y los selectores llaman a la misma función `agregarButaca(id)`, que centraliza las validaciones. Así no se repite la regla.
- **Revalidar antes de guardar:** se vuelven a leer las compras justo antes de cobrar, porque la pantalla pudo quedar desactualizada.
- **Mover código común a un solo lugar:** `esHoy` y `formatearHora` (en `data/formato.js`) y `MEDIOS_PAGO` (en `data/ventas.js`) pasaron a un único archivo porque ahora los usan varios.

**Accesibilidad:** el selector de fila y asiento es un `fieldset` con `legend`; el resumen de la venta y el total usan `aria-live="polite"`; los errores, `role="alert"`; las opciones de funciones agotadas están deshabilitadas y lo dicen en texto; el comprobante se anuncia con `role="status"`. Se auditó en celular (sin desborde ni hallazgos).

**Archivos nuevos:** `src/components/vendedor/MostradorEntradas.jsx`, `src/components/vendedor/MostradorCandy.jsx` (el contenido anterior del panel del vendedor, movido).
**Archivos tocados:** `src/pages/Vendedor.jsx` (ahora es un contenedor con pestañas), `src/data/formato.js`, `src/data/ventas.js`, `src/App.css`.

---

## Parte 16 · Página "Quiénes somos"

**Qué se hizo:** una página pública nueva, `/nosotros`, tan simple como Contacto:

- Un `<h1>` "Quiénes somos" y una bajada: *"Somos un grupo de estudiantes de Aplicaciones Interactivas (UADE) y construimos i-Moovie como proyecto de la materia."*
- **Las tarjetas de los integrantes** del grupo: Federico Gagliesi, Franco Espinel Pasini y Adrian Chen. Cada tarjeta muestra el nombre y el rol ("Integrante" para los tres por ahora; se cambia en `src/data/integrantes.js` y la página se actualiza sola).
- Un párrafo final que invita a escribirnos, con un `<Link>` a `/contacto`.
- Un enlace **"Quiénes somos"** en la barra de navegación, entre "Inicio" y "Contacto". Se ve **siempre**: sin sesión y con sesión de cualquier rol (cliente, vendedor o admin). La ruta es pública, igual que `/` y `/contacto`: no usa `RutaProtegida`.

**No introduce conceptos de React nuevos.** Solo reutiliza lo que ya estaba en el proyecto:

- **Componente y props:** `IntegranteCard` recibe un objeto por props (`<IntegranteCard integrante={algo} />`), exactamente como `PeliculaCard` recibe una película. Una sola tarjeta dibuja a cualquier integrante.
- **`.map()` + `key`:** la página recorre la lista con `integrantes.map(...)` y usa el `id` como `key`, el mismo patrón de la cartelera de `Landing.jsx`.
- **`<Link>`** de react-router-dom para ir a Contacto sin recargar la página, como en el resto de la aplicación.

No hay estado, ni efectos, ni hooks nuevos en esta parte.

**Semántica y accesibilidad (igual que Landing y Contacto):**

- Cada `<section>` está vinculada a su título con `aria-labelledby`; hay un solo `<h1>` y los encabezados siguen el orden h1 → h2 → h3.
- El círculo de color con la inicial es decorativo (`aria-hidden="true"`): el nombre ya está escrito en texto.
- El enlace del párrafo va **subrayado** (no depende solo del color) y tiene foco visible. Hizo falta una clase propia, `.enlace-texto`, porque el navegador pinta de azul los enlaces comunes, algo casi ilegible sobre el fondo oscuro.

**Un detalle fuera de la página:** `TituloDePagina.jsx` tiene una lista con el título de la pestaña de cada ruta. Sin sumar `/nosotros` ahí, la pestaña habría dicho "Página no encontrada". Ahora dice "Quiénes somos · i-Moovie".

**Verificación:** `npm run lint` sin avisos, `npm run build` correcto y la auditoría automática en las 19 pantallas y pestañas (PC y celular de 375 px) sin hallazgos ni desborde. Se comprobó que el enlace a Contacto y el del menú navegan sin recargar la página.

**Archivos nuevos:** `src/pages/Nosotros.jsx`, `src/components/IntegranteCard.jsx`, `src/data/integrantes.js`.
**Archivos tocados:** `src/App.jsx` (la ruta), `src/components/NavBar.jsx` (el enlace), `src/components/TituloDePagina.jsx` (el título de la pestaña), `src/App.css` (estilos de la página) y `DOCUMENTACION.md`.

---

## Parte 17 · Diseño visual: logo, paleta y carta de presentación

**Qué se hizo:** una mejora de diseño para que la web se vea más profesional. **No hay lógica nueva:** son estilos, un componente de dibujo y texto.

- **Logo de i-Moovie** (`components/Logo.jsx`): un símbolo (cuadrado con degradé naranja y un "play" recortado) más el nombre escrito con la tipografía de títulos, con la "i-" en naranja. Se usa en la barra de navegación y en el pie. El símbolo está hecho solo con CSS, sin imágenes. El ícono de la pestaña (`favicon.svg`) pasó a ser el mismo símbolo.
- **Paleta ampliada** (`src/index.css`): antes había 3 colores con nombre. Ahora hay **6 negros** (en capas: la barra va sobre el más profundo, las tarjetas sobre uno más claro, los campos y las listas sobre otro más claro todavía), **4 grises cálidos**, **4 naranjas**, más los colores de error y de éxito. En `App.css` se reemplazaron unos **70 colores escritos a mano** por variables (quedan 4 a propósito: el blanco sobre los afiches y las sombras negras). Si algún día se quiere cambiar un tono, se cambia en un solo lugar.
- **Carta de presentación en la landing:** una sección nueva, "Bienvenido a i-Moovie", que presenta la plataforma (cartelera, búsqueda de funciones, mapa de butacas, candy, calificaciones, y el mostrador para quienes atienden), con la firma "El equipo de i-Moovie" y un enlace a *Quiénes somos*. A su lado hay tres pasos ("Elegí tu función", "Elegí tu butaca", "Sumá tu candy") en tarjetas.
- **Barra de navegación fija** arriba al desplazarse, con un hilo de luz naranja debajo y la página actual resaltada.
- **Pie de página** (`components/Footer.jsx`) con el logo, los enlaces públicos y la nota del proyecto.
- **Detalles:** resplandor naranja muy suave arriba de la página, tarjetas con relieve que se elevan al pasar el mouse, botones con sombra, y un ancho máximo del contenido en pantallas muy anchas (la barra y el pie se alinean con ese mismo borde).

**Decisiones que se tomaron por defecto** (se pueden cambiar): logo con letras *y* un símbolo, y la paleta aplicada a **toda** la web (no solo a la landing). Se probó un logo grande dentro de la portada, pero repetía el de la barra justo encima y se sacó.

**No introduce conceptos de React nuevos.**

- `Logo` y `Footer` son componentes comunes; `Logo` ni siquiera recibe props.
- La carta usa `.map()` + `key` para los tres pasos, igual que la cartelera.
- Para marcar la página actual, `NavBar` usa `useLocation`, que ya usaba. Antes lo llamaba solo para volver a dibujarse; ahora también toma el `pathname`.

Lo nuevo es **CSS**: variables, `color-mix()`, `clamp()`, `clip-path` (para el triángulo del "play"), `position: sticky`, `max()` y `@media`.

**Verificación:**

- **Contraste** con la fórmula de las pautas WCAG: todo el texto supera 4,5:1 (el menor es el gris tenue sobre las tarjetas, con 5,0:1). El chequeo encontró un problema real: el **borde de los campos de formulario daba 2,3:1** y las pautas piden 3:1, así que se oscureció un poco el gris de los bordes (`--gris-2`) hasta superar 3:1.
- **Auditoría automática** en las 19 pantallas y pestañas, en PC y en celular de 375 px, con el pie de página incluido: sin hallazgos ni desborde. En celulares angostos hubo que achicar un poco la letra y el espacio del menú para que sus cuatro enlaces entren en una línea.
- `npm run lint` sin avisos y `npm run build` correcto.

**Archivos nuevos:** `src/components/Logo.jsx`, `src/components/Footer.jsx`.
**Archivos tocados:** `src/index.css` (la paleta), `src/App.css` (colores por variables y estilos nuevos), `src/App.jsx` (el pie), `src/components/NavBar.jsx` (logo y página actual), `src/pages/Landing.jsx` (la carta), `public/favicon.svg` y `DOCUMENTACION.md`.

---

## Parte 18 · Código QR en la entrada

**Qué se hizo:** al comprar una entrada, el comprobante ahora incluye un **código QR**, con una línea de corte punteada como las entradas de cine y la leyenda "Mostrá este código en el cine para ingresar". Se muestra en dos lugares:

- **El comprobante de la compra online** del cliente.
- **El comprobante de la venta de mostrador**, para que quien compra en persona también se lleve su entrada con QR.

**Qué contiene el QR:** los datos de la entrada, una línea por dato. Quien lo escanee con el celular los ve en texto:

```
i-Moovie · Entrada IM-687653
Película: Mi Abuela, la Campeona
Sucursal: Centro
Función: Vie 6/11 · 16:00 · Sala 1
Butacas: A1, A3
```

**Cómo se hizo:** un componente nuevo, `components/EntradaQR.jsx`, que recibe por props los datos (`numero`, `pelicula`, `sucursal`, `funcion`, `butacas`), arma el texto y se lo pasa al componente `<QRCodeSVG>` de la librería **`qrcode.react`**. Los dos comprobantes lo usan con una sola línea. Es la segunda librería del proyecto (la otra es `react-router-dom`).

**¿Por qué una librería?** Un QR no es solo "dibujar cuadraditos": hay que codificar el texto, calcular una corrección de errores (para que se lea aunque se ensucie) y elegir una de las 40 versiones y 8 máscaras posibles. Programarlo a mano son unas 300 líneas muy fáciles de equivocar. `qrcode.react` es la librería estándar para esto en React, no tiene dependencias propias y agrega unos 17 KB al proyecto (unos 6 KB una vez comprimido para enviarlo al navegador).

**No introduce conceptos de React nuevos:** es un componente con props, que a su vez usa otro componente (el de la librería) pasándole props, igual que `<Link>` de `react-router-dom`. Lo único nuevo es instalar una librería con `npm install`.

**Detalles técnicos del QR:**

- Fondo **blanco** y trazo casi negro: un QR tiene que ser oscuro sobre claro para que los lectores lo detecten, aunque el resto de la página sea oscura.
- Margen blanco de 4 módulos (`marginSize={4}`), que es lo que exige el estándar.
- Corrección de errores de nivel medio (`level="M"`): se sigue leyendo aunque se ensucie un poco.
- El tamaño del QR se ajusta solo según cuántos datos tenga.

**Accesibilidad:** el dibujo de un QR no se puede "leer" con un lector de pantalla, por eso (1) el QR tiene un `title`, (2) todos sus datos están escritos también en el comprobante, y (3) se usa `<figure>` con `<figcaption>`.

**Verificación (que el QR realmente se pueda leer):** no alcanza con ver que aparezca el dibujo. Se generó el mismo QR por fuera de la aplicación, se comprobó que era **idéntico** al que dibujó el navegador y se lo **decodificó con un lector independiente** (`jsQR`, instalado solo en una carpeta temporal, no en el proyecto). Resultado: leyó exactamente los cinco datos, con tildes y puntos medios, tanto en la compra online como en la venta de mostrador, y también con el peor caso (6 butacas y un título larguísimo). Además: `npm run lint` sin avisos, `npm run build` correcto y la auditoría en las 20 pantallas y pestañas (PC y celular de 375 px) sin hallazgos ni desborde.

**Archivos nuevos:** `src/components/EntradaQR.jsx`.
**Archivos tocados:** `src/components/CompraEntradas.jsx` y `src/components/vendedor/MostradorEntradas.jsx` (muestran el QR), `src/App.css` (estilos), `package.json` y `package-lock.json` (la librería) y `DOCUMENTACION.md`.

---

## Parte 19 · Paleta Grafito (un fondo más suave y nítido)

> **Esta paleta fue reemplazada en la Parte 20, y volvió a ser la vigente en la Parte 23.** Se deja el historial completo de decisiones de diseño.

**Qué se hizo:** la página se veía demasiado oscura: negro casi puro con naranja resultaba pesado. Se reemplazó la paleta de la Parte 17 por una nueva, llamada **Grafito**: grises oscuros en lugar de negro, con el naranja de marca igual que antes. El gris es más suave a la vista y deja que el texto y el naranja se vean más nítidos.

**Cómo se eligió:** antes de tocar el código se probaron **tres paletas sobre la página real** (sin modificar archivos, inyectando los valores desde el navegador) y se compararon con capturas de las mismas pantallas:

| Opción | Cómo era |
|---|---|
| **Grafito** (la elegida) | Gris oscuro en lugar de negro; el naranja no cambia. |
| Claro | Fondo crema y blanco con texto oscuro. Es la más luminosa, pero el naranja vivo da solo 2,3:1 sobre blanco, así que habría que usar un naranja más oscuro (`#B85400`, 4,9:1) para los textos y reservar el naranja vivo para botones y logo. |
| Mixto | Contenido claro con la barra de navegación y el pie en carbón oscuro. |

**Qué cambió en el código** (casi nada, porque la paleta ya estaba hecha con variables CSS):

- Se cambiaron los **valores** de las variables en `src/index.css`: 6 grafitos (de `#1B1C1F` a `#4A4B53`), 4 grises un poco fríos (de `#4A4B53` a `#D0D0D6`) y el texto principal `#F6F6F4`. Los naranjas, los colores de estado y las tipografías no se tocaron.
- Se **renombraron** las variables para que sus nombres sigan describiendo el color: `--negro-0…5` pasó a `--grafito-0…5` y `--crema` a `--texto`. Con un solo comando de reemplazo en `App.css` (20 y 14 usos).
- Se actualizó el color de la barra del navegador del celular (`theme-color` en `index.html`).

**No introduce conceptos de React nuevos:** es solo CSS. Y es justamente lo que se ganó haciendo antes la paleta con variables: cambiar el aspecto de toda la web fue modificar un archivo en lugar de revisar más de mil líneas de estilos.

**Verificación:**

- **Contraste teórico** (fórmula WCAG): el texto principal da entre 8:1 y 15,7:1 según la capa, el secundario entre 5,6:1 y 11,1:1, el tenue entre 4,1:1 y 8:1 y el naranja entre 3,7:1 y 7,3:1. Las dos únicas parejas por debajo de 4,5:1 son sobre `grafito-5`, la capa más clara, que se usa solo para pistas de barras y rayas, donde no hay texto.
- **Contraste real:** un script recorrió todo el texto visible de 24 estados de pantalla (landing, formularios con errores, compra, comprobante con QR, calificaciones, mostrador, las pestañas del admin y más), calculó el color real de la letra y del fondo que tiene detrás y lo comparó con el mínimo (4,5:1; 3:1 para texto grande). Resultado: **1113 textos revisados, todos cumplen**, y el peor caso es 5,2:1. La primera versión del script ignoraba el texto sobre degradés (botones y carta de presentación); se mejoró para medirlos contra cada color del degradé y se repitió.
- `npm run lint` sin avisos y `npm run build` correcto.

**Archivos tocados:** `src/index.css` (la paleta), `src/App.css` (nombres de variables), `index.html` (`theme-color`) y `DOCUMENTACION.md`. No hay archivos nuevos.

---

## Parte 20 · Decisión final de la paleta: fondo negro, texto blanco y detalles naranjas

> **Reemplazada en la Parte 23:** el grupo decidió volver a la paleta Grafito. Se deja como historial.

**Qué se hizo:** después de probar varias alternativas (ver la tabla de abajo), la decisión final fue **fondo negro, texto blanco y los detalles en naranja**. Se aplicó a toda la web. Los detalles en naranja son los títulos, los botones, los enlaces, los bordes de acento, los números de los pasos y los resplandores.

**Qué cambió respecto de la paleta de la Parte 17** (que también era negra con naranja): el texto principal pasó de un blanco crema a **blanco puro**, los grises de apoyo pasaron a ser **neutros** (sin tinte cálido, para no competir con el naranja) y los negros son negros reales, apilados en capas para dar profundidad.

| Variable | Valor | Para qué se usa |
|---|---|---|
| `--negro-0` … `--negro-5` | `#000000`, `#050505`, `#0D0D0D`, `#141414`, `#1C1C1C`, `#2B2B2B` | De la barra y el pie (la capa más profunda) a las pistas de barras (la más clara) |
| `--gris-1` … `--gris-4` | `#2F2F2F`, `#707070`, `#A8A8A8`, `#D6D6D6` | Bordes sutiles, bordes de campos, texto tenue, texto secundario |
| `--texto` | `#FFFFFF` | Texto principal |
| `--naranja` y sus variantes | `#FF8C12` (marca), `#FFB12B`, `#FF7A0A`, `#B85400` | Detalles, títulos, botones, enlaces |

**Alternativas probadas y descartadas** (todas se probaron sobre la página real, sin tocar archivos, y se compararon con capturas de las mismas pantallas):

| Opción | Cómo era | Por qué no |
|---|---|---|
| Grafito (Parte 19) | Gris oscuro en lugar de negro. Se aplicó y se reemplazó. | Se prefirió el negro con texto blanco. |
| Claro | Fondo crema, texto oscuro. | Pierde el aire de cine. Además el naranja vivo da solo 2,3:1 sobre blanco, así que habría que usar un naranja más oscuro (`#B85400`) para los textos. |
| Mixto | Contenido claro con barra y pie oscuros. | Mismo problema del naranja sobre claro; y dos estilos conviviendo. |
| Blanco con naranja suave | Fondo blanco, naranja en títulos y bordes. | Se eligió el fondo negro. |
| Blanco con naranja fuerte | Igual, con barra y pie en naranja sólido. | Se eligió el fondo negro. |

Una enseñanza de las pruebas: con **fondo blanco**, un script de contraste detectó que el texto "Saltar al contenido", la "i-" del logo y el título de "Usuarios de prueba" quedaban justo por debajo del mínimo. Con fondo negro eso no pasa, porque el naranja y el blanco tienen mucho contraste sobre negro.

**No introduce conceptos de React nuevos:** es solo cambiar los valores de las variables CSS (que ya existían). Cambiar tres veces de paleta en esta etapa fue sencillo justamente porque los colores están en un solo lugar, en `src/index.css`, en lugar de repartidos por más de mil líneas de estilos.

**Verificación:**

- **Contraste teórico** (fórmula WCAG): el texto blanco da entre 14,2:1 y 21:1 según la capa, el secundario entre 9,7:1 y 14,4:1, el tenue entre 6:1 y 8,8:1 y el naranja entre 6,1:1 y 9:1. Los bordes de campos y botones dan 3,4:1 o más. En ninguna pareja de texto hay menos de 4,5:1.
- **Contraste real:** un script recorrió todo el texto visible de 24 estados de pantalla (landing, formularios con errores, compra, comprobante con QR, calificaciones, mostrador, las pestañas del admin y más), calculó el color real de la letra y del fondo que tiene detrás y lo comparó con el mínimo. Resultado: **1113 textos revisados, todos cumplen**, y el peor caso es **7,1:1**.
- `npm run lint` sin avisos y `npm run build` correcto.

**Archivos tocados:** `src/index.css` (los valores de la paleta), `src/App.css` (solo el nombre de las variables: `--grafito-*` volvió a `--negro-*`), `index.html` (`theme-color`) y `DOCUMENTACION.md`. No hay archivos nuevos.

---

## Parte 21 · Cartelera estilo cine: afiches y ficha de la película

**Qué se hizo:** la cartelera de la landing ahora se ve como la de un cine: una grilla de **afiches verticales** con el título y el género/duración debajo. Al tocar un afiche se abre una **ficha** (una ventana sobre la página) con el género, la duración, la edad recomendada y la sinopsis. Si hay un cliente con sesión, la ficha ofrece **Comprar entradas** y **★ Calificar**; sin sesión ofrece **Ingresar para comprar entradas**. En el celular los afiches se ven de a dos por fila.

**Cómo está armado** (tres componentes chicos, todos con lo que ya se conocía):

| Pieza | Qué hace |
|---|---|
| `Afiche.jsx` | Dibuja el póster con CSS: degradé con el color de la película, su inicial grande, perforaciones de cinta de cine y la edad en una esquina. Recibe la película por props y es decorativo (`aria-hidden`), porque su información ya está escrita como texto al lado. |
| `PeliculaCard.jsx` | Reescrita: es un `<button>` con el afiche y el título. Al tocarlo llama a `onAbrir(pelicula)`, una función que viene del padre (igual que en la Parte 6b). |
| `FichaPelicula.jsx` | La ventana con la información, hecha con la etiqueta nativa `<dialog>`. |
| `Landing.jsx` | Guarda con un `useState` cuál película está abierta (`null` = ninguna) y muestra la ficha con un `&&`. |

**Concepto nuevo (uno solo, chico): `ref` con función + `<dialog>` nativo.** Un `<dialog>` se abre con un método del navegador, `showModal()`, y React no tiene una forma "declarativa" de llamarlo. Una `ref` con función le da acceso al elemento real: `ref={(el) => { if (el && !el.open) el.showModal() }}`. Se ejecuta cuando la ficha aparece, y la abre como ventana modal. A cambio, el navegador resuelve solo lo difícil de una ventana emergente:

- oscurece el fondo y deja el foco del teclado adentro de la ventana;
- la cierra con la tecla **Esc**;
- al cerrarla, devuelve el foco al afiche que la abrió.

Solo se agregaron tres cosas a mano: avisarle a React cuando se cierra (`onClose`), cerrarla al tocar el fondo oscuro (comparar `e.target` con `e.currentTarget`) y el botón ✕, que es un `<form method="dialog">` y por eso cierra sin escribir JavaScript. Para mostrar los datos se usó `<dl>` (lista de término y definición), que es la etiqueta pensada para eso.

**Decisión sobre las imágenes:** todavía no hay afiches reales, por eso el póster se genera con CSS a partir del color de cada película. Si más adelante se quieren imágenes reales, alcanza con guardarlas en `public/afiches/` y reemplazar el contenido de `Afiche.jsx` por un `<img>`; ni la tarjeta ni la ficha cambian.

**Verificación:**

- Se abre al tocar un afiche; se cierra con **Esc**, con el botón ✕ y tocando el fondo; al cerrar, el foco vuelve al afiche. Con la ficha abierta la página de atrás no se desplaza.
- Los botones cambian según la sesión: sin sesión, solo "Ingresar para comprar entradas" (`/login`); con cliente, "Comprar entradas" y "★ Calificar"; y "★ Calificar" abre directo *Mis calificaciones* con esa película elegida (como antes).
- En 375 px: 2 columnas, sin desplazamiento horizontal, y la ficha entra completa con el afiche arriba.
- Contraste: título del dato en naranja sobre la ficha 7,9:1, sinopsis 12,7:1, edad (blanco sobre negro) 21:1, borde del botón ✕ 3,9:1. Un solo `<h1>` por página y la ficha tiene su propio `<h2>`.
- `npm run lint` sin avisos y `npm run build` correcto.

**Archivos nuevos:** `src/components/Afiche.jsx`, `src/components/FichaPelicula.jsx`.
**Archivos tocados:** `src/components/PeliculaCard.jsx` (reescrita), `src/pages/Landing.jsx`, `src/App.css` (se reemplazaron los estilos `.pelicula-*` por los del afiche y la ficha) y `DOCUMENTACION.md`.

---

## Parte 22 · Publicación en GitHub Pages

**Qué se hizo:** el proyecto se subió a GitHub (repositorio `FedeGagliesi/imoovie-front`) y se publicó en **https://fedegagliesi.github.io/imoovie-front/**. Cada vez que se sube un cambio a la rama `main`, GitHub compila y publica el sitio solo.

**Qué hubo que ajustar** (no se agregó ningún concepto de React nuevo):

| Problema | Solución | Dónde |
|---|---|---|
| El sitio no vive en la raíz del dominio, sino en la subcarpeta `/imoovie-front/` | `base: '/imoovie-front/'` al compilar (en desarrollo sigue siendo `/`, así que `npm run dev` funciona igual) | `vite.config.js` |
| El router tiene que saber esa subcarpeta | `<BrowserRouter basename={import.meta.env.BASE_URL}>` | `src/App.jsx` |
| Si alguien entra o recarga en `/imoovie-front/login`, GitHub Pages no encuentra ese archivo | Al publicar se copia `index.html` como `404.html`: GitHub la muestra y React Router dibuja la pantalla correcta | `.github/workflows/deploy.yml` |

**Cómo se publica:** el archivo `.github/workflows/deploy.yml` es una receta de GitHub Actions: instala dependencias (`npm ci`), compila (`npm run build`), copia el `404.html` y publica la carpeta `dist`. Para que GitHub Pages sea gratis el repositorio tiene que ser **público**.

**Datos de la versión publicada:** como no hay backend, los datos viven en el navegador de cada visitante (localStorage). Cada persona que abra el link ve los datos iniciales y sus cambios no los ve nadie más. Los usuarios de prueba son los de siempre (`cliente/cliente123`, `vendedor/vendedor123`, `admin/admin123`).

**Verificación:** se probó la versión compilada con un servidor que imita a Pages (entrar directo a `/imoovie-front/login`, navegar por el menú, favicon y archivos sin errores) y después el sitio real en internet.

**Archivos nuevos:** `.github/workflows/deploy.yml`. **Tocados:** `vite.config.js`, `src/App.jsx`, `.gitignore` y `DOCUMENTACION.md`.

---

## Parte 23 · Vuelve la paleta Grafito

**Qué se hizo:** se aplicó de nuevo la paleta **Grafito** (la de la Parte 19) a toda la web, en lugar de la de fondo negro de la Parte 20. Los fondos son grises oscuros, el texto es casi blanco y los detalles siguen en naranja.

**Qué cambió en el código** (solo CSS, ningún concepto de React nuevo):

| Dónde | Cambio |
|---|---|
| `src/index.css` | Nuevos valores de la paleta: `--grafito-0…5` = `#1B1C1F`, `#232428`, `#2B2C31`, `#34353B`, `#3D3E45`, `#4A4B53`; grises `--gris-1…4` = `#4A4B53`, `#8A8B94`, `#B0B1BA`, `#D0D0D6`; `--texto` = `#F6F6F4`. Los naranjas, los colores de estado y las tipografías no se tocaron. |
| `src/App.css` | Las variables `--negro-0…5` se renombraron a `--grafito-0…5` (19 usos) para que el nombre siga describiendo el color. |
| `index.html` | `theme-color` (la barra del navegador en el celular) pasó a `#1B1C1F`. |

Como los colores nuevos de la cartelera estilo cine (Parte 21) ya estaban escritos con variables, se adaptaron solos: es la ventaja de tener la paleta en un único lugar.

**Verificación:**

- Un script recorrió todo el texto visible de 9 estados de pantalla (landing, ficha de película abierta, contacto y login con errores, Quiénes somos, 404 y las zonas de cliente, vendedor y admin), calculó el color real de la letra y del fondo que tiene detrás (incluidos degradés) y lo comparó con el mínimo WCAG (4,5:1; 3:1 para texto grande). **Ningún texto queda por debajo; el peor caso es 5,24:1.**
- `npm run lint` sin avisos y `npm run build` correcto.

**Archivos tocados:** `src/index.css`, `src/App.css`, `index.html` y `DOCUMENTACION.md`. No hay archivos nuevos.
