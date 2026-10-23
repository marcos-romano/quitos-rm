# quitos_RM: guía de diseño

Versión 1.1. Es la fuente de verdad del diseño visual de la app. El fondo, el texto, la tipografía y la elección de verde, rojo y azul vienen del usuario. Los valores derivados y las reglas de uso son propuestas, ajustables al verlas en pantallas reales.

## 1. Principios

- Futurista pero limpio: letra fina, trazos finos, esquinas rectas, poco adorno, mucho espacio y números grandes.
- Sin tarjetas: las secciones se separan con espacio y líneas finas, no con recuadros.
- Sobrio y formal. Nada de elementos decorativos que no comuniquen algo.
- Legible en el gimnasio: contraste alto, botones grandes y uso cómodo con una mano.
- Un solo tema, oscuro, en la versión 1.

## 2. Colores

| Token | Nombre | Hex | Uso |
|---|---|---|---|
| `--bg` | Negro medianoche | `#0A0B0F` | Fondo general (definido por el usuario) |
| `--text` | Blanco nieve | `#F7F9FB` | Texto principal (definido por el usuario) |
| `--surface` | Superficie | `#12141A` | Paneles, por ejemplo barras fijas (derivado) |
| `--surface-2` | Superficie elevada | `#1A1D25` | Campos de entrada, diálogos, elementos elevados (derivado) |
| `--border` | Borde | `#262A33` | Bordes de 1 px (derivado) |
| `--text-muted` | Texto secundario | `#9AA3AF` | Datos secundarios y etiquetas (derivado) |
| `--green` | Verde estilo TradingView | `#089981` | Completado, avance, esfuerzo bajo |
| `--red` | Rojo estilo TradingView | `#F23645` | Esfuerzo máximo, acciones destructivas, errores |
| `--blue` | Azul francia, cercano al ultramar | `#2F5BFF` | Acción principal, ronda activa, foco y selección |

Los valores de verde y rojo son los que se recuerdan como colores por defecto de TradingView. El azul es una propuesta intermedia entre el azul de Francia y el ultramar.

**En revisión:** el usuario pidió verde y rojo un poco más luminosos, el azul un poco más apagado, y para los tres un efecto neón suave (referencia: la iluminación de "Tron: el legado", pero más sutil). Las variantes se comparan en la muestra de diseño de la versión 0.4.0. Al elegir, se actualizan esta tabla y la de contraste.

### Contraste verificado (WCAG, calculado de forma independiente)

| Combinación | Relación | Uso permitido |
|---|---|---|
| Texto sobre fondo | 18,64:1 | Todo |
| Texto sobre superficie | 17,44:1 | Todo |
| Texto secundario sobre fondo | 7,71:1 | Todo |
| Texto secundario sobre superficie | 7,22:1 | Todo |
| Verde sobre fondo | 5,51:1 | Texto y elementos |
| Rojo sobre fondo | 5,05:1 | Texto y elementos |
| Azul sobre fondo | 3,80:1 | Solo relleno, bordes, íconos y texto grande en negrita |
| Texto sobre relleno azul | 4,90:1 | Texto de botones principales |
| Fondo sobre relleno verde | 5,51:1 | Texto sobre relleno verde |
| Fondo sobre relleno rojo | 5,05:1 | Texto sobre relleno rojo |
| Texto sobre relleno rojo | 3,69:1 | No usar para texto chico |

Reglas que se desprenden:
- El azul no se usa para texto pequeño sobre fondo oscuro.
- Sobre relleno azul va texto blanco nieve. Sobre relleno verde o rojo va texto en negro medianoche.

## 3. Tipografía

- Fuente: Jost, autoalojada en el proyecto (no cargada desde un servicio externo), en su versión variable.
- Peso 300 (fino) en toda la app, elegido por el usuario en la muestra de diseño. Única excepción: el texto de los botones principales va en 500, para que se lea bien sobre el relleno azul.
- Alternativa de respaldo: `"Jost", -apple-system, "SF Pro Text", system-ui, sans-serif`.
- Escala:

| Elemento | Tamaño | Peso |
|---|---|---|
| Título de pantalla | 28 px | 300 |
| Título de sección | 20 px | 300 |
| Cuerpo | 16 px | 300 |
| Dato secundario | 14 px | 300, color secundario |
| Etiqueta (mayúsculas, espaciado de letras 0,08 em) | 12 px | 300 |
| Número destacado (kilos y repeticiones en la sesión) | 32 a 40 px | 300 |

- Tamaño mínimo: 12 px. Los campos de texto usan al menos 16 px para que iOS no haga zoom al enfocarlos.
- Todos los números usan cifras de ancho fijo (tabulares), para que las columnas queden alineadas. Jost las tiene (verificado). Decimales con coma.

## 4. Espaciado, forma y bordes

