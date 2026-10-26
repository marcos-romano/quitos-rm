# quitos_RM: contexto para retomar

Parte de situación para que una conversación nueva de Claude Code siga el trabajo sin perder nada. `CLAUDE.md` lo importa, así que se carga solo al empezar cada sesión.

- `CLAUDE.md`: qué es la app (especificación). `DISENO.md`: cómo se ve (fuente de verdad del diseño). Este archivo: dónde estamos, cómo se trabaja y qué sigue. No repite lo que ya dicen esos dos.
- Se actualiza al cerrar cada tanda de trabajo y antes de terminar una conversación: secciones 1, 6 y 7, más lo que haya cambiado.

**Última actualización:** 26/10/2026, al cerrar la tanda 4.5 (paso 4 terminado). Versión publicada: 0.11.0.

## 1. Dónde estamos

- **App publicada:** https://marcos-romano.github.io/quitos-rm/, versión 0.11.0. El usuario la tiene instalada en el iPhone y la actualiza con el botón "Actualizar".
- **Versión 1, pasos 1, 2 y 3:** terminados y probados en el iPhone (fundación, modelo de datos con cálculo y base local, diseño y componentes base).
- **Paso 4 (editor del plan): terminado.** Tandas 4.1 (navegación), 4.2 (motor del plan), 4.3 (importar el programa del entrenador, ya importado en el iPhone), 4.4 (programa, semana y día) y 4.5 (bloque, buscador de ejercicios, ejercicio y serie).
- **Sigue el paso 5 (sesión por rondas).** Antes hacen falta los archivos de referencia del usuario (Word o Excel) con la disposición de los ejercicios (`CLAUDE.md` §11.1). Pedírselos.
- **Aprobado por el usuario:** las pantallas de la 4.4 ("están buenas"), con dos ajustes ya hechos en la 0.10.1: "Movilidad + entrada en calor" en lugar de "Preparación" y la copia de semana como "Semana 1 (copia)".
- **A revisar por el usuario en el iPhone:** las pantallas de la 4.5 (bloque, buscador, ejercicio y serie). Cuando las apruebe, sumar a `DISENO.md` §5 las piezas nuevas de la 4.4 y la 4.5: filas de lista, controles de "Editar", botón "Editar"/"Listo", lista desplegable y la vista de una serie.

## 2. Cómo trabajar con el usuario

Lo aprendido en la primera conversación. Complementa la sección 10 de `CLAUDE.md`.

- **Explicar simple:** es principiante y habla español rioplatense. Cada concepto nuevo va en dos o tres líneas, sin jerga.
- **Una pregunta es una pregunta:** se responde con palabras, sin ejecutar comandos (ni siquiera de lectura) ni cambiar nada. Rechazó un comando con "era una pregunta".
- **Avisar antes de actuar:** antes de cada subpaso se explica qué se va a hacer y se espera el "sí". Si un comando no se entiende, lo rechaza para preguntar si hace falta: explicar el motivo antes.
- **Los ejemplos no son literales:** los ejemplos de la especificación son ilustrativos (por ejemplo, el tamaño o el formato de un botón). Confirmar antes de fijarlos en el diseño.
- **Decide viendo:** para decisiones visuales se publica una muestra temporal y el usuario la mira en el iPhone. Para elegir le sirven opciones numeradas con una recomendada.
- **Lo que hace él:** instalar y actualizar en el iPhone, probar, mandar capturas y cambiar ajustes en la web de GitHub. Lo demás lo hace Claude.
- **Cierre de cada tanda:** qué se hizo, cómo probarlo en la Mac (con el comando en un bloque `bash`) y en el iPhone (pasos numerados), y qué sigue.
- **Errores de tipeo:** escribe rápido. Se interpretan con criterio y se pregunta solo si cambia el sentido.

## 3. Ciclo técnico

- **Comandos:**
  - `npm run dev` abre la app en http://localhost:5173/quitos-rm/.
  - `npm test` corre las pruebas (Vitest).
  - `npm run typecheck` revisa los tipos.
  - `npm run lint` revisa el código (oxlint, que vino en la plantilla en lugar de ESLint).
  - `npm run build` arma la versión final.
  - `npm run preview` muestra esa versión final en el puerto 4173.
  - `npm run generate-icons` genera los PNG desde `public/icon.svg`.
