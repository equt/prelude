Array.prototype.exact = function () {
  if (this.length === 1) return this[0]
  const error = Error('More than one element has been found in the array')
  error.name = 'ExactOneElementError'
  throw error
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

Array.prototype.findMap = function <U>(f: (element: unknown) => Nullable<U>) {
  for (const element of this) {
    const mapped = f(element)
    if (isNonNullable(mapped)) return mapped
  }
  return
}

Array.prototype.group = function (f) {
  return this.windows<[unknown, unknown]>(2).reduce<Array<Array<unknown>>>(
    (accumulator, [a, b], i, self) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      accumulator[accumulator.length - 1]!.push(a)
      if (!f(a, b)) accumulator.push([])
      if (i === self.length - 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accumulator[accumulator.length - 1]!.push(b)
      }
      return accumulator
    },
    [[]],
  )
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

Array.prototype.mapWhile = function <U>(f: (element: unknown) => Nullable<U>) {
  const accumulator = []
  for (const element of this) {
    const mapped = f(element)
    if (isNonNullable(mapped)) {
      accumulator.push(mapped)
    } else {
      break
    }
  }
  return accumulator
}

Array.prototype.product = function <U>(other: Array<U>) {
  return this.flatMap(i => other.map<[unknown, U]>(j => [i, j]))
}

Array.prototype.takeWhile = function (f) {
  const accumulator: Array<unknown> = []
  for (const element of this) {
    if (f(element)) {
      accumulator.push(element)
    } else {
      break
    }
  }
  return accumulator
}

Array.prototype.windows = function <W extends Array<unknown> = Array<unknown>>(
  size: number,
): Array<W> {
  if (size > this.length) return []
  const accumulator: Array<Array<unknown>> = []

  for (let i = 0; i < this.length; i++) {
    if (i + (size | 0) > this.length) break
    accumulator.push(this.slice(i, i + (size | 0)))
  }

  return accumulator as Array<W>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
globalThis.absurd = function <A>(_: never): A {
  throw new Error('Boom! `absurd` got called')
}

globalThis.debug = function <A>(x: A): A {
  console.log(x)
  return x
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.hole = absurd as any

globalThis.range = function (start, end) {
  const accumulator: Array<number> = []
  for (let i = start | 0; i < (end | 0); i++) {
    accumulator.push(i)
  }
  return accumulator
}

globalThis.todo = function (message) {
  throw new Error(message ?? 'A function marked as TODO has been called')
}

globalThis.unreachable = function (message) {
  throw new Error(
    message ?? 'A condition branch marked as unreachable has been reached',
  )
}

globalThis.isNullable = function (x): x is undefined | null {
  return x === null || x === undefined
}

globalThis.isNonNullable = function <T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null
}
