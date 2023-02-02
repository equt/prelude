export {}

declare global {
  type Waitable<A> = Promise<A> | A

  type Nullable<A> = A | undefined | null

  /**
   * Create an array ranges from `start` (inclusive) to `end` (exclusive), both `start` and `end` have to be integers.
   */
  function range(start: number, end: number): Array<number>

  /**
   * Assert `x` is `undefined` or `null`
   * */
  function isNullable(x: unknown): x is undefined | null

  /**
   * Assert `x` is `NonNullable<T>`
   * */
  function isNonNullable<T>(x: T): x is NonNullable<T>

  interface Array<T> {
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
     *
     * Zip with another array using function. Rest elements will be discarded if lengths of two arrays are not equal.
     */
    zipWith<U, O>(other: Array<U>, f: (a: T, b: U) => O): Array<O>

    /**
     * Zip with another array. Rest elements will be discarded if lengths of two arrays are not equal.
     */
    zip<U>(other: Array<U>): Array<[T, U]>
  }
}

Array.prototype.copy = function () {
  return [...this]
}

Array.prototype.chain = function (other) {
  return [...this, ...other]
}

Array.prototype.chunks = function (size) {
  return this.reduce((accumulator, current, index) => {
    if (index % size === 0) accumulator.push([])
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulator[accumulator.length - 1]!.push(current)
    return accumulator
  }, [])
}

Array.prototype.filterMap = function <U>(f: (element: unknown) => Nullable<U>) {
  return this.map(f).filter(isNonNullable)
}

Array.prototype.inspect = function (f) {
  this.forEach(f)
  return this
}

Array.prototype.intersperse = function (element) {
  return this.reduce((accumulator, current, index) => {
    accumulator.push(current)
    if (index !== this.length - 1) accumulator.push(element)
    return accumulator
  }, [])
}

Array.prototype.zipWith = function <U, O>(
  other: Array<U>,
  f: (a: unknown, b: U) => O,
) {
  const accumulator: Array<O> = [],
    length = Math.min(this.length, other.length)
  for (let index = 0; index < length; index++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulator[index] = f(this[index], other[index]!)
  }
  return accumulator
}

Array.prototype.zip = function (other) {
  return this.zipWith(other, (a, b) => [a, b])
}

globalThis.range = function (start, end) {
  const accumulator: Array<number> = []
  for (let i = start | 0; i < (end | 0); i++) {
    accumulator.push(i)
  }
  return accumulator
}

globalThis.isNullable = function (x): x is undefined | null {
  return x === null || x === undefined
}

globalThis.isNonNullable = function <T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null
}