- **Guardia antes de cada commit:** `.githooks/pre-commit` revisa los tipos y corre los tests. Se activa con `npm install` (script `prepare`).
- **Publicar:**
  1. Subir la versión con `npm pkg set version=X.Y.Z && npm install --package-lock-only`.
  2. Hacer commit en español con la línea de atribución que indique Claude Code, y `git push`.
  3. GitHub Actions (`.github/workflows/deploy.yml`) corre tipos, tests y build, y publica en Pages. Para esperarlo: `gh run watch` sobre el último run.
  4. El iPhone muestra "Actualizar".
- **Convención de versiones:** el número del medio sube con cada tanda nueva y el último, con cada ajuste. Toda publicación sube la versión, así el usuario ve el cambio.
- **Verificar en el navegador integrado:**
  - `.claude/launch.json` tiene `quitos-rm-dev` y `quitos-rm-preview`. Hay que navegar a `/quitos-rm/` y usar el tamaño `mobile` (375 × 812).
  - Las capturas en tamaño mobile salen comprimidas. Conviene medir con JavaScript (`getBoundingClientRect`) y usar `zoom` sobre una región.
  - Al terminar: volver al tamaño de escritorio y parar el servidor.
  - Para probar "Importar programa": el servidor de desarrollo sirve `/quitos-rm/referencias/programa-entrenador.json`. Con JavaScript se arma un `File`, se asigna con `DataTransfer` al `input[type=file]` y se dispara `change`.
- **Leer un PDF:** no hay librerías de PDF instaladas y Swift no compila (versiones del SDK). Funciona `osascript -l JavaScript` con PDFKit: `selectionsByLine` da cada renglón con su posición, y `selectionForRect` recorta el texto por columna.
- **Entorno:** Mac Intel con macOS 15, Node 24, npm 11, `gh` con sesión iniciada como `marcos-romano` y git con el email privado corto.
  - La Terminal del usuario arranca en su carpeta personal: hay que hacer `cd` a la carpeta del proyecto, con comillas porque el nombre tiene espacios.
  - El `(base)` del prompt es de Anaconda y no afecta.
- **Avisos que se pueden ignorar:** npm "install-scripts … fsevents" y GitHub "ubuntu-latest will migrate to Ubuntu 26".
- **Cuidados con iOS:**
  - Los controles necesitan `border-radius: 0` (ya está como regla global en `index.css`). Los campos de fecha, además, `appearance: none`.
  - Los campos usan 16 px o más, para que iOS no haga zoom.
  - `inputMode="decimal"` abre el teclado numérico con coma, y al usuario le parece bien.
  - El campo de fecha nativo muestra el mes en el idioma del iPhone. Por eso se evitan los campos de fecha: las fechas se guardan solas.

## 4. Mapa del código

