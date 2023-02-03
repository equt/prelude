type Waitable<A> = Promise<A> | A

type Nullable<A> = A | undefined | null

type NonEmptyArray<A> = Array<A> & { 0: A }

type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & { readonly 0: A }

/**
 * x falso quodlibet EXPLOSION !!!
 * */
declare function absurd<A>(_: never): A

/**
 * Log the evaluated expression to the console and return the result
 */
declare function debug<A>(x: A): A

/**
 * A type hole
 */
declare function hole<A>(): A

/**
 * Create an array ranges from `start` (inclusive) to `end` (exclusive), both `start` and `end` have to be integers.
 */
declare function range(start: number, end: number): Array<number>

/**
 * Mark the function as not implemented
 */
declare function todo<A>(message?: string): A

/**
 * Mark the condition as unreachable
 */
declare function unreachable<A>(message?: string): A

/**
 * Assert `x` is `undefined` or `null`
 * */
declare function isNullable(x: unknown): x is undefined | null

/**
 * Assert `x` is `NonNullable<T>`
 * */
declare function isNonNullable<T>(x: T): x is NonNullable<T>

interface Array<T> {
  /**
   * If the array contains only one element, return that exact element. Otherwise, throw `ExactOneElementError`.
   */
  exact(): T

  /**
   * Create a shallow copy of the array
   */
  copy(): Array<T>

  /**
   * Chain another array
   */
  chain(other: Array<T>): Array<T>

  /**
   * Return subarrays that each contains a fixed number of elements, determined by `size`. The last chunk will be shorter if there aren't enough elements.
   */
  chunks(size: number): Array<Array<T>>

  /**
   * Mapping the element to an optional new type, then filter out `undefined` and `null`
   */
  filterMap<U>(f: (element: T) => Nullable<U>): Array<U>

  /**
   * Inspect each element in the array.
   */
  inspect(f: (element: T) => void): Array<T>

  /**
   * Insert a particular element betweem each element of the adapted iterator.
   */
  intersperse(element: T): Array<T>

  /**
   * Map elements to another type until the first `Nullable`.
   */
  mapWhile<U>(f: (element: T) => Nullable<U>): Array<U>

  /**
   * Create the cartesian product with another array
   */
  product<U>(other: Array<U>): Array<[T, U]>

  /**
   * Copy elements returning true
   */
  takeWhile(f: (element: T) => boolean): Array<T>

  /**
   *
   * Zip with another array using function. Rest elements will be discarded if lengths of two arrays are not equal.
   */
  zipWith<U, O>(other: Array<U>, f: (a: T, b: U) => O): Array<O>

  /**
   * Zip with another array. Rest elements will be discarded if lengths of two arrays are not equal.
   */
  zip<U>(other: Array<U>): Array<[T, U]>
}