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

Array.prototype.product = function <U>(other: Array<U>) {
  return this.flatMap(i => other.map<[unknown, U]>(j => [i, j]))
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

globalThis.debug = function <A>(x: A): A {
  console.log(x)
  return x
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