- `src/domain/`: lógica pura, sin pantallas ni base de datos. Cada archivo tiene su `*.test.ts` al lado.
  - `types.ts`: modelo completo. Los tipos del registro (`Session`, `PerformedSet`, `ExerciseEffort`) son provisorios hasta el paso 5. `PrescribedSet` no tiene nota ni "por lado" (sección 6).
  - `plan.ts`: el motor del editor. Cada función recibe un programa y devuelve uno nuevo, sin tocar el original.
    - Rutas por ids: `WeekPath`, `DayPath`, `BlockPath`, `ExercisePath` (con `blockExerciseId`, el ejercicio dentro del bloque) y `SetPath`.
    - Por nivel: `createProgram`, `updateProgram`, `duplicateProgram`, `addWeek`, `nextWeekNumber`, `updateWeek`, `addDay` (nombre "Día N"), `updateDay`, `addBlock`, `updateBlock`, `addExercise`, `updateExercise`, `addSet` (copia de la anterior; la primera usa `FIRST_SET_VALUE`: 10 repeticiones, 30 s o 15 m, con carga libre) y `updateSet`.
    - En cualquier nivel, según la ruta: `moveItem` (-1 o +1; en los extremos no hace nada), `removeItem` y `duplicateItem`. La copia va siempre justo después del original: la semana con el mismo número y "copia" en la etiqueta (o "Descarga, copia"); el día y el bloque con "(copia)" en el nombre.
    - Una ruta que no existe da error.
  - `load.ts`: cálculo de carga en enteros (centésimas de kg y décimas de porcentaje), con empates hacia arriba. También `resolveIncrement` y las constantes de redondeo.
  - `format.ts`: formato es-AR. `formatNumber`, `formatKg`, `formatLoad` ("85 kg" y "84 exactos"), `parseDecimal` (acepta coma o punto y rechaza letras), `parseWholeNumber` (enteros mayores que cero), `formatCount` ("1 semana", "4 semanas"), `formatRest` ("180 s"), `parseSeconds` (enteros, acepta 0), `formatNumberForInput` (sin punto de miles, para campos editables), `MEASURE_LABELS`, `LOAD_KIND_LABELS`, `formatMeasure` ("8 repeticiones", "30 s"), `formatSetShort` ("8 al 65%", "15 m con 24 kg"), `formatSetLoad` ("65% · 22,5 kg"), `formatWeekTitle` ("Semana 1 (copia)": la etiqueta va entre paréntesis en el título), `BLOCK_TYPE_LABELS`, `formatDayLabel` ("Semana 3 · Día 2"), `toLocalDate` y `formatDate`.
  - `names.ts`: limpia y normaliza nombres, sin tildes ni mayúsculas.
  - `settings.ts`: ajustes por defecto (redondeo de 2,5 kg y recordatorio a los 14 días).
  - `programFile.ts`: el archivo de programa en JSON (`format: "quitos-rm-program"`, `version: 1`), con los ejercicios por nombre y cada serie como `{ "reps" | "seconds" | "meters", "percent" | "kg", "restSec" }`.
    - `parseProgramFile` revisa todo y junta los errores con su ubicación ("Semana 2 · Día 3 · Fuerza 1 · Dominadas · serie 4: …").
    - `buildProgram` busca cada ejercicio en el catálogo con `normalizeName` y crea los que faltan, con la medida de su primera serie. `summarizeProgram` cuenta semanas, días, ejercicios y series.
  - `rpe.ts`: tono por valor (1 a 5 verde, 6 a 8 neutro, 9 y 10 rojo) y descripciones. El 5 sale verde pero se describe como "Moderado".
  - `coachDay1Week1.fixture.ts`: el Día 1 · Semana 1 del entrenador, solo para tests.
- `src/db/`: base local IndexedDB con Dexie. Las funciones reciben `db` como parámetro, para poder probarlas.
  - `db.ts`: esquema versión 1 (programs, exercises con `&nameKey` único, maxes, sessions y settings). Al crearse la base carga "Dominadas" con incremento de 1,25 kg.
  - `appDb.ts`: la base única que usa la app.
  - `exercises.ts`, `maxes.ts` (historial; el vigente es el de fecha más reciente; `listCurrentMaxes` da todos los vigentes juntos), `programs.ts` (`deleteProgram` no toca las sesiones y saca el programa activo si era ese; `importProgram` guarda siempre un programa nuevo, en una sola transacción; `addProgram` deja activo el programa nuevo si no había otro; `changeProgram` aplica cada cambio del editor sobre la última versión guardada; `setActiveProgram`), `settings.ts` y `persist.ts` (pide almacenamiento persistente).
  - `db.test.ts`: usa `fake-indexeddb`, que se importa primero, y una base nueva por test. Incluye "cerrar y reabrir la app".
