# quitos_RM: contexto para retomar

Parte de situación para que una conversación nueva de Claude Code siga el trabajo sin perder nada. `CLAUDE.md` lo importa, así que se carga solo al empezar cada sesión.

- `CLAUDE.md`: qué es la app (especificación). `DISENO.md`: cómo se ve (fuente de verdad del diseño). Este archivo: dónde estamos, cómo se trabaja y qué sigue. No repite lo que ya dicen esos dos.
- Se actualiza al cerrar cada tanda de trabajo y antes de terminar una conversación: secciones 1, 6 y 7, más lo que haya cambiado.

**Última actualización:** 25/10/2026, al cerrar la tanda 4.1. Versión publicada: 0.8.0.

## 1. Dónde estamos

- **App publicada:** https://marcos-romano.github.io/quitos-rm/, versión 0.8.0. El usuario la tiene instalada en el iPhone y la actualiza con el botón "Actualizar".
- **Versión 1, pasos 1, 2 y 3:** terminados y probados en el iPhone (fundación, modelo de datos con cálculo y base local, diseño y componentes base).
- **Paso 4 (editor del plan):** en curso. La tanda 4.1 (navegación con las cinco pestañas) está terminada y publicada. Sigue la 4.2.
- **Preguntas abiertas al usuario** (hacerlas antes de la tanda 4.2):
  - **Orden de las tandas:** ¿se carga el programa del entrenador antes que las pantallas del editor (opción A, recomendada) o después? No la contestó.
  - **Medida:** ¿el programa tiene ejercicios por tiempo o por distancia, o todo va en repeticiones? Preguntó qué era "medida" y no contestó. Se ofreció revisar el PDF del entrenador.

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
  - `types.ts`: modelo completo. Los tipos del registro (`Session`, `PerformedSet`, `ExerciseEffort`) son provisorios hasta el paso 5. `PrescribedSet` todavía tiene `perSide` y `note`, que se sacan en la tanda 4.2 (sección 6).
  - `load.ts`: cálculo de carga en enteros (centésimas de kg y décimas de porcentaje), con empates hacia arriba. También `resolveIncrement` y las constantes de redondeo.
  - `format.ts`: formato es-AR. `formatNumber`, `formatKg`, `formatLoad` ("85 kg" y "84 exactos"), `parseDecimal` (acepta coma o punto y rechaza "1O"), `formatDayLabel` ("Semana 3 · Día 2"), `toLocalDate` y `formatDate`.
  - `names.ts`: limpia y normaliza nombres, sin tildes ni mayúsculas.
  - `settings.ts`: ajustes por defecto (redondeo de 2,5 kg y recordatorio a los 14 días).
  - `rpe.ts`: tono por valor (1 a 5 verde, 6 a 8 neutro, 9 y 10 rojo) y descripciones. El 5 sale verde pero se describe como "Moderado".
  - `coachDay1Week1.fixture.ts`: el Día 1 · Semana 1 del entrenador, solo para tests.
- `src/db/`: base local IndexedDB con Dexie. Las funciones reciben `db` como parámetro, para poder probarlas.
  - `db.ts`: esquema versión 1 (programs, exercises con `&nameKey` único, maxes, sessions y settings). Al crearse la base carga "Dominadas" con incremento de 1,25 kg.
  - `appDb.ts`: la base única que usa la app.
  - `exercises.ts`, `maxes.ts` (historial; el vigente es el de fecha más reciente), `programs.ts`, `settings.ts` y `persist.ts` (pide almacenamiento persistente).
  - `db.test.ts`: usa `fake-indexeddb`, que se importa primero, y una base nueva por test. Incluye "cerrar y reabrir la app".
- `src/ui/`: pantallas.
  - `App.tsx` (está en `src/`, no en `src/ui/`): la pestaña activa y la `BottomNav`. Las cinco pantallas quedan armadas aunque no se vean (atributo `hidden`), así cambiar de pestaña no pierde nada, y cada pestaña recuerda hasta dónde se bajó.
  - `screens/`: una pantalla por pestaña.
    - `HomeScreen` (título "quitos_RM"), `ProgramScreen` e `HistoryScreen`: textos provisorios ("Llega en el paso 6", "en las próximas tandas del paso 4", "en el paso 7").
    - `MaxesScreen`: envuelve el panel de prueba.
    - `MoreScreen`: versión, "Lista para usar sin conexión" y el botón "Ver componentes", que abre el catálogo como pantalla interna con "←".
  - `usePwa.ts`: registra el service worker, dice si la app funciona sin conexión y si hay versión nueva (modo `prompt`, sin recargas solas), y busca versión nueva al volver a primer plano.
  - `UpdatePrompt.tsx`: aviso "Nueva versión · Actualizar", fijo sobre la navegación.
  - `MaxesTestPanel.tsx`: **temporal** hasta el paso 7. Sirve para cargar máximos y probar el cálculo.
  - `ComponentCatalog.tsx`: **temporal**. Muestra cada componente con sus estados.
  - `components/`: piezas base, con estilos en `components.css`.
    - `Button` (variantes `primary`, `secondary` y `destructive`; acepta `ref`) y `TextField` (con `error`).
    - `Section` (separador sin tarjeta) y `LoadValue`.
    - `Tick` (44 × 44) y `RpeSelector` (dos filas de cinco; tocar el elegido lo borra).
    - `BottomNav` (cinco pestañas con su tipo `Tab`), `SessionBar` y `ConfirmDialog` (arranca con "Cancelar" seleccionado).
    - `Screen`: título de 28 px y, si recibe `onBack`, el botón "←" de 48 × 48. Toda pantalla nueva la usa.
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
- **Series:** **nunca** "N x M". Cada serie se carga y se muestra por separado. "Agregar serie" crea una copia de la anterior, que después se edita. Tampoco hay notación compacta en Excel.
- **Carga calculada:** si la carga es un porcentaje y el ejercicio tiene máximo, al lado se muestran los kg calculados (`LoadValue`).
- **Qué se carga en cada serie** (decidido en la segunda conversación, ya escrito en `CLAUDE.md` 1.2):
  - Medida (repeticiones), carga y descanso.
  - **Sin nota por serie:** una sola nota por ejercicio, opcional.
  - **Sin marca "por lado":** el número cargado es el que vale. El usuario sabe si es por lado o en total.
  - **Sin RPE en el plan:** el RPE es solo el que el usuario marca al terminar cada ejercicio (paso 5).
