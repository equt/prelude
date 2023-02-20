import { isNonNullable, Nullable } from '.'

const INNER = Symbol('INNER')

export class IterableExt<A> implements Iterable<A> {
  readonly [INNER]: Iterator<A>

  private constructor(readonly iter: Iterator<A>) {
    this[INNER] = iter
  }

  static from<A>(array: ReadonlyArray<A>): IterableExt<A>
  static from<A>(iter: Iterable<A>): IterableExt<A>
  static from<A>(iter: Iterable<A> | ReadonlyArray<A>) {
    if (Symbol.iterator in iter) {
      return new IterableExt(iter[Symbol.iterator]())
    }
    // istanbul ignore next
    throw new Error()
  }

  next(): IteratorResult<A, null> {
    return this[INNER].next()
  }

  chain<B>(
    ...iterables: ReadonlyArray<Iterable<B> | IterableIterator<B>>
  ): IterableExt<A | B> {
    return new IterableExt(chain(new IterableExt(this[INNER]), ...iterables))
  }

  chunks<B extends Array<A> = Array<A>>(n: number): IterableExt<B> {
    return new IterableExt(chunks(this[INNER], n))
  }

  cycle(): IterableExt<A> {
    return new IterableExt(cycle(this[INNER]))
  }

  count(): number {
    let count = 0,
      next = this[INNER].next()

    while (!next.done) {
      count++
      next = this[INNER].next()
    }

    return count
  }

  drop(n: number): IterableExt<A> {
    return new IterableExt(drop(this[INNER], n))
  }

  dropWhile(f: (a: A) => boolean): IterableExt<A> {
    return new IterableExt(dropWhile(this[INNER], f))
  }

  every(f: (a: A) => boolean): boolean {
    for (const a of this) {
      if (!f(a)) {
        return false
      }
    }
    return true
  }

  filter(f: (a: A) => boolean): IterableExt<A> {
    return new IterableExt(filter(this[INNER], f))
  }

  filterMap<B>(f: (a: A) => Nullable<B>): IterableExt<B> {
    return new IterableExt(filterMap(this[INNER], f))
  }

  find(f: (a: A) => boolean): Nullable<A> {
    for (const a of this) {
      if (f(a)) {
        return a
      }
    }
    return null
  }

  findMap<B>(f: (a: A) => Nullable<B>): Nullable<B> {
    for (const a of this) {
      const b = f(a)
      if (isNonNullable(b)) {
        return b
      }
    }
    return null
  }

  forEach(f: (a: A) => void): void {
    for (const a of this) {
      f(a)
    }
  }

  intersperse(separator: A): IterableExt<A> {
    return new IterableExt(intersperse(this[INNER], separator))
  }

  join(separator: string): string {
    return this.toArray().join(separator)
  }

  map<B>(f: (a: A) => B): IterableExt<B> {
    return new IterableExt(map(this[INNER], f))
  }

  mapWhile<B>(f: (a: A) => Nullable<B>): IterableExt<B> {
    return new IterableExt(mapWhile(this[INNER], f))
  }

  reduce<B>(f: (accumulator: B, value: A) => B, initial: B): B {
    let accumulator = initial,
      next = this[INNER].next()

    while (!next.done) {
      accumulator = f(accumulator, next.value)
      next = this[INNER].next()
    }

    return accumulator
  }

  some(f: (a: A) => boolean): boolean {
    for (const a of this) {
      if (f(a)) {
        return true
      }
    }
    return false
  }

  take(n: number): IterableExt<A> {
    return new IterableExt(take(this[INNER], n))
  }

  takeWhile(f: (a: A) => boolean): IterableExt<A> {
    return new IterableExt(takeWhile(this[INNER], f))
  }

  toArray(): Array<A> {
    return Array.from(this)
  }

  zip<B>(other: Iterable<B>): IterableExt<[A, B]> {
    return this.zipWith(other, (a, b) => [a, b])
  }

  zipWith<B, C>(other: Iterable<B>, f: (a: A, b: B) => C): IterableExt<C> {
    return new IterableExt(zipWith(this[INNER], other[Symbol.iterator](), f))
  }

  [Symbol.iterator]() {
    return this
  }
}

function* chain<A, B>(
  iter: IterableIterator<A>,
  ...iterables: ReadonlyArray<Iterable<B> | IterableIterator<B>>
) {
  yield* iter

  for (const iter of iterables) {
    yield* iter
  }
}