- `src/ui/`: pantallas.
  - `App.tsx` (está en `src/`, no en `src/ui/`): la pestaña activa y la `BottomNav`. Las cinco pantallas quedan armadas aunque no se vean (atributo `hidden`), así cambiar de pestaña no pierde nada, y cada pestaña recuerda hasta dónde se bajó.
  - `useLiveQuery.ts`: lee de la base con `liveQuery` de Dexie y se actualiza sola cuando esos datos cambian. La consulta se arma una sola vez.
  - `screens/`: una pantalla por pestaña.
    - `HomeScreen` (título "quitos_RM") e `HistoryScreen`: textos provisorios ("Llega en el paso 6", "en el paso 7").
    - `ProgramScreen`: la pestaña Programa. Guarda dónde está el usuario (`programId`, `weekId`, `dayId`) y si está en modo "Editar". Abre cada nivel arriba de todo y, al volver, recupera la posición del nivel anterior. Si lo que se miraba deja de existir, muestra el nivel de arriba. Cada cambio pasa por `changeProgram`.
    - La ubicación llega hasta la serie: `programId`, `weekId`, `dayId`, `blockId`, `blockExerciseId`, `setId` y `picking` (el buscador). `parentOf` da el nivel de "←". Lee en vivo programas, ajustes, catálogo y máximos vigentes.
    - `program/`:
      - `ProgramListView` (programas, con el activo marcado con ícono y texto; "Nuevo programa" abre el programa nuevo en modo "Editar"), `ProgramView` (datos, "Usar como programa activo" y semanas) y `WeekView` (número, etiqueta y días).
      - `DayView`: nombre, "Movilidad + entrada en calor" (el campo `prep`) y bloques. "Agregar bloque" crea "Bloque N" (tipo "Otro", 90 s) y lo abre en modo "Editar".
      - `BlockView`: tipo, descanso por ronda y ejercicios, con cada serie listada ("8 al 65% · 8 al 70%"). "Agregar ejercicio" abre `ExercisePickerView`, que busca con `normalizeName` u ofrece "Crear «…»". El ejercicio elegido se abre en modo "Editar" (reemplaza al buscador en el recorrido).
      - `ExerciseView`: nota, máximo vigente (si alguna serie usa porcentaje) y series con la carga calculada; "Agregar serie" copia la anterior.
      - `SetView`: medida ("Se mide en" y el valor), carga (`LoadEditor`: al pasar a porcentaje o kg no guarda nada hasta que se escribe un número) con `LoadValue` en grande, y descanso propio opcional.
      - `shared.tsx` (`EditToggle` y el tipo `ChangeProgram`) y `fields.ts` (`requireName`, `optional`, `secondsError`).
    - `MaxesScreen`: envuelve el panel de prueba.
    - `MoreScreen`: "Importar programa" (elige un `.json` y abre la revisión), versión, "Lista para usar sin conexión" y "Ver componentes", que abre el catálogo como pantalla interna con "←".
    - `ImportProgramScreen`: revisión antes de guardar (programa, resumen, ejercicios nuevos y existentes) o la lista de errores. Mirar no guarda nada.
  - `usePwa.ts`: registra el service worker, dice si la app funciona sin conexión y si hay versión nueva (modo `prompt`, sin recargas solas), y busca versión nueva al volver a primer plano.
  - `UpdatePrompt.tsx`: aviso "Nueva versión · Actualizar", fijo sobre la navegación.
  - `MaxesTestPanel.tsx`: **temporal** hasta el paso 7. Sirve para cargar máximos y probar el cálculo. La lista de ejercicios usa `liveQuery` de Dexie: se actualiza sola al importar.
  - `ComponentCatalog.tsx`: **temporal**. Muestra cada componente con sus estados.
  - `components/`: piezas base, con estilos en `components.css`.
    - `Button` (variantes `primary`, `secondary` y `destructive`; acepta `ref`) y `TextField` (con `error`).
    - `Section` (separador sin tarjeta) y `LoadValue`.
    - `Tick` (44 × 44) y `RpeSelector` (dos filas de cinco; tocar el elegido lo borra).
    - `BottomNav` (cinco pestañas con su tipo `Tab`), `SessionBar` y `ConfirmDialog` (arranca con "Cancelar" seleccionado).
    - `Screen`: título de 28 px, `subtitle` opcional debajo, `action` arriba a la derecha (por ejemplo "Editar") y, si recibe `onBack`, el botón "←" de 48 × 48. Toda pantalla nueva la usa.
    - `PlanList`: filas del plan con título de 20 px, subtítulo y detalle. En modo "Editar" muestra ↑ ↓ (opcionales), duplicar y eliminar (rojo, con `ConfirmDialog`), con botones de 44 × 44.
    - `AutoSaveField`: campo que guarda mientras se escribe. Mientras tiene el foco muestra lo escrito; si `validate` da error, no guarda y lo muestra.
    - `TextField` acepta `onFocus` y `onBlur`. `PlanList` sin `onDuplicate`/`onDelete` no muestra controles (lo usa el buscador).
    - `SelectField`: lista desplegable con el aspecto de los campos y una flecha; en el iPhone abre la rueda del sistema.