- Unidad base de 4 px: 4, 8, 12, 16, 24, 32 y 48.
- Margen lateral de pantalla: 16 px, más las áreas seguras del dispositivo.
- Esquinas rectas (radio 0) en todo: botones, campos, rondas, diálogos y barras.
- Bordes de 1 px con `--border`. Sin sombras: la elevación se expresa con el tono de la superficie.
- Realce del elemento activo: borde azul de 1 px más un resplandor suave (`0 0 18px` azul al 25% de opacidad). Solo para la ronda activa y el botón principal enfocado.

## 5. Componentes

**Botones.** Altura mínima de 48 px, ancho completo en las acciones principales.
- Principal: relleno azul, texto blanco nieve, peso 500.
- Secundario: fondo transparente, borde de 1 px, texto blanco nieve.
- Destructivo: borde y texto rojos, siempre con confirmación.
- Deshabilitado: opacidad 40%.

**Secciones.** Sin tarjetas ni fondo propio. Cada sección se separa de la siguiente con una línea de 1 px en `--border` y 20 a 24 px de espacio. El título de sección va como etiqueta en mayúsculas o como título de 20 px.

**Botón del día (Inicio).** Botón principal del mismo tamaño que los demás botones, con el texto "Semana 3 · Día 2" (o el que corresponda) y una etiqueta pequeña encima. Si hay una sesión en curso, la etiqueta y la acción dicen "Continuar".

**Cuadrícula del programa (Inicio).** Semanas en filas y días en columnas. Cada estado lleva color y además una marca distinta:
- Completado: tinte verde, borde verde e ícono de tilde.
- Siguiente: borde azul y un punto.
- Pendiente: borde neutro con el número del día.
- Omitido: texto secundario, borde punteado e ícono de guion.
- Semana completa: marca propia junto al rótulo de la fila.

**Rondas (sesión).**
- Activa: borde azul con resplandor.
- Tachada: opacidad al 55%, texto tachado y tilde verde.
- Pendiente: borde neutro y texto secundario.

**Tilde de ejercicio.** Objetivo táctil de 44 por 44 px. Vacío con borde; completado con relleno verde y tilde en negro medianoche.

**RPE.** Selector de diez fichas numeradas del 1 al 10, con el número siempre visible. Color propuesto: 1 a 5 verde, 6 a 8 neutro y 9 a 10 rojo. Campo de nota opcional debajo.

**Tabla de resumen de RPE por día.** Ejercicios en filas y semanas en columnas. La primera columna queda fija y el resto se desplaza horizontalmente dentro de su propio contenedor, sin que la pantalla se mueva de costado. Cada celda muestra el RPE con el color de la escala, un punto pequeño si tiene nota y un guion si todavía no hay dato.

**Barra de sesión en curso.** Barra fija sobre la navegación inferior, con fondo `--surface-2`, borde azul y el texto "Sesión en curso: Semana 3 · Día 2" más un botón "Volver".

**Navegación inferior.** Cinco ítems (Inicio, Programa, Máximos, Historial, Más) con ícono y etiqueta de 12 px. El ítem activo lleva el ícono en azul y la etiqueta en blanco nieve; los demás, en color secundario.

**Formularios.** Campos con fondo `--surface-2`, borde de 1 px, esquinas rectas, 48 px de alto y borde azul al enfocar. Etiqueta arriba, en mayúsculas de 12 px. Los campos de fecha nativos de iOS necesitan `appearance: none` para respetar el ancho y el alto. Las fechas que la app puede saber sola (el día en que se carga un máximo o se termina una sesión) se guardan automáticamente, sin pedir un campo.

**Diálogos de confirmación.** Panel `--surface-2` sobre un velo negro al 60%. Las acciones destructivas van en rojo.

## 6. Íconos y movimiento

- Íconos de trazo de 1,5 a 2 px con esquinas redondeadas, de un único conjunto consistente (por ejemplo Lucide).
- Transiciones de 120 a 180 ms. Sin animaciones decorativas. Se respeta la preferencia del sistema de reducir el movimiento.

## 7. PWA e iPhone

- Nombre mostrado: `quitos_RM`, en `name` y en `short_name` del manifiesto.
- `theme_color` y `background_color`: `#0A0B0F`.
- `viewport-fit=cover` y áreas seguras (`safe-area-inset-*`) aplicadas a las barras fijas.
- Barra de estado de iOS en modo translúcido sobre negro, con texto claro.
- Ícono provisorio: fondo `#0A0B0F` con la letra "q" en blanco nieve y un detalle en azul. Tamaños: 180 por 180 px para iOS, y 192 y 512 px para el manifiesto. El ícono definitivo queda pendiente.

## 8. Accesibilidad

- Ningún estado se comunica solo con color: siempre hay ícono, tachado, borde distinto u otra marca.
- Objetivos táctiles de al menos 44 px, preferentemente 48 px.
- Texto normal con un contraste mínimo de 4,5:1 (ver tabla de la sección 2).

## 9. Ajustes pendientes

- Elegir las variantes de verde, rojo y azul y el efecto neón (muestra de la versión 0.4.0).
- Formato del texto del botón del día: "Semana 3, Día 2" o "Semana 3 · Día 2".
- Mostrar las fechas como dd/mm/aaaa aunque el iPhone esté en otro idioma.
- Definir el ícono definitivo.
