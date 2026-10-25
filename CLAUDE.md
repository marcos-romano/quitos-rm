# quitos_RM: especificación de la aplicación

Versión 1.1. Se sigue ajustando a medida que se toman decisiones nuevas.

**Estado actual y cómo retomar:** cada conversación nueva arranca con el parte de situación de `CONTEXTO.md` (dónde quedó el proyecto, qué sigue y cómo trabajar con el usuario), que se importa acá:

@CONTEXTO.md

**Nombre de la app:** quitos_RM, escrito exactamente así (minúsculas, guion bajo y las letras RM en mayúsculas). Es el nombre que se muestra debajo del ícono en el iPhone y dentro de la app. Identificador técnico (repositorio y paquete): `quitos-rm`. Repositorio: `https://github.com/marcos-romano/quitos-rm`. La carpeta local conserva el nombre `quitos_RM`.

## 1. Contexto y objetivo

Aplicación personal para planificar y registrar rutinas de gimnasio. La usa una sola persona desde un iPhone.

- Se instala como PWA desde Safari (ícono en la pantalla de inicio, pantalla completa) y funciona sin conexión.
- Sin login, sin servidor y sin cuentas. Los datos se guardan en el propio teléfono.
- Apariencia sobria y formal, con una estética futurista pero limpia. El diseño visual se define aparte (sección 8).
- El proyecto tiene un segundo objetivo: que el usuario aprenda vibe-coding. La base técnica se va a reutilizar en otras aplicaciones futuras.

## 2. Decisiones ya tomadas

- PWA de un solo usuario, datos locales, sin login.
- Cada bloque de entrenamiento funciona como una superserie: los ejercicios del bloque se trabajan en rondas (una serie de cada ejercicio por ronda) y el descanso se aplica al terminar la ronda. Esto vale para todos los bloques (potencia, fuerza, estructura, extras).
- No hay temporizador ni cronómetro. El descanso se muestra únicamente como dato.
- La percepción del esfuerzo usa la escala RPE de 1 a 10, con una nota opcional. Es solo ilustrativa: no entra en ningún cálculo.
- Las series son individuales: cada una tiene sus propias repeticiones, carga y descanso, y se carga y se muestra siempre por separado. No hay atajos ni resúmenes del tipo "4 x 12". Al agregar una serie, arranca como copia de la anterior y se edita.
- La carga de una serie puede ser un porcentaje del máximo del ejercicio, un peso fijo en kg o libre (sin carga prescripta).
- En dominadas el 100% es una carga agregada, como en cualquier ejercicio de musculación. El peso corporal no interviene en ningún cálculo.
- Al abrir la app aparece un botón con la semana y el día que corresponde entrenar (por ejemplo "Semana 3 · Día 2"), calculado a partir de los días ya completados. El contenido del día se ve al tocar el botón, no en el inicio.
- Entrar y salir de pantallas durante un entrenamiento nunca modifica nada: la sesión en curso se retoma exactamente donde quedó (sección 6.8).
- Tipografía Jost y paleta definidas en `DISENO.md`, que es la fuente de verdad del diseño visual.
- Solo tema oscuro en la versión 1.

## 3. Decisiones técnicas

- Lenguaje: TypeScript. Interfaz: React. Herramienta de desarrollo: Vite.
- PWA con service worker (vite-plugin-pwa), instalable en iOS y funcional sin conexión. Las versiones nuevas se aplican solo cuando el usuario toca "Actualizar".
- Almacenamiento: IndexedDB con Dexie. Se pide almacenamiento persistente al navegador cuando esté disponible.
- Excel: ExcelJS o SheetJS, a decidir en la implementación según cuál se instale sin problemas.
- Tests: Vitest para la lógica de cálculo, de importación, de selección del próximo día y de conservación del estado de la sesión.
- Publicación: GitHub Pages, en `https://marcos-romano.github.io/quitos-rm/`. La app funciona bajo la subruta `/quitos-rm/`. Se publica automáticamente con GitHub Actions al subir cambios a `main`, solo si pasan los tests.
- Repositorio público (GitHub Pages gratis lo exige). Los datos de entrenamiento no se publican: viven en el iPhone. La carpeta `referencias/` está en `.gitignore` y nunca se sube.
- Los commits usan el email privado de GitHub en su versión corta (`marcos-romano@users.noreply.github.com`), no el email personal.
- Tipografía Jost autoalojada dentro del proyecto (paquete `@fontsource-variable/jost`), no cargada desde un servicio externo, para que la app funcione sin conexión.
- Íconos de trazo fino de una sola librería: Lucide (`lucide-react`).
- Sin backend, sin analíticas y sin servicios externos.
- Interfaz en español rioplatense (es-AR): decimales con coma ("87,5 kg") y fechas en formato dd/mm/aaaa. Los identificadores del código van en inglés.

