export type Waitable<A> = Promise<A> | A

export type Nullable<A> = null | undefined | A

export type NonEmptyArray<A> = { 0: A } & Array<A>

export type ReadonlyNonEmptyArray<A> = { readonly 0: A } & ReadonlyArray<A>

export const isNullable = (a: unknown): a is null | undefined =>
  a === null || a === undefined

export const isNonNullable = <A>(a: A): a is NonNullable<A> =>
  a !== null && a !== undefined

/**
 * Exhaustive type checking
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const absurd = <A>(_: never): A => {
  throw new Error('Absurd been called')
}

/**
 * Compile time hole
 */
export const hole = <A>(): A => {
  throw new Error('Compile time hole been called')
}

/**
 * Explicitly mark unreachable code
 */
export const unreachable = <A>(message: string): A => {
  throw new Error(message)
}

/**
 * Explicitly mark TODO code
 */
export const todo = <A>(message: string): A => {
  throw new Error(message)
}

export { IterableExt, range, once } from './iterator'
