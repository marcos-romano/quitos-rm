import { describe, expect, test } from 'vitest'
import { cleanName, normalizeName } from './names.ts'

describe('nombres de ejercicios', () => {
  test('se guardan sin espacios sobrantes', () => {
    expect(cleanName('  Press   plano ')).toBe('Press plano')
  })

  test.each(['Dominadas', 'dominadas', 'DOMINADAS', '  Dominadas ', 'Domínadas'])(
    '"%s" se compara como "dominadas"',
    (name) => {
      expect(normalizeName(name)).toBe('dominadas')
    },
  )

  test('las tildes y mayúsculas no cuentan, las palabras sí', () => {
    expect(normalizeName('Sentadilla BÚLGARA')).toBe('sentadilla bulgara')
    expect(normalizeName('Sentadilla')).not.toBe(normalizeName('Sentadilla búlgara'))
  })
})