## 4. Modelo de datos

Se separa lo prescripto (el plan) de lo realizado (el registro).

### 4.1 Plan

- **Programa**: nombre y descripción opcional. Puede haber varios (por ejemplo uno por mes); uno está activo.
- **Semana**: número y etiqueta opcional. Pertenece a un programa.
- **Día**: nombre (por ejemplo "Día 1"), orden y un texto libre de preparación previa (por ejemplo "5' foam roll, 5' movilidad, 5' flexibilidad").
- **Bloque**: nombre, tipo (potencia, fuerza, hipertrofia, estructura, extra u otro), orden y descanso por defecto en segundos, que se aplica al cerrar cada ronda.
- **Ejercicio del bloque**: referencia al catálogo, orden y nota opcional del plan (por ejemplo una indicación técnica del entrenador), que se muestra como texto de solo lectura durante la sesión.
- **Catálogo de ejercicios**: nombre y tipo de medida (repeticiones, tiempo o distancia). Un ejercicio puede tener un máximo asociado y, opcionalmente, un incremento de redondeo propio (sección 5).
- **Serie prescripta**: posición (equivale al número de ronda) y una medida: repeticiones, segundos o metros. Incluye indicador "por lado", carga (porcentaje, kg fijo o libre), descanso propio opcional (reemplaza al del bloque) y nota opcional.
- **Máximo**: ejercicio, valor en kg y fecha. Se conserva el historial de máximos anteriores.

### 4.2 Registro

- **Sesión**: día del plan, fecha de realización, estado y nota del día. Estados posibles: en curso, completada u omitida. Un día sin sesión registrada está pendiente.
- Al iniciar una sesión se copia la prescripción del día. Editar el plan después no modifica sesiones pasadas.
- **Serie realizada**: marca de completada, repeticiones reales, kg reales y kg prescriptos al momento de realizarla. Al tildar una serie se guardan los kg efectivos, de modo que cambios posteriores en un máximo no alteran el historial.
- **Esfuerzo por ejercicio** dentro de la sesión: RPE de 1 a 10 y nota, ambos opcionales e independientes entre sí.
- El estado de la sesión en curso se guarda tras cada tilde, de modo que cerrar la app a mitad del entrenamiento no pierde nada y se retoma donde quedó.
- También se guardan al instante, como borrador, el texto a medio escribir (notas, RPE) y la posición dentro de la sesión (ronda activa).

## 5. Reglas de cálculo

- Peso prescripto = máximo x porcentaje / 100.
- Redondeo configurable en Ajustes, con un valor global y un incremento propio opcional por ejercicio. Opciones: exacto, 0,5 kg, 1 kg, 1,25 kg, 2,5 kg o 5 kg.
- Valor global por defecto: 2,5 kg, que es el incremento mínimo con barra (discos de 1,25 kg de cada lado).
- Incremento propio inicial para dominadas: 1,25 kg, ya que la carga se agrega con discos sueltos. Es editable.
- El redondeo es al más cercano, y los empates van hacia arriba.
- Se muestra el peso redondeado de forma principal y, como dato secundario, el valor exacto calculado (por ejemplo "85 kg" y debajo "84 exactos").
- Las series con carga libre muestran "Libre" y no calculan nada.
- Si el ejercicio no tiene máximo cargado, se muestra un aviso en lugar de un peso. No se inventan valores.
- La aritmética evita errores de coma flotante (por ejemplo calculando en décimas o centésimas de kg enteras).

Casos de prueba obligatorios, verificados de forma independiente con aritmética decimal exacta:

| Máximo | Porcentaje | Exacto | Redondeo 1,25 kg | Redondeo 2,5 kg |
|---|---|---|---|---|
| 120 kg | 70% | 84 | 83,75 | 85 |
| 120 kg | 65% | 78 | 77,5 | 77,5 |
| 100 kg | 85% | 85 | 85 | 85 |
| 97 kg | 85% | 82,45 | 82,5 | 82,5 |
| 105 kg | 90% | 94,5 | 95 | 95 |
| 35 kg | 65% | 22,75 | 22,5 | 22,5 |
| 35 kg | 70% | 24,5 | 25 | 25 |
| 35 kg | 75% | 26,25 | 26,25 | 27,5 |
| 35 kg | 80% | 28 | 27,5 | 27,5 |
| 35 kg | 85% | 29,75 | 30 | 30 |
| 35 kg | 90% | 31,5 | 31,25 | 32,5 |