- `src/index.css`: tokens de `DISENO.md` en `:root` (colores, resplandores `--glow-*` y `--nav-height`), letra 300 con cifras tabulares en todo y esquinas rectas globales.
- **Raíz:**
  - `vite.config.ts`: subruta `/quitos-rm/`, manifiesto PWA y `__APP_VERSION__` tomado de `package.json`.
  - `pwa-assets.config.ts` y `public/`: íconos. El provisorio todavía usa el azul anterior `#2F5BFF`.
  - `.gitignore`: excluye `referencias/`, que nunca se publica.

## 5. Decisiones que no están escritas en otro lado

- **Programas:** cada programa se guarda como una sola ficha anidada (programa, semanas, días, bloques, ejercicios y series). El orden es la posición en cada lista, y los ids salen de `crypto.randomUUID()`.
- **Máximos:** la fecha se guarda sola, el día en que se carga, sin campo de fecha. El usuario no quiere campos de fecha innecesarios, y las fechas automáticas sirven para la progresión y la vista mensual futuras.
- **Datos de prueba:** el usuario cargó máximos en el panel de su iPhone, por ejemplo Dominadas 40 kg. No borrarlos sin preguntar; se decide en el paso 7.
- **Diseño decidido en el iPhone, con muestras:** todo está en `DISENO.md` 1.5.
  - Jost 300 en todo, sin tarjetas y con esquinas rectas.
  - Verde `#089981`, rojo `#F23645` y azul `#243AB8`, con resplandor neón.
  - Navegación siempre visible y compacta, con una línea en el ítem activo.
  - El texto del botón del día es "Semana 3 · Día 2".

## 6. Plan del paso 4: editor del plan

**Acordado con el usuario:**

- **Guardado automático:** no hay botón "Guardar".
- **Modo "Editar":** en cada pantalla, un botón "Editar" muestra los controles para reordenar (flechas ↑ ↓), duplicar y eliminar. Así, mirar el plan nunca lo modifica. Eliminar siempre pasa por `ConfirmDialog`.
- **Volver atrás:** con un botón "←" arriba de cada pantalla. No se usa ninguna librería de rutas.
- **Decidido con criterio en la 4.4** (el usuario lo ve en el iPhone y puede pedir cambios):
  - Todo lo que modifica (agregar, renombrar, mover, duplicar y eliminar) aparece solo en modo "Editar". Fuera de ese modo, el único botón que cambia algo es "Usar como programa activo". Si no hay programas, "Nuevo programa" se ve igual.
  - Al entrar a otro nivel o volver, el modo "Editar" se apaga.
  - Eliminar el programa activo deja la app sin programa activo: no se elige otro solo.
- **Números de semana:** cada semana conserva el número que le pone el usuario. La app nunca renumera sola al mover, borrar o duplicar: el usuario prefiere ese margen. El orden de la lista es independiente del número.
- **Orden de las tandas:** el usuario lo dejó a criterio de Claude. Se carga el programa del entrenador (4.3) antes de las pantallas del editor (4.4 y 4.5).
- **Series:** **nunca** "N x M". Cada serie se carga y se muestra por separado. "Agregar serie" crea una copia de la anterior, que después se edita. Tampoco hay notación compacta en Excel.
- **Carga calculada:** si la carga es un porcentaje y el ejercicio tiene máximo, al lado se muestran los kg calculados (`LoadValue`).
- **Qué se carga en cada serie** (decidido en la segunda conversación, ya escrito en `CLAUDE.md` 1.2):
  - Medida, carga y descanso. La medida son repeticiones, segundos o metros, y se muestra en el mismo lugar ("8", "30 s", "15 m"). En el PDF van por tiempo el isquio isométrico (30 s) y la plancha Copenhagen (15 s); por distancia, las caminatas de granjero y de hombros (15 m).
  - **Sin nota por serie:** una sola nota por ejercicio, opcional.
  - **Sin marca "por lado":** el número cargado es el que vale. El usuario sabe si es por lado o en total. Al transcribir el PDF, "6/6" se carga como 6 y "15"/15"" como 15 s (se le avisó; puede pedir el total).
  - **Sin RPE en el plan:** el RPE es solo el que el usuario marca al terminar cada ejercicio (paso 5).
