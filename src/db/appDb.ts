import { createDatabase } from './db.ts'

/** La base de datos de la app: una sola para todas las pantallas. */
export const db = createDatabase()