La fila de 35 kg al 75% con redondeo de 2,5 kg es un empate (10,5 incrementos) y debe dar 27,5 por la regla de empates hacia arriba.

## 6. Pantallas

Navegación principal con una barra inferior: Inicio, Programa, Máximos, Historial y Más (respaldo y ajustes). El detalle visual se define en `DISENO.md`.

### 6.1 Inicio

- Al abrir la app, lo principal en pantalla es un botón con la semana y el día que corresponde entrenar (por ejemplo "Semana 3 · Día 2"). El contenido del día no se muestra en el inicio: se accede tocando el botón. Si hay una sesión en curso, el botón dice "Continuar" y retoma exactamente donde quedó.
- El próximo día es el primero en orden (semana por semana, día por día) cuyo estado no sea completado ni omitido.
- Debajo, la vista general del programa completo: una cuadrícula con las semanas como filas y los días como columnas. Cada celda muestra su estado (completado, siguiente, pendiente u omitido) y se va marcando a medida que se completan días. Una semana con todos sus días completados lleva además una marca propia de semana completa.
- Tocar una celda abre ese día: si está pendiente, muestra lo prescripto con la opción de empezarlo (incluso fuera de orden); si está completado, muestra lo realizado en modo consulta.
- Tocar el encabezado de un día (por ejemplo "Día 2") abre el resumen de ese día a lo largo de las semanas: una tabla con los ejercicios del día en filas y las semanas en columnas, con el RPE registrado en cada celda (vacía si todavía no se hizo). Las celdas con nota lo indican, y tocar una celda muestra el detalle (repeticiones y kilos reales, RPE y nota). Sirve para comparar de un vistazo cómo fue cada semana y decidir cómo encarar la siguiente. Es solo de consulta.
- Un día se puede marcar como omitido para que no bloquee la secuencia, y la marca se puede revertir.
- Si todos los días del programa están completados, se muestra un resumen y el acceso a los programas.
- El estado nunca se transmite solo con color: cada estado lleva además un ícono o una marca distinta.

### 6.2 Programa y editor

- Navegación programa > semana > día > bloque > ejercicio > series.
- Crear, editar, duplicar, reordenar y eliminar en cada nivel. Eliminar pide confirmación.
- Duplicar semana completa, para armar variaciones a partir de una existente.
- Las series se agregan de a una: cada serie nueva arranca como copia de la anterior y se edita. No hay atajo "N x M".
- Edición de cada serie por separado: medida, carga (porcentaje, kg o libre), descanso y nota.

### 6.3 Entrenamiento (sesión)

- Cada bloque se muestra por rondas. La ronda activa está destacada y muestra cada ejercicio con repeticiones y kilos ya calculados.
- Cada ejercicio de la ronda tiene su tilde. Al completar todos, la ronda queda tachada y atenuada y pasa a ser activa la siguiente.
- Una ronda tachada se puede reabrir con un toque.
- Si los ejercicios tienen cantidades de series distintas, cada ronda incluye solo los ejercicios que todavía tienen series pendientes en esa posición.
- Al tildar, los valores prescriptos se toman como realizados. Si se hizo otra cosa, se edita el peso o las repeticiones en esa misma fila.
- El descanso del bloque se muestra como dato de texto al cerrar cada ronda ("Descanso: 180 s").
- Al completar la última serie de un ejercicio se ofrece cargar el RPE (1 a 10) y una nota opcional, por ejemplo "estaba fatigado, marqué 10 pero debió ser 8". Ambos campos se pueden omitir y se pueden editar después desde el historial. Referencias del RPE: 10 esfuerzo máximo, 9 una repetición en reserva, 8 dos, 7 tres, 5 a 6 moderado, 1 a 4 liviano.
- Nota del día, además de la nota de cada ejercicio.
- El día se marca como realizado al finalizarlo. Si quedan series sin tildar, se pide confirmación indicando cuántas son (sección 6.8).

### 6.4 Máximos
Lista de ejercicios con su máximo actual, editable, con historial por fecha.

### 6.5 Historial
Lista de sesiones completadas por fecha, con el detalle de lo realizado, el RPE y las notas, editables. En una fase posterior, evolución de carga y repeticiones por ejercicio.

