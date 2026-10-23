// Datos de prueba: Día 1 · Semana 1 del programa del entrenador (referencias/),
// el caso de referencia de CLAUDE.md §7. Solo lo usan los tests.

import type { Day, Exercise, Load, MeasureKind, PrescribedSet } from './types.ts'

const FREE: Load = { kind: 'free' }

function exercise(id: string, name: string, measure: MeasureKind = 'reps'): Exercise {
  return { id, name, nameKey: id, measure }
}

/** Una serie por cada valor de la lista; la posición es el número de ronda. */
function sets(
  prefix: string,
  kind: MeasureKind,
  values: number[],
  options: { perSide?: boolean; percents?: number[] } = {},
): PrescribedSet[] {
  return values.map((value, i) => ({
    id: `${prefix}-${i + 1}`,
    measure: { kind, value },
    perSide: options.perSide ?? false,
    load: options.percents ? { kind: 'percent', percent: options.percents[i] } : FREE,
  }))
}

export const coachExercises: Exercise[] = [
  exercise('arranque', 'Arranque'),
  exercise('wall-ball', 'Wall ball'),
  { ...exercise('dominadas', 'Dominadas'), roundingIncrement: 1.25 },
  exercise('press-landmine', 'Press landmine'),
  exercise('buda-cobra', 'Correctivo buda cobra'),
  exercise('sentadilla', 'Sentadilla'),
  exercise('isquio-isometrico', 'Isquio isométrico', 'time'),
  exercise('psoas-estocada', 'Correctivo psoas en estocada + isquio'),
  exercise('triceps-fondo', 'Tríceps fondo'),
  exercise('vuelos-laterales', 'Vuelos laterales'),
  exercise('caminata-granjero', 'Caminata de granjero', 'distance'),
]

export const coachDay1Week1: Day = {
  id: 'w1-d1',
  name: 'Día 1',
  prep: "5' foam roll libre, 5' movilidad articular general, 5' flexibilidad general",
  blocks: [
    {
      id: 'potencia',
      name: 'Potencia',
      type: 'power',
      restSec: 120,
      exercises: [
        {
          id: 'potencia-arranque',
          exerciseId: 'arranque',
          note: 'Si la técnica no es buena: opción despegue, cargada, etc.',
          sets: sets('arranque', 'reps', [6, 5, 4, 4]),
        },
        { id: 'potencia-wall-ball', exerciseId: 'wall-ball', sets: sets('wall-ball', 'reps', [4, 4, 4, 4]) },
      ],
    },
    {
      id: 'fuerza-1',
      name: 'Fuerza 1',
      type: 'strength',
      restSec: 180,
      exercises: [
        {
          id: 'fuerza-1-dominadas',
          exerciseId: 'dominadas',
          sets: sets('dominadas', 'reps', [8, 8, 8, 8], { percents: [65, 65, 70, 70] }),
        },
        {
          id: 'fuerza-1-press-landmine',
          exerciseId: 'press-landmine',
          sets: sets('press-landmine', 'reps', [6, 6, 6, 6], { perSide: true }),
        },
        { id: 'fuerza-1-buda-cobra', exerciseId: 'buda-cobra', sets: sets('buda-cobra', 'reps', [3, 3, 3, 3]) },
      ],
    },
    {
      id: 'fuerza-2',
      name: 'Fuerza 2',
      type: 'strength',
      restSec: 180,
      exercises: [
        {
          id: 'fuerza-2-sentadilla',
          exerciseId: 'sentadilla',
          sets: sets('sentadilla', 'reps', [8, 8, 8, 8], { percents: [65, 65, 70, 70] }),
        },
        {
          id: 'fuerza-2-isquio-isometrico',
          exerciseId: 'isquio-isometrico',
          sets: sets('isquio-isometrico', 'time', [30, 30, 30, 30]),
        },
        {
          id: 'fuerza-2-psoas-estocada',
          exerciseId: 'psoas-estocada',
          sets: sets('psoas-estocada', 'reps', [4, 4, 4, 4], { perSide: true }),
        },
      ],
    },
    {
      id: 'estructura',
      name: 'Estructura',
      type: 'structure',
      restSec: 90,
      exercises: [
        { id: 'estructura-triceps-fondo', exerciseId: 'triceps-fondo', sets: sets('triceps-fondo', 'reps', [8, 8, 8]) },
        {
          id: 'estructura-vuelos-laterales',
          exerciseId: 'vuelos-laterales',
          sets: sets('vuelos-laterales', 'reps', [8, 8, 8]),
        },
        {
          id: 'estructura-caminata-granjero',
          exerciseId: 'caminata-granjero',
          sets: sets('caminata-granjero', 'distance', [15, 15, 15]),
        },
      ],
    },
  ],
}