- **Programa del entrenador:** se carga como **ejemplo** para avanzar; el Excel sigue en la Versión 2.
  - **Hecho (tanda 4.3):** transcripto a `referencias/programa-entrenador.json` (nunca se publica, sin nombres de personas): 4 semanas, 16 días, 37 ejercicios y 686 series. Las pruebas de `programFile.test.ts` lo revisan cuando el archivo está.
  - Para cambiarlo, se edita el JSON directamente (el script que lo generó era temporal).
  - **Resuelto, no volver a mencionarlo:** "1O" es 10.
  - **Erratas obvias corregidas con criterio, sin consultar** (el usuario no quiere que se le pregunte lo evidente): "65" sin signo es 65%; "HIP TRHUST" es "Hip thrust"; los descansos que faltan en las semanas 2 a 4 del Día 4 son los de la semana 1; tildes y mayúsculas.
  - Las cantidades que parecían no cuadrar se resolvieron con la posición de cada columna del PDF. Por ejemplo, "Remo invertido TRX o barra" (Día 2) tiene 4 series en la semana 1 y 3 en las demás.
  - **Fiel al PDF:** los nombres quedan como los escribió el entrenador, también "Que me importa" (Día 4). "Remo invertido TRX o barra" (Día 2) y "Remo invertido TRX" (Día 4), y "Pasaje de valla" (Día 2) y "Correctivo pasaje de valla" (Día 4), son ejercicios distintos en el catálogo. Se pueden unificar en el editor. "Correctivo buda cobra" en la semana 4 termina con una serie de 4, como en el PDF.

**Tandas.**

1. **4.1, estructura real: terminada** (versión 0.8.0). Ver el mapa del código.
2. **4.2, lógica del plan con tests: terminada.** Ver `plan.ts` en el mapa del código. No cambia nada visible, así que se subió sin cambiar la versión.
3. **4.3, importar el programa de ejemplo: terminada** (versión 0.9.0).
4. **4.4, pantallas de programa, semana y día: terminada** (versión 0.10.0). Ver el mapa del código.
5. **4.5, pantallas de bloque, ejercicio y serie: terminada** (versión 0.11.0). Ver el mapa del código.
   - Decidido con criterio: un ejercicio nuevo creado desde el buscador se mide en repeticiones (cada serie puede cambiarlo); un bloque nuevo arranca como "Otro" con 90 s de descanso.

## 7. Pendientes generales

- **De `CLAUDE.md` §11:**
  - Archivos de referencia en Word o Excel con la disposición de los ejercicios. Hacen falta antes de la sesión (paso 5) y del Excel.
  - El ícono definitivo.
  - El contenido de las celdas del resumen de RPE.
- **De `DISENO.md` §9:** mostrar las fechas como dd/mm/aaaa aunque el iPhone esté en otro idioma, y el ícono definitivo.
- **Temporales para retirar:**
  - `MaxesTestPanel` (paso 7);
  - `ComponentCatalog`, cuando ya no haga falta.
- **Paso 5:** ajustar los tipos del registro y definir con el usuario la pantalla de sesión, después de recibir sus archivos de referencia.
- **Datos de prueba en el iPhone:** el usuario importó el programa del entrenador; sus máximos de prueba siguen en el panel de Máximos.

## 8. Cómo retomar en una conversación nueva

1. Leer `CLAUDE.md`, `DISENO.md` y este archivo (los dos primeros se cargan solos y este se importa desde `CLAUDE.md`).
2. Confirmar el estado con `git log --oneline | head` y `npm test`. Tienen que pasar todos los tests.
3. Resumirle al usuario en tres o cuatro líneas dónde estamos.
4. Preguntar qué le parecieron las pantallas de la 4.5 en el iPhone y pedirle los archivos de referencia para el paso 5. Con eso, proponer el plan del paso 5 y esperar el "sí".
5. Al cerrar cada tanda, actualizar este archivo y hacer commit.