### 6.6 Respaldo, importación y exportación
- Exportar un respaldo completo en JSON (programas, máximos, sesiones, ajustes) y restaurarlo con confirmación.
- Recordatorio visual cuando pasaron más de 14 días desde el último respaldo.
- Importar y exportar programas en Excel (sección 7).

### 6.7 Ajustes
Redondeo de cargas (global y por ejercicio), unidad (kg), recordatorio de respaldo y datos de la aplicación.

### 6.8 Entrar y salir sin perder el estado

Principio: salir a mirar otra cosa y volver nunca altera nada. Es como pasar a otra habitación y regresar a la misma tarea, tal como se la dejó.

- La sesión en curso es independiente de la navegación. Ir al inicio, a un resumen, a Máximos, a Historial o a cualquier otra pantalla y volver deja todo igual: la misma ronda activa, las mismas rondas tachadas, las mismas notas escritas y la misma posición en pantalla.
- Mientras hay una sesión en curso, todas las pantallas muestran una barra persistente ("Sesión en curso: Semana 3 · Día 2 · Volver") que lleva de regreso con un toque.
- Las pantallas de consulta (inicio, resúmenes, historial) son de solo lectura: mirar no modifica nada. Toda edición es explícita, mediante un botón de editar.
- Lo escrito a medias se guarda como borrador al instante. Se conserva aunque iOS cierre la app en segundo plano, aunque se cierre del todo o aunque pasen horas.
- Solo puede haber una sesión en curso a la vez. Al intentar empezar otro día con una sesión abierta, la app ofrece retomar la abierta o cerrarla antes (finalizarla u omitirla).
- Debe haber pruebas automáticas que simulen entrar y salir de una sesión y comprueben que el estado queda idéntico.

## 7. Excel

Formato de una fila por serie, en la hoja "Programa":

| Columna | Contenido |
|---|---|
| Programa | Nombre del programa |
| Semana | Número |
| Día | Número o nombre |
| Bloque | Nombre del bloque |
| Tipo de bloque | potencia, fuerza, hipertrofia, estructura, extra u otro |
| Descanso del bloque (s) | Segundos |
| Orden de ejercicio | Posición dentro del bloque |
| Ejercicio | Nombre |
| Serie | Número de serie (equivale a la ronda) |
| Repeticiones | Número, o vacío |
| Tiempo (s) | Número, o vacío |
| Distancia (m) | Número, o vacío |
| Por lado | sí o no |
| Tipo de carga | porcentaje, kg o libre |
| Carga | Valor, o vacío si es libre |
| Descanso de la serie (s) | Opcional, reemplaza al del bloque |
| Nota | Texto opcional |

Reglas de importación:
- Siempre hay pantalla de revisión antes de guardar, con los errores señalados por fila.
- Se detectan textos en columnas numéricas (por ejemplo la letra O en lugar del cero) y se marcan como error.
- Los nombres de ejercicio que no existen en el catálogo se señalan y se sugieren nombres parecidos del catálogo. El nombre de un ejercicio es texto libre y no se valida contra ninguna lista fija.
- Se puede crear un programa nuevo (opción por defecto) o reemplazar uno existente, con confirmación. Las sesiones ya registradas no se modifican.
- Hoja opcional "Máximos" con ejercicio y valor.
- Se ofrece una plantilla descargable con un ejemplo.
- Exportar genera el mismo formato, de modo que se puede editar en Excel y volver a importar.

El programa del entrenador (4 días, 4 semanas) es el caso de prueba de referencia. El usuario lo va a pasar a esta plantilla.

No se usa notación compacta en una sola celda (por ejemplo "5x95, 4x97"): siempre una fila por serie.

## 8. Diseño

La definición completa está en `DISENO.md`, que es la fuente de verdad de colores, tipografía y componentes. Resumen:

- **Nombre:** quitos_RM.
- **Tipografía:** Jost fina (peso 300) en toda la app, con cifras de ancho fijo.
- **Fondo:** negro medianoche `#0A0B0F`. **Texto:** blanco nieve `#F7F9FB`.
- **Acentos:** verde `#089981` y rojo `#F23645` (los de TradingView) y azul `#243AB8` (entre azul francia y medianoche), con un resplandor neón suave. Elegidos por el usuario en su iPhone.
- Estética futurista pero limpia: letra fina, sin tarjetas (secciones separadas por líneas finas), esquinas rectas, poco adorno, mucho espacio y números grandes y legibles.
- Mobile-first para iPhone, en vertical, respetando las áreas seguras del dispositivo. Botones de al menos 48 px de alto (objetivo táctil de al menos 44 puntos), uso cómodo con una mano y alto contraste para leerse en el gimnasio.
- El color nunca es el único portador de significado: siempre se acompaña de ícono, tachado u otra marca, porque el rojo y el verde se confunden entre sí en el tipo de daltonismo más frecuente.
- No se toma como referencia el estilo visual del PDF original del entrenador.

