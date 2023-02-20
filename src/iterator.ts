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

  collect(): Array<A> {
    return Array.from(this)
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

  map<B>(f: (a: A) => B): IterableExt<B> {
    return new IterableExt(map(this[INNER], f))
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

  chain<B>(
    ...iterables: ReadonlyArray<Iterable<B> | IterableIterator<B>>
  ): IterableExt<A | B> {
    return new IterableExt(chain(new IterableExt(this[INNER]), ...iterables))
  }

  every(f: (a: A) => boolean): boolean {
    for (const a of this) {
      if (!f(a)) {
        return false
      }
    }
    return true
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

  drop(n: number): IterableExt<A> {
    return new IterableExt(drop(this[INNER], n))
  }

  intersperse(separator: A): IterableExt<A> {
    return new IterableExt(intersperse(this[INNER], separator))
  }

  [Symbol.iterator]() {
    return this
  }
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

function* chain<A, B>(
  iter: IterableIterator<A>,
  ...iterables: ReadonlyArray<Iterable<B> | IterableIterator<B>>
) {
  yield* iter

  for (const iter of iterables) {
    yield* iter
  }
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