- **Programa del entrenador:** se carga como **ejemplo** para avanzar; el Excel sigue en la Versión 2.
  - Claude lo transcribe desde el PDF de `referencias/` a `referencias/programa-entrenador.json`, que nunca se publica y no lleva nombres de personas.
  - Se agrega un botón **"Importar programa"** en la pestaña Más. El usuario pasa el archivo al iPhone por AirDrop o Archivos.
  - El PDF tiene inconsistencias que hay que **consultar al usuario** antes de cerrar la transcripción:
    - "1O" con letra O.
    - Porcentajes escritos "65" sin el signo.
    - Cantidades de valores que no cuadran con las series de cada semana.
    - Descansos que solo figuran en la semana 1 de algunos bloques del Día 4.
    - En el Día 4, un ejercicio llamado "QUE ME IMPORTA", que parece un comodín.
    - "HIP TRHUST" mal escrito.

**Tandas.** El orden con la importación como 4.3 sigue sin confirmar (sección 1).

1. **4.1, estructura real: terminada** (versión 0.8.0). Ver el mapa del código.
2. **4.2, lógica del plan con tests** (`src/domain/plan.ts`):
   - Primero, sacar `perSide` y la `note` de `PrescribedSet` (y del fixture del entrenador y sus tests). La nota del ejercicio (`note` de `BlockExercise`) queda.
   - Crear, editar, duplicar, reordenar y eliminar en cada nivel.
   - Duplicar semana completa, con ids nuevos en toda la copia.
   - Agregar serie como copia de la anterior.
   - Confirmar con el usuario si los números de semana se renumeran al reordenar.
3. **4.3, importar el programa de ejemplo:** transcripción, botón en Más y validación. Así las pantallas siguientes se prueban con datos reales.
4. **4.4, pantallas de programa, semana y día:**
   - Lista de programas con el activo marcado. Al crear el primero, queda activo (`activeProgramId` en ajustes).
   - Semanas, con agregar y duplicar.
   - Días, con nombre y texto de preparación.
5. **4.5, pantallas de bloque, ejercicio y serie:**
   - Bloque: nombre, tipo, descanso y sus ejercicios. Cada ejercicio se elige del catálogo con búsqueda o se crea en el momento.
   - Ejercicio: nota del entrenador y sus series.
   - Serie: medida, por lado, carga, descanso propio y nota.

## 7. Pendientes generales

- **De `CLAUDE.md` §11:**
  - Archivos de referencia en Word o Excel con la disposición de los ejercicios. Hacen falta antes de la sesión (paso 5) y del Excel.
  - El ícono definitivo.
  - El contenido de las celdas del resumen de RPE.
- **De `DISENO.md` §9:** mostrar las fechas como dd/mm/aaaa aunque el iPhone esté en otro idioma, y el ícono definitivo.
- **Temporales para retirar:**
  - `MaxesTestPanel` (paso 7);
  - `ComponentCatalog`, cuando ya no haga falta.
- **Paso 5:** ajustar los tipos del registro y definir con el usuario la pantalla de sesión. Conviene hacerlo después de recibir sus archivos de referencia.

## 8. Cómo retomar en una conversación nueva

1. Leer `CLAUDE.md`, `DISENO.md` y este archivo (los dos primeros se cargan solos y este se importa desde `CLAUDE.md`).
2. Confirmar el estado con `git log --oneline | head` y `npm test`. Tienen que pasar todos los tests.
3. Resumirle al usuario en tres o cuatro líneas dónde estamos y hacerle las **preguntas abiertas** de la sección 1.
4. Con eso, proponer el arranque de la tanda 4.2 y esperar el "sí".
5. Al cerrar cada tanda, actualizar este archivo y hacer commit.
