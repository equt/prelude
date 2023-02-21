import { isNonNullable, Nullable } from '.'

const INNER = Symbol('INNER')

export type IntoIterableExt<A> =
  | ReadonlyArray<A>
  | Iterable<A>
  | Iterator<A, null, never>

export class IterableExt<A> implements Iterable<A> {
  readonly [INNER]: Iterator<A>

  private constructor(readonly iter: Iterator<A>) {
    this[INNER] = iter
  }

  /**
   * Create an {@link IterableExt} from an iterable, iterator, or array.
   *
   * Calling methods on the returned {@link IterableExt} will also consume the passed iterable or
   * iterator but not the array.
   */
  static from<A>(iter: IntoIterableExt<A>): IterableExt<A> {
    if (Symbol.iterator in iter) {
      return new IterableExt(iter[Symbol.iterator]())
    } else if ('next' in iter) {
      return new IterableExt(iter)
    }
    // istanbul ignore next
    return iter
  }

  next(): IteratorResult<A, null> {
    return this[INNER].next()
  }

  /**
   * Chain one or multiple {@link Iterable} or {@link IterableIterator}.
   */
  chain<B>(
    ...iterables: ReadonlyArray<IntoIterableExt<A>>
  ): IterableExt<A | B> {
    return new IterableExt(chain(new IterableExt(this[INNER]), ...iterables))
  }

  /**
   * Iterating over the iterator's elements in a n-size chunk.
   * The last chunk might contain less than n elements.
   *
   * For convenience, this method allows to cast the returned tuple's type.
   */
  chunks<B extends Array<A> = Array<A>>(n: number): IterableExt<B> {
    return new IterableExt(chunks(this[INNER], n))
  }

  /**
   * Repeat the original iterator endlessly.
   *
   * Note that if the iterator is empty, the resulting iterator will also be empty.
   */
  cycle(): IterableExt<A> {
    return new IterableExt(cycle(this[INNER]))
  }

  /**
   * Count the elements number in the iterator.
   */
  count(): number {
    let count = 0,
      next = this[INNER].next()

    while (!next.done) {
      count++
      next = this[INNER].next()
    }

    return count
  }

  /**
   * Drop the first n elements in the iterator.
   */
  drop(n: number): IterableExt<A> {
    return new IterableExt(drop(this[INNER], n))
  }

  /**
   * Drop the element if the `f` returns `true`.
   *
   * Since the element has to be popped out for runing the `f`, the very first element that rejects
   * the `f` will also been removed from the iterator.
   */
  dropWhile(f: (a: A) => boolean): IterableExt<A> {
    return new IterableExt(dropWhile(this[INNER], f))
  }

  /**
   * If all elements in the iterator return `true` for the given `f`, return `true`.
   *
   * It will also return a vacuously `true` for an empty iterator.
   */
  every(f: (a: A) => boolean): boolean {
    for (const a of this) {
      if (!f(a)) {
        return false
      }
    }
    return true
  }

  /**
   * Filter the iterator with the given `f`.
   */
  filter(f: (a: A) => boolean): IterableExt<A> {
    return new IterableExt(filter(this[INNER], f))
  }

  /**
   * Filter the iterator with the given `f` and map the result.
   */
  filterMap<B>(f: (a: A) => Nullable<B>): IterableExt<B> {
    return new IterableExt(filterMap(this[INNER], f))
  }

  /**
   * Find the first element that returns `true` for the given `f`.
   */
  find(f: (a: A) => boolean): Nullable<A> {
    for (const a of this) {
      if (f(a)) {
        return a
      }
    }
    return null
  }

  /**
   * Find the first element that returns a non-null value for the given `f`.
   */
  findMap<B>(f: (a: A) => Nullable<B>): Nullable<B> {
    for (const a of this) {
      const b = f(a)
      if (isNonNullable(b)) {
        return b
      }
    }
    return null
  }

  /**
   * Map elements in the iterator with the given `f` and flatten the result iterable.
   */
  flatMap<B>(f: (a: A) => IntoIterableExt<B>): IterableExt<B> {
    return new IterableExt(flatMap(this[INNER], f))
  }

  /**
   * Iterate over the iterator and call the given `f` for each element.
   */
  forEach(f: (a: A) => void): void {
    for (const a of this) {
      f(a)
    }
  }

  group(f: (a: A, b: A) => boolean): IterableExt<IterableExt<A>> {
    return new IterableExt(group(this[INNER], f))
  }

  /**
   * Intersperse the iterator with the given `separator`.
   */
  intersperse(separator: A): IterableExt<A> {
    return new IterableExt(intersperse(this[INNER], separator))
  }

  /**
   * Call the `Array.prototype.join` on the collected iterator with the `separator`.
   */
  join(separator: string): string {
    return this.toArray().join(separator)
  }

  /**
   * Map the iterator with the given `f`.
   */
  map<B>(f: (a: A) => B): IterableExt<B> {
    return new IterableExt(map(this[INNER], f))
  }

  /**
   * Map the iterator with the given `f` and returns a non-null value for the given `f`.
   */
  mapWhile<B>(f: (a: A) => Nullable<B>): IterableExt<B> {
    return new IterableExt(mapWhile(this[INNER], f))
  }

  /**
   * Create the cartesian product of the iterator with the given `iterable`.
   */
  product<B>(iterable: IntoIterableExt<B>): IterableExt<[A, B]> {
    // FIXME Do not cache the iterable
    const cache = IterableExt.from(iterable).toArray()
    return this.flatMap(a => cache.map(b => [a, b]))
  }

  /**
   * Reduce the iterator with the given `f` and `initial`.
   */
  reduce<B>(f: (accumulator: B, value: A) => B, initial: B): B {
    let accumulator = initial,
      next = this[INNER].next()

    while (!next.done) {
      accumulator = f(accumulator, next.value)
      next = this[INNER].next()
    }

    return accumulator
  }