function* cycle<A>(iter: Iterator<A, null, never>): Generator<A, null, never> {
  const cache: Array<A> = []

  let next = iter.next()

  while (!next.done) {
    cache.push(next.value)
    yield next.value
    next = iter.next()
  }

  while (true) {
    yield* cache
  }
}

function* chunks<A, B extends Array<A> = Array<A>>(
  iter: Iterator<A, null, never>,
  size: number,
): Generator<B, null, never> {
  let next = iter.next(),
    chunk: Array<A> = []

  while (!next.done) {
    chunk.push(next.value)
    next = iter.next()

    if (chunk.length === size) {
      yield chunk as B
      chunk = []
    }
  }

  if (chunk.length > 0) {
    yield chunk as B
  }

  return null
}

function* drop<A>(
  iter: Iterator<A, null, never>,
  n: number,
): Generator<A, null, never> {
  let next = iter.next()

  while (!next.done && n > 0) {
    next = iter.next()
    n--
  }

  while (!next.done) {
    yield next.value
    next = iter.next()
  }

  return null
}

function* dropWhile<A>(
  iter: Iterator<A, null, never>,
  f: (a: A) => boolean,
): Generator<A, null, never> {
  let next = iter.next()

  while (!next.done && f(next.value)) {
    next = iter.next()
  }

  while (!next.done) {
    yield next.value
    next = iter.next()
  }

  return null
}

function* filter<A>(
  iter: Iterator<A, null, never>,
  f: (a: A) => boolean,
): Generator<A, null, never> {
  let next = iter.next()

  while (!next.done) {
    if (f(next.value)) {
      yield next.value
    }
    next = iter.next()
  }

  return null
}

function* filterMap<A, B>(
  iter: Iterator<A, null, never>,
  f: (a: A) => Nullable<B>,
): Generator<B, null, never> {
  let next = iter.next()

  while (!next.done) {
    const b = f(next.value)

    if (isNonNullable(b)) {
      yield b
    }

    next = iter.next()
  }

  return null
}

function* intersperse<A>(iter: Iterator<A, null, never>, separator: A) {
  let next = iter.next()

  if (!next.done) {
    yield next.value
    next = iter.next()
  }

  while (!next.done) {
    yield separator
    yield next.value
    next = iter.next()
  }

  return null
}

function* map<A, B>(
  iter: Iterator<A, null, never>,
  f: (a: A) => B,
): Generator<B, null, never> {
  let next = iter.next()

  while (!next.done) {
    yield f(next.value)
    next = iter.next()
  }

  return null
}

function* mapWhile<A, B>(
  iter: Iterator<A, null, never>,
  f: (a: A) => Nullable<B>,
): Generator<B, null, never> {
  let next = iter.next()

  while (!next.done) {
    const b = f(next.value)

    if (isNonNullable(b)) {
      yield b
    } else {
      return null
    }

    next = iter.next()
  }

  return null
}

function* take<A>(
  iter: Iterator<A, null, never>,
  n: number,
): Generator<A, null, never> {
  let next = iter.next()

  while (!next.done && n > 0) {
    yield next.value
    next = iter.next()
    n--
  }

  return null
}

function* takeWhile<A>(
  iter: Iterator<A, null, never>,
  f: (a: A) => boolean,
): Generator<A, null, never> {
  let next = iter.next()

  while (!next.done && f(next.value)) {
    yield next.value
    next = iter.next()
  }

  return null
}

function* zipWith<A, B, C>(
  one: Iterator<A, null, never>,
  other: Iterator<B, null, never>,
  f: (a: A, b: B) => C,
): Generator<C, null, never> {
  let oneNext = one.next(),
    otherNext = other.next()

  while (!oneNext.done && !otherNext.done) {
    yield f(oneNext.value, otherNext.value)
    oneNext = one.next()
    otherNext = other.next()
  }

  return null
}

export const once = <A>(a: A): IterableExt<A> => IterableExt.from([a])

export const range = (start: number, end?: number) =>
  IterableExt.from<number>({
    [Symbol.iterator]() {
      let current = start

      return {
        next() {
          if (end === undefined || (typeof end === 'number' && current < end)) {
            return { done: false, value: current++ }
          } else {
            return { done: true, value: undefined }
          }
        },
      }
    },
  })
