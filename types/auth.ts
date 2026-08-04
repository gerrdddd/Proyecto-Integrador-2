// Tipos de autenticación.
//
// Viven aquí y no dentro de lib/auth/actions.ts ni lib/actions/pos.ts porque
// esos archivos llevan "use server": Next exige que TODO lo que exporte un
// archivo "use server" sea una función async. Un `export type` se borra al
// compilar, pero el chequeo de Next lo marca como error de todas formas.

export type EstadoLogin = { error?: string };