## 9. Fases

1. **Versión 1, núcleo.** Orden de construcción, con las pantallas que dependen del diseño al final:
   1. Fundación: proyecto, repositorio en GitHub y una PWA mínima publicada e instalada en el iPhone, para validar de entrada el ciclo completo de desarrollo, publicación e instalación.
   2. Modelo de datos, almacenamiento local, máximos y cálculo, con sus tests.
   3. Revisión de `DISENO.md` con el usuario (ya existe una primera versión) y construcción de los elementos base de la interfaz: colores, tipografía y componentes comunes, antes de programar la primera pantalla.
   4. Editor del plan.
   5. Sesión por rondas con notas, RPE y manejo del estado (secciones 6.3 y 6.8).
   6. Inicio con el botón del próximo día, la cuadrícula y los resúmenes de RPE por día (sección 6.1).
   7. Máximos, historial y respaldo en JSON.
2. **Versión 2:** importación y exportación de Excel.
3. **Versión 3:** gráficos de progreso, rediseños y mejoras.

## 10. Reglas de trabajo para Claude Code

- La persona que usa el proyecto no sabe programar. Se explica en lenguaje simple qué se hizo y por qué, y cada concepto nuevo se presenta en dos o tres líneas.
- Antes de cambios grandes se presenta el plan y se espera confirmación. Antes de cada subpaso se explica qué se va a hacer y se espera el "sí"; si un comando puede generar dudas, se explica su motivo antes de ejecutarlo.
- Cuando el usuario hace una pregunta, se responde con palabras: no se ejecutan comandos ni se cambia nada hasta que pida una acción.
- Las decisiones visuales se toman viendo: se publica una muestra temporal y el usuario la mira en su iPhone.
- Se trabaja en pasos pequeños: una funcionalidad por vez, probada antes de pasar a la siguiente.
- Se prefiere la solución más simple que cumpla el objetivo.
- No se agregan dependencias sin explicar para qué sirven.
- La lógica de cálculo vive en un módulo separado de la interfaz y tiene tests. Los tests se ejecutan antes de cada commit.
- Commits de git frecuentes, con mensajes descriptivos en español.
- Cada vez que se agrega algo, se indica cómo probarlo en la Mac y cómo verlo en el iPhone. Cada publicación sube la versión en `package.json`, así el iPhone muestra "Actualizar" y la versión nueva.
- Al cerrar cada tanda de trabajo, y antes de terminar una conversación, se actualiza `CONTEXTO.md` y se hace commit.
- Si algo de esta especificación es ambiguo o se contradice, se pregunta antes de decidir.
- Este archivo se actualiza cuando se toman decisiones nuevas, con aprobación del usuario.
- Nunca se borran ni se modifican datos del usuario sin confirmación.
- `DISENO.md` es la fuente de verdad del diseño. No se usan colores, tamaños ni componentes fuera de esa definición sin consultar.
- Los archivos de referencia del usuario (Word, Excel, capturas) se guardan en la carpeta `referencias/` y se consultan antes de decidir la disposición visual de las pantallas o el formato de importación.

## 11. Pendientes de definición

1. Archivos de referencia del usuario (Word y Excel) con la disposición deseada de los ejercicios. Ajustan las secciones 6.3 y 7 y se esperan antes de construir la sesión de entrenamiento y la importación de Excel.
2. Ícono de la app. Provisoriamente, una versión simple con fondo `#0A0B0F`.
3. ~~Ajuste fino de los colores~~: resuelto. Verde `#089981`, rojo `#F23645` y azul `#243AB8`, con resplandor neón, elegidos en el iPhone (`DISENO.md` §2).
4. ~~Cifras tabulares de Jost~~: resuelto. Jost las tiene y se usan en toda la app (`DISENO.md` §3).
5. Contenido de las celdas del resumen de RPE por día (sección 6.1): por ahora solo el RPE, con repeticiones y kilos reales al tocar la celda. Se puede cambiar al ver la pantalla.
6. ~~Botón del día en Inicio~~: resuelto. Mismo tamaño que los demás botones y texto "Semana 3 · Día 2", con punto medio (`DISENO.md` §5).