  /**
   * If any element in the iterator return `true` for the given `f`, return `true`.
   *
   * It will also return a vacuously `false` for an empty iterator.
   */
  some(f: (a: A) => boolean): boolean {
    for (const a of this) {
      if (f(a)) {
        return true
      }
    }
    return false
  }

  /**
   * Take the first n elements in the iterator.
   */
  take(n: number): IterableExt<A> {
    return new IterableExt(take(this[INNER], n))
  }

  /**
   * Take the element if the `f` returns `true`.
   *
   * Since the element has to be popped out for runing the `f`, the very first element that rejects
   * the `f` will also been removed from the iterator.
   */
  takeWhile(f: (a: A) => boolean): IterableExt<A> {
    return new IterableExt(takeWhile(this[INNER], f))
  }

  /**
   * Iterate over the iterator and call the given `f` for each element without consuming.
   */
  tap(f: (a: A) => void): IterableExt<A> {
    return new IterableExt(tap(this[INNER], f))
  }

  /**
   * Collect the iterator into an array.
   */
  toArray(): Array<A> {
    return Array.from(this)
  }

  /**
   * Iterating over the iterator's elements in a fixed-sized n-length contigious overlapping window.
   * If the n is greater than the iterator's length, it will return an empty iterator.
   *
   * For convenience, this method allows to cast the returned tuple's type.
   */
  windows<B extends Array<A> = Array<A>>(n: number): IterableExt<B> {
    return new IterableExt(windows(this[INNER], n))
  }

  /**
   * Zip the iterator with another iterator.
   */
  zip<B>(other: IntoIterableExt<B>): IterableExt<[A, B]> {
    return this.zipWith(other, (a, b) => [a, b])
  }

  /**
   * Zip the iterator with another iterator using the `f`.
   */
  zipWith<B, C>(
    other: IntoIterableExt<B>,
    f: (a: A, b: B) => C,
  ): IterableExt<C> {
    return new IterableExt(zipWith(this[INNER], other, f))
  }

  [Symbol.iterator]() {
    return this
  }
}

function* chain<A, B>(
  iter: IterableIterator<A>,
  ...iterables: ReadonlyArray<IntoIterableExt<B>>
) {
  yield* iter

  for (const iter of iterables) {
    yield* IterableExt.from(iter)
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

  while (true && cache.length !== 0) {
    yield* cache
  }

  return null
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

  next = iter.next()

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

function* flatMap<A, B>(
  iter: Iterator<A, null, never>,
  f: (a: A) => IntoIterableExt<B>,
): Generator<B, null, never> {
  let next = iter.next()

  while (!next.done) {
    yield* IterableExt.from(f(next.value))
    next = iter.next()
  }

  return null
}

function* group<A>(
  iter: Iterator<A, null, never>,
  f: (a: A, b: A) => boolean,
): Generator<IterableExt<A>, null, never> {
  let next = iter.next()
  if (next.done) return null

  let cache = [next.value],
    previous = next.value
  next = iter.next()

  while (!next.done) {
    if (f(previous, next.value)) {
      cache.push(next.value)
    } else {
      yield IterableExt.from(cache)
      cache = [next.value]
    }
    previous = next.value
    next = iter.next()
  }

  if (cache.length !== 0) yield IterableExt.from(cache)

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
  let done = false

  while (n > 0 && !done) {
    const next = iter.next()
    if (next.done) {
      done = true
      return null
    }
    yield next.value
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

function* tap<A>(
  iter: Iterator<A, null, never>,
  f: (a: A) => void,
): Generator<A, null, never> {
  let next = iter.next()

  while (!next.done) {
    f(next.value)
    yield next.value
    next = iter.next()
  }

  return null
}

function* windows<A, B extends Array<A> = Array<A>>(
  iter: Iterator<A, null, never>,
  size: number,
): Generator<B, null, never> {
  let count = size,
    next = iter.next()
  const cache: Array<A> = []

  while (!next.done && count > 0) {
    cache.push(next.value)
    next = iter.next()
    count--
  }

  if (cache.length < size) return null

  yield cache as B

  while (!next.done) {
    cache.shift()
    cache.push(next.value)
    yield cache as B
    next = iter.next()
  }

  return null
}

function* zipWith<A, B, C>(
  one: Iterator<A, null, never>,
  other: IntoIterableExt<B>,
  f: (a: A, b: B) => C,
): Generator<C, null, never> {
  const otherExt = IterableExt.from(other)

  let oneNext = one.next(),
    otherNext = otherExt.next()

  while (!oneNext.done && !otherNext.done) {
    yield f(oneNext.value, otherNext.value)
    oneNext = one.next()
    otherNext = otherExt.next()
  }

  return null
}

/**
 * Create an iterable that immediately completes.
 */
export const empty = <A>(): IterableExt<A> =>
  IterableExt.from({
    [Symbol.iterator]() {
      return {
        next(): IteratorResult<A> {
          return { done: true, value: null }
        },
      }
    },
  })

/**
 * Create an iterable that yields an element exactly once.
 */
export const once = <A>(a: A): IterableExt<A> =>
  IterableExt.from(
    (function* () {
      yield a
    })(),
  )

/**
 * Range from `start` to an optional `end` (exclusive).
 *
 * If the `end` is not provided, the returned iterable will never terminate.
 */
export const range = (start: number, end?: number) =>
  IterableExt.from<number>({
    [Symbol.iterator]() {
      let current = start

      return {
        next() {
          if (end === undefined || (typeof end === 'number' && current < end)) {
            return { done: false, value: current++ }
          } else {
            return { done: true, value: null }
          }
        },
      }
    },
  })
