export type Waitable<A> = Promise<A> | A

export type Nullable<A> = null | undefined | A

export const isNullable = (a: unknown): a is null | undefined =>
  a === null || a === undefined

export const isNonNullable = <A>(a: A): a is NonNullable<A> =>
  a !== null && a !== undefined

export { IterableExt, range, once } from './iterator'
